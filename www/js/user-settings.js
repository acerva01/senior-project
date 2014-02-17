$(function(){	
	UserProfileView = Parse.View.extend({
		el: ".content",
		
		template: _.template($("#user-profile-settings").html()),
		
		initialize: function() {
			this.username = Parse.User.current().get('username');
			this.render();
		},
		
		render: function() {
		    this.$el.html(
		    	this.template({
		    		username: this.username
	    		})
    		).trigger('create');
	    	
			return this;
		}
	});
	
	EventSubView = Parse.View.extend({
		events: {
			"click button.edit" : "editEvent",
			"click input.remove" : "markEvent"
		},
		
		template: _.template($("#event-sub-template").html()),
		
		editEvent: function() {
			console.log("Attempted to edit");
		},
		
		markEvent: function() {
			console.log("Marked for removal");
		},
		
		render: function() {
		    var self = this;
		  
		    var name = this.model.get('name');
		  
		    $(this.el).html(this.template({
		  		name: name
		    }));
		    
	        return this;
	    } 
	});
	
	UserSubscriptionView = Parse.View.extend({
		el: ".content",
		// Keep these in sync
		elemStr: ".content",
		
		initialize: function() {
		  	var self = this;
		  	
	        this.$el.html(_.template($("#user-subscription-settings").html()));
		  	
		  	
		  	//Parse.Cloud.run("getUserSubscriptions", {userID: Parse.User.current().id}, {
		  	
		  	var query = new Parse.Query("Sub");
		  	query.equalTo("owner", Parse.User.current());
		  	query.include("event");
		  	query.find({	
		  		success: function(subs) {
		  			self.subs = subs;
		  			
		  			console.info(subs.length);
		  			console.info(subs);
		  			
		  			self.displayEvents(self, subs);
			
					// // query all events
					// var query = new Parse.Query(Event);
					// query.greaterThanOrEqualTo("start", weekStart1);
					// query.lessThanOrEqualTo("start", weekEnd2);
					// query.find({
					  	// success: function(results) {
					  		// self.displayEvents(self, results, weekEnd1);
					  	// },
					  	// error: function(error) {
					    	// console.error("Error retrieving events: " + error.code + " " + error.message);
					  	// }
				  	// });
		  		},
		  		error: function(error) {
			    	console.error("Error retrieving subscriptions: " + error.code + " " + error.message);
		  		}
		  	});
		},
		
		displayEvents: function (self, results) {
			for (var i = 0; i < results.length; i++) {
				var sub   = results[i];
		      	var event = sub.get("event");
		      	
		      	var view = new EventSubView({model: event});
		      	
		      	if(!sub.get("recurring")) {
			  		self.$("#once-subs").append(view.render().el);
			  	}
			  	else {
			  		self.$("#recur-subs").append(view.render().el);
			  	}
		    }
		    
		    self.$el.trigger('create');
		},
		
		render: function() {
			return this;	
		}
	});
});