/**
 * @author Alejandro
 */
var chosenPrayer = 0;
var menuInited = false;
var prayerMenuInited = false;
var houseMenuInited = false;

var currentView = null;

var viewStack = new Array();



console.log("Hallo!");

function setPrayer(type) {
    chosenPrayer = type;
    console.log("Prayer set! " + type);
}

function getPrayer() {
    console.log("Prayer got! " + chosenPrayer);
    return chosenPrayer;
}

$(function(){

	Parse.$ = jQuery;
	
	Parse.initialize("hnnS9Xh0mXWnb9UGmVpaeT2VXC9aEbtWPE74oIph", "t3Y2KNpEDlk1wg9t6PxAo0ZdWbAvDCC9sX2AkNIX");
	
	FastClick.attach(document.body);
	
	function destroyView(view) {
	    //COMPLETELY UNBIND THE VIEW
	    view.undelegateEvents();
	
	    view.$el.removeData().unbind(); 
	
	    //Remove view from DOM
	    view.remove();  
	    Parse.View.prototype.remove.call(view);
	
    }
    
    function replaceView(newView) {
    	destroyView(viewStack.pop());
		viewStack.push(newView);
    }
	
	function openAddEvent() {
		$("#externalpanel").panel("close");
		//replaceView(new AddEventView);
		new AddEventView;
	};
	
	function openViewEvents() {
		$("#externalpanel").panel("close");
		// replaceView(new TwoWeekView);
		new TwoWeekView;
	};

	
	$("#menu-add-event").click(function(){openAddEvent(); return false;});
	$("#menu-view-events").click(function(){openViewEvents(); return false;});
	
	var Event = Parse.Object.extend("Event", {
		defaults: {
			name:   "Default",
			desc:   "Default",
			start:  new Date(),
			end:    new Date(),
			invite: false,
			recur:  false,
			repeat: {'Su':false, 
					 'Mo':false, 
					 'Tu':false, 
					 'We':false, 
					 'Th':false, 
					 'Fr':false, 
					 'Sa':false
					},
			each:	0,
			user:   Parse.User.current(),
    		ACL:    new Parse.ACL(Parse.User.current())
		},

	    initialize: function() {
	      // if (!this.get("content")) {
	        // this.set({"content": this.defaults.content});
	      // }
	    }
	});
	
	
	var EventView = Parse.View.extend({		
		el: "<div class='event-item'>",
		
		template: _.template($("#event-item-template").html()),
		
		render: function() {
		  console.log(this.model.get('start').getTime());
		  
		  var startObj = this.model.get('start');
		  var startDate = startObj.toLocaleDateString();
		  var startTime = startObj.toLocaleTimeString();
		  var start = startDate.slice(0, startDate.lastIndexOf(",")) + " at ";
		  start 	= start + startTime.slice(0, startTime.lastIndexOf(":")) + startTime.slice(startTime.lastIndexOf(" "), startTime.length);
		  
		  var endObj = this.model.get('end');
		  var endDate = endObj.toLocaleDateString();
		  var endTime = endObj.toLocaleTimeString();
		  var end	= endDate.slice(0, endDate.lastIndexOf(",")) + " at ";
		  end 		= end + endTime.slice(0, endTime.lastIndexOf(":")) + endTime.slice(endTime.lastIndexOf(" "), endTime.length);
		  
		  var name = this.model.get('name');
		  var desc = this.model.get('desc');
		  
	      $(this.el).html(this.template({
	      	name: name,
	      	desc: desc,
	      	start: start,
	      	end: end
	      }));
	      return this;
	    }
    
	});
	
	var EventList = Parse.Collection.extend({
		// Reference to this collection's model.
	    model: Event
	
	    
	    // comparator: function(eventModel) {
	      // return (this.model.get('start').getTime() <= eventModel.get('start').getTime()) ? -1 : 1;
	    // }
	});
	
	var TwoWeekView = Parse.View.extend({
		
		el: ".content",
		
		initialize: function() {
		  	var self = this;
		  	
		  	this.$el.html("<h3>Events</h3><br>");
			
			var query = new Parse.Query(Event);
			query.find({
			  	success: function(results) {
			  		self.displayEvents(self, results);
			  	},
			  	error: function(error) {
			    	console.error("Error retrieving events: " + error.code + " " + error.message);
			  	}
		  	});
		},
		
		displayEvents: function (self, results) {
			for (var i = 0; i < results.length; i++) {
		      var event = results[i];
		      
		      var view = new EventView({model: event});
			  self.$el.append(view.render().el);
		    }
		    
		    self.$el.trigger('create');
		},
		
		render: function() {
			return this;
		}
	});
	
	/*
	
		FIXME: 	User settings page
					- Have a footer to navigate?
					- Push notifications
					- Edit subscriptions/events
						- Unsubscribe from just one instance?
				Proper Navigation between "pages"
				Theme-ing
				Push Notifications
				Polishing
					- On subcribe, disable button and say "Subscribed!"
					- Allow opening of only 1 event at a time. Auto-close others.
					- Indicate success/failure of event submit
	
	
		FIXME: For invite only, make sure a user's calendar doesn't include
		events they were not invited to.
	
		Consider make events that occur on, say, every 2nd Friday, manually input.
		These would be generated on the calendar as the user viewed it. Simple enough.
		Peoples Kitchen generator
		Vesper's Adoration generator
		Bible Study generator
		
		
		FIXME: User Settings - Event notification (15min advanced warning? 30min? They choose)
		
		FIXME: 	- Add "This event recurs every...."
				- Add another button "Subscribe to All" or "Subscribe once"
	
	*/
	
	var UserProfileView = Parse.View.extend({
		el: ".content",
		
		initialize: function() {
			var self = this;
		  	
		  	this.$el.html("<h3>Events</h3><br>");
			
			var query = new Parse.Query(Event);
			query.find({
			  	success: function(results) {
			  		self.displayEvents(self, results);
			  	},
			  	error: function(error) {
			    	console.error("Error retrieving events: " + error.code + " " + error.message);
			  	}
		  	});
		},
		
		render: function() {
			return this;
		}
	});
	
	var UserSubscriptionView = Parse.View.extend({
		el: ".content",
		
		initialize: function() {
			var self = this;
		  	
		  	this.$el.html("<h3>Events</h3><br>");
			
			var query = new Parse.Query(Subscription);
			query.find({
			  	success: function(results) {
			  		self.displayEvents(self, results);
			  	},
			  	error: function(error) {
			    	console.error("Error retrieving events: " + error.code + " " + error.message);
			  	}
		  	});
		},
		
		render: function() {
			return this;	
		}
	});
	
	
	
	var AddEventView = Parse.View.extend({
		events: {
			"click input.add-event": "saveEvent",
			"change #event-recur": "toggleRecur"
		},
		
		el: ".content",
		
		initialize: function() {
			_.bindAll(this, "saveEvent");
	        this.$el.html(_.template($("#add-event-template").html()));
	        
	        this.eventName  = this.$('#event-name');
	        this.eventDesc  = this.$('#event-desc');
	        this.invite		= this.$('#event-anyone');
	        this.recur		= this.$('#event-recur');
	        this.start		= this.$('#event-start');
	        this.startTime	= this.$('#start-time');
	        this.endTime	= this.$('#endTime');
	        //this.visible	= this.$('#event-recurrence').css("display");
	        // $("#event-invitation :radio:checked").val();
	        // $("#event-recurring  :checkbox:checked").val();
	        // var eventName = this.$('#event-name');
	        // var eventName = this.$('#event-name');
	        // var eventName = this.$('#event-name');
	        this.$('#event-recurrence').css("display", "none");	        
			this.render();
		},
		
		toggleRecur: function(e) {
			console.log(this.$('#event-recurrence').css("display"));
			if(this.$('#event-recurrence').css("display") == "none") {
				this.$('#event-recurrence').css("display", "block");
			}
			else {
				this.$("#event-recurrence").css("display", "none");
			}
		},
		
		saveEvent: function(e) {
			// console.log($("#event-invitation :radio:checked").val());
			// console.log($("#event-recurring  :checkbox:checked").val());
			this.model.save({
				name: 	this.eventName.val(),
				desc: 	this.eventDesc.val(),
				invite: (this.invite.val() ? true : false),
				recur:	(this.recur.val()  ? true : false),
				start:	this.createDate(this.start.val(), this.startTime.val())
			});
		},
		//
		//
		// 		FIXME: REMEMBER TO FIX UTC TIME ISSUES
		//
		//
		createDate: function(startDate, timeString) {
			console.log(startDate);
			console.log(timeString);
			
			var newDate = new Date(Date.parse(startDate));
		    newDate.setHours(0);
		    newDate.setMinutes(0);
		    newDate.setSeconds(0);
		    newDate.setMilliseconds(0);
		    
		    var hours = timeString.slice(0,2);
		    var minutes = timeString.slice(3,5);
		    
		    if(hours.charAt(0 == '0')) {
		    	hours = hours.slice(1,1);
		    }
		    
		    newDate.setHours(hours);
		    newDate.setMinutes(minutes);
		    
		    console.log(newDate);
		    
		    return newDate;
		},
	
	    render: function() {
	   	  	this.$el.trigger('create');
	      	this.delegateEvents();
		  	return this;
	    }
	});
	
	var LoginView = Parse.View.extend({
	    events: {
	      "submit form.login-form": "logIn",
	      "submit form.signup-form": "signUp"
	    },
	
	    el: ".content",
	    
	    initialize: function() {
	      _.bindAll(this, "logIn", "signUp");
	      this.render();
	    },
	
	    logIn: function(e) {
	      var self = this;
	      var username = this.$("#login-username").val();
	      var password = this.$("#login-password").val();
	      
	      
	      console.log("Logging in");
	      
	      Parse.User.logIn(username, password, {
	        success: function(user) {
	      	  currentView = new AddEventView({model: (new Event())});
	          self.undelegateEvents();
	          delete self;
	        },
	
	        error: function(user, error) {
	          self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
	          this.$(".login-form button").removeAttr("disabled");
	        }
	      });
	
	      this.$(".login-form button").attr("disabled", "disabled");
	
	      return false;
	    },
	
	    signUp: function(e) {
	      var self = this;
	      var username = this.$("#signup-username").val();
	      var password = this.$("#signup-password").val();
	      
	      Parse.User.signUp(username, password, { ACL: new Parse.ACL() }, {
	        success: function(user) {
	          new AddEventView({model: (new Event())});
	          self.undelegateEvents();
	          delete self;
	        },
	
	        error: function(user, error) {
	          self.$(".signup-form .error").html(error.message).show();
	          this.$(".signup-form button").removeAttr("disabled");
	        }
	      });
	
	      this.$(".signup-form button").attr("disabled", "disabled");
	
	      return false;
	    },
	
	    render: function() {
	      this.$el.html(_.template($("#login-template").html())).trigger('create');
	      this.delegateEvents();
	    }
	  });
	  
	
	viewStack.push(new LoginView);
	//new AddEventView;
	//new TwoWeekView;
});
