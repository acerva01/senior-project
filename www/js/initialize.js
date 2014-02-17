var currentView = null;
var viewStack = new Array();

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

function destroyView(view) {
	if(view) {
	    //COMPLETELY UNBIND THE VIEW
	    view.undelegateEvents();
	
	    //view.$el.removeData().unbind(); 
	
	    //Remove view from DOM. NOTE: This also deleted the 'content' div, thus, no views could attach to it. 
	    //view.remove();  
    	//Parse.View.prototype.remove.call(view);
    	delete view;
	}
}

function replaceView(newView) {
	destroyView(viewStack.pop());
	viewStack.push(newView);
}
	
// function openAddEvent() {
	// $("#externalpanel").panel("close");
	// replaceView(new AddEventView);
	// //new AddEventView;
// };
// 
// function openViewEvents() {
	// $("#externalpanel").panel("close");
// 	
	// //new TwoWeekView;
// };

function changeView(newView) {
	$("#externalpanel").panel("close");
	$("#settings-footer").css("display", "none");
	replaceView(newView);
};

/*
 * Date functions
 */
function clearTime(date) {
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
}

$(function(){

	Parse.$ = jQuery;
	
	Parse.initialize("YLd15d5BJbPaS7tSgNlu3xEKqGncBEj52ZbFbyr0", "4SlWcqTqRapDZOwTh1ZVeSg96vqTRhon4ZPROvjg");

	FastClick.attach(document.body);


	$("#menu-add-event").click(function(){changeView(new AddEventView); return false;});
	$("#menu-view-events").click(function(){changeView(new TwoWeekView); return false;});
	$("#menu-account-settings").click(function(){
		$("#profile-settings").attr("class", "ui-btn ui-link ui-btn-active"); 
		changeView(new UserProfileView); 
		$("#settings-footer").css("display", "block");
		return false;
	});
	
	$("#page").on("swiperight", function(){$("#externalpanel").panel("open"); return false;});
	$.event.special.swipe.verticalDistanceThreshold = 15;
	
	
	
	
	
	
	
	
});