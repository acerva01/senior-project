var currentView = null;
var viewStack = new Array();
var maxHistory = 20;

var LoginView;

/*
 * Events
 */
var Event;
var EventView;
var TwoWeekView;
var AddEventView;
var Subscription;
var Sub;

/*
 * User Settings
 */
var UserProfileView;
var UserSubscriptionView;
var EventSubView;

/*
 * Calendar View
 */
var CalendarView;
var CalendarEventView;
var CalendarListView;

/**
 * All views 
 */

var appViews = {
	"EventView": 			function(){return new EventView;},
	"TwoWeekView": 			function(){return new TwoWeekView;},
	"AddEventView": 		function(){return new AddEventView;},
	"UserProfileView": 		function(){return new UserProfileView;},
	"UserSubscriptionView": function(){return new UserSubscriptionView;},
	"EventSubView": 		function(){return new EventSubView;},
	"CalendarView": 		function(){return new CalendarView;},
	"LoginView": 			function(){return new LoginView;},
};

var appViewTitles = {
	"EventView": 			"",
	"TwoWeekView": 			"Two Week View",
	"AddEventView": 		"Add An Event",
	"UserProfileView": 		"Profile",
	"UserSubscriptionView": "Subscriptions",
	"EventSubView": 		"",
	"CalendarView": 		"Event Calendar",
	"LoginView": 			"Login",
};

/**
 * History 
 */
var appHistory = new Array();

function toggleBackButton() {
	if(appHistory.length <= 1) {
		console.info("Disabling back button");
		$("#back-button").prop("disabled", true).addClass("ui-state-disabled");
	}
	else {
		$("#back-button").removeAttr("disabled").removeClass("ui-state-disabled");
	}
}

function destroyView(view) {
	if(view) {
	    //COMPLETELY UNBIND THE VIEW
	    view.undelegateEvents();
	
	    //view.$el.removeData().unbind(); 
	
	    //Remove view from DOM. NOTE: This also deleted the 'content' div, thus, no views could attach to it. 
	    //view.remove();  
    	//Parse.View.prototype.remove.call(view);
    	delete view;
    	
    	// if($("div.content").length == 0) {
    		// $("#main-header").after("<div class='content'></div>");
    		// $("#page").trigger('create');
    	// }
	}
}

function destroyCurrentView() {
	destroyView(viewStack.pop());
}

function pushView(newView) {
	viewStack.push(newView);
}

function replaceView(newView) {
	$("#header-title").html(appViewTitles[newView]);
	//destroyView(viewStack.pop());
	//viewStack.push(newView);
	if(appHistory.length > 1) {
		destroyView(currentView);
	}
	
	// If we exceed the max history cache, dump oldest entry.
	if(appHistory.length > maxHistory) {
		console.info("Dumping old history. That's funny somehow.");
		appHistory.shift();
	}
	
	//console.info(newView + " " + typeof newView);
	//console.info(appViews[newView]);
	appHistory.push(newView);
	currentView = appViews[newView]();
	
	toggleBackButton();
	//console.info(appHistory[appHistory.length-1]);
}

function changeView(newView) {
	$("#externalpanel").panel("close");
	$("#settings-footer").css("display", "none");
	replaceView(newView);
	console.info(appHistory);
};

function goBack() {
	if(appHistory.length > 1) {
		appHistory.pop();
		console.info(appHistory);
		console.info("Going back to: " + appHistory[appHistory.length-1]);
		changeView(appHistory[appHistory.length-1]);
		// Don't want to re-add the current view that we just went back to, to the history
		appHistory.pop();
		console.info(appHistory);
	}
	
	toggleBackButton();
}

function openCalendar() {
	//$("#externalpanel").panel("close");
	//$('#display-calendar').attr("data-options", "{'mode': 'calbox', 'dialogForce': true}");
	$('#display-calendar').datebox('open');
}

/*
 * Date functions
 */
function clearTime(date) {
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
}

function appendHighDate(baseStr, newDate, last) {
	last = typeof last !== 'undefined' ? last : false;
	
	var baseStr = baseStr + "\"" + newDate +"\",";
	
	if(last) {
		baseStr = baseStr.slice(0, baseStr.length - 1);
	}
	
	return baseStr;
}


$(function(){

	Parse.$ = jQuery;
	
	Parse.initialize("YLd15d5BJbPaS7tSgNlu3xEKqGncBEj52ZbFbyr0", "4SlWcqTqRapDZOwTh1ZVeSg96vqTRhon4ZPROvjg");

	FastClick.attach(document.body);
	
	function activateFooter(id) {
		$("#profile-settings").removeClass("ui-btn-active"); 
		$("#settings-settings").removeClass("ui-btn-active"); 
		$("#subs-settings").removeClass("ui-btn-active"); 
		
		$("#" + id + "-settings").addClass("ui-btn ui-link ui-btn-active"); 
		$("#settings-footer").css("display", "block");
	};


	$("#menu-add-event").click(function(){changeView("AddEventView"); return false;});
	$("#menu-view-events").click(function(){changeView("TwoWeekView"); return false;});
	$("#event-calendar").click(function(){changeView("CalendarView"); return false;});
	
	
	$("#menu-account-profile").click(function(){changeView("UserProfileView"); activateFooter("profile");return false;});
	$("#menu-account-settings").click(function(){changeView("UserProfileView"); activateFooter("settings");return false;});
	$("#menu-account-subs").click(function(){changeView("UserSubscriptionView"); activateFooter("subs");return false;});
	
	// $("#menu-account-settings").click(function(){
		// $("#profile-settings").attr("class", "ui-btn ui-link ui-btn-active"); 
		// changeView(new UserProfileView); 
		// $("#settings-footer").css("display", "block");
		// return false;
	// });
	
	$("#page").on("swiperight", function(){$("#externalpanel").panel("open"); return false;});
	$.event.special.swipe.verticalDistanceThreshold = 25;
	
	
	// $('#display-calendar').bind('datebox', function(event, passed) {
		// if(passed.method == "set") {
			// console.info(event);
			// console.info(passed);
			// console.info(passed.value);
			// console.info(moment(passed.value, "YYYY-MM-DD"));
			// pushView(new CalendarListView({eventDate: moment(passed.value, "YYYY-MM-DD")}));
			// e.stopPropagation();
    	// }
  	// });
	
	
});