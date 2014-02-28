/**
 * @author Alejandro
 */


$(function(){
	
	// FIXME: Take out for deployment! 981595309153 AIzaSyBfkxsYYXBLV5UN3-vUrZKIl54yXTcAVnI <- GCM
	Parse.User.logOut();
	
	/*
		FIXME: Things to accomplish for end of Senior Project:
				- User settings completed
				- Push Notifications
				- Calendar view of events
					- Recurring events;
				- Margins so everything isn't crammed to edge of screen
				- Basic themes? Something different than all white...
				- Background for slide-out menu
				- Profile pictures? ;/
				- Navigation history? Back button?
				- Basic anonymous users and registered roles
				- Sign up code generation
				- Add User feedback elements
					- Loading gifs
					- Notification: "Subscribe success!";
						- Cool, colored ellipsis "..." DISCO
				
				ORDER:
				- Subscriptions
				- Calendar view and associated elements
				- Anon users and codes
				- Push notices
				- User settings
				- Feedback elements
				- Girly things (themes)
				
		FIXME: LAST TIME:
				- Edit/Delete events (delete done)
				X Unsubscribe
				- Permissions locked in for Add Event (only registered can create)
		
		
				- Overriding set calendar event to allow me to popup a dialog with all events that day
				- Each event listing will have a view and subscribe button. Like a mashup of TwoWeekView and Subscription settings
		
		FIXME: BUGS
				- Add Event view overwrites first added event after adding event, navigating around, then adding a new event
				- Time (e.g 12:34 pm) Not displaying correctly on Android event view
	
		FIXME: 	Offline solution - After thought
					- Eventual support/notice of older version, e.g "Warning: You're device is using an older version of browser X. Some features may not work. Like database"
				Header displays name of current page 
				ODne submenu open at a time in navigation
				
				Permissions
					- Need to change all object permissions before production release
				
				Events
					- Better event views/navigation
					- View a single event?
					- View an event by navigating a calendar
						- Click on day of calendar to open something (dialog?) which lists all events for that day with a "View" button for each event
					- Add un-subscribe button to event view
					- Only allow certain users to see certain events? Duh, invite only.
					
				User settings page
					- Have a footer to navigate?
					- Push notifications
						- Push new events to phone. Setting to receive notifications about new events						
					- Edit subscriptions/events
						- Unsubscribe from just one instance?
					- Maintain local and remote copy of a settings object. Remote obj functions as a backup. Only query remote if changes made locally.
					- Option to require login on app start
					- User-chosen homepage?
					- HOW ABOUT: No home button, but rather, move menu to right, then back button is on left
					- General settings
						- Give user ability to turn off auto-generated events.
						- Auto-subscribe to all events, or specific ones (by user, date, etc)
					
				Proper Navigation between "pages"
				Theme-ing
				Push Notifications
				Polishing
					- On subcribe, disable button and say "Subscribed!"
					- Allow opening of only 1 event at a time. Auto-close others.
					- Indicate success/failure of event submit
					- Indicate failure better for invalid login.
					- Better login screen for first app use
					- ADD VALIDATION FOR ADD EVENT
						- In two week view, disable "Subscribe" for already subscribed events
										
				Favorites? Favorite pages? Quick menu to favorites?
				Create Parse.com "Roles" for things like...
					- Music Ministry leaders
					- Men's group leaders
					- Women's group...
					- others
				Need to sweep anonymous users?
				Definitely sweep old events
					- AND old subscriptions!
					
				CONSIDER: Now, for instance, Music Ministry has MORE places to UPDATE DATA.
				
				For anonymous users and signing up:
					- Create a scheduled job to update a value in a Parse class daily. This is the sign up key.
					- Only users who are registered can view/access this key
					- Users who want to register (so that they can post) must acquire this key from another registered user (ideally in person, e.g. word of mouth)
						- Then they can upgrade their anonymous account 
						- The "button" to upgrade will be in the anon's account settings
							
	
		FIXME: For invite only, make sure a user's calendar doesn't include
		events they were not invited to.
	
		Consider make events that occur on, say, every 2nd Friday, manually input.
		These would be generated on the calendar as the user viewed it. Simple enough.
		Peoples Kitchen generator
		Vesper's Adoration generator
		Bible Study generator
		Sunday mass generator
		
		
		FIXME: User Settings - Event notification (15min advanced warning? 30min? They choose)
				- Day before for now..
		
		FIXME: 	- Add "This event recurs every...."
				- Add another button "Subscribe to All" or "Subscribe once"
				
		FIXME: Passwordless authentication
				- Hash device uuid and use as password for login?
	
	*/
	
	LoginView = Parse.View.extend({
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
	      	  //changeView(new AddEventView({model: (new Event({username: Parse.User.current().get("username")}))}), "Add an Event");
	      	  changeView("TwoWeekView");
	          //self.undelegateEvents();
	          //delete self;
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
	      	  //changeView("AddEventView"({model: (new Event({username: Parse.User.current().get("username")}))}), "Add an Event");
	      	  changeView("TwoWeekView");
	      	  appHistory = new Array();
	          //self.undelegateEvents();
	          //delete self;
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
	  
	
	if(Parse.User.current()) {
		//new TwoWeekView;
		replaceView("TwoWeekView");
		//viewStack.push(new AddEventView);
	}
	else {
		//new LoginView;
		replaceView("LoginView");
		//viewStack.push(new LoginView);
	}
	
	appHistory = new Array();
	//new TwoWeekView;
});
