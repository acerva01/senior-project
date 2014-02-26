$(function(){	
	UserProfileView = Parse.View.extend({
		el: ".content",
		
		events: {
			"click #save-changes": "saveChanges"
		},
		
		template: _.template($("#user-profile-settings").html()),
		
		initialize: function() {
			var self = this;
			
			_.bindAll(this, "saveChanges");
			
			this.username = Parse.User.current().get('username');
			
			Parse.Cloud.run("retrieveRegisterCode", {}, {
				success: function(result) {
					console.log("Registered result: " + result);
					self.registered = (typeof result != 'boolean');
					self.code = self.registered ? result : '';
			
					self.render();
				},
				error: function(error) {
					self.registered = false;
					self.code = '';
					console.log(error);
				}
			});
		},
		
		saveChanges: function() {
			if(!self.registered) {
				var codeVal = self.$("#code-input").val();
				Parse.Cloud.run("registerUser", {code: codeVal}, {
					success: function() {
						alert("Successfully registered! You can now add new events!");
						self.registered = true;
					},
					error: function(error) {
						console.log(error);
						alert(error.message);
					}
				});
			}
		},
		
		render: function() {
			var self = this;
		    this.$el.html(
		    	this.template({
		    		username: self.username,
		    		display: self.registered ? 'none' : 'block',
		    		code: self.code
	    		})
    		);
    		
    		if(self.registered) {
    			self.$("#code-input").attr("readonly", '');
    		}
    		
    		self.$el.trigger('create');
	    	
			return this;
		}
	});
	
	EventSubView = Parse.View.extend({
		events: {
			"click input.sub-edit" : "editEvent",
			"click label.remove-sub" : "markEvent"
		},
		
		template: _.template($("#event-sub-template").html()),
		
		toDelete: false,
		
		intialize: function() {
			_.bindAll(this, "render", "editEvent", "markEvent");
		},
		
		editEvent: function() {
			console.log("Attempted to edit");
		},
		
		markEvent: function() {
			this.toDelete = !this.toDelete;
			console.log("Marked for removal");
		},
		
		render: function() {
		    var self = this;
		  
		    var name = self.model.get('event').get('name');
		  
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
		
		events: {
			"click #save-changes" : "saveChanges",
			"click #undo-changes" : "undoChanges"
		},
		
		subViews: new Array(),
		
		initialize: function() {
		  	var self = this;
		  	
		  	_.bindAll(this, "saveChanges", "undoChanges");
		  	
		  	this.$el.html(_.template($("#user-subscription-settings").html()));
		  	
		  	//Parse.Cloud.run("getUserSubscriptions", {userID: Parse.User.current().id}, {
		  	
		  	var query = new Parse.Query("Sub");
		  	query.equalTo("owner", Parse.User.current());
		  	query.include("event");
		  	query.find({	
		  		success: function(subs) {
		  			//self.subs = subs;
		  			
		  			console.info(subs.length);
		  			console.info(subs);
		  			console.log("displaying subs");
		  			
		  			self.displayEvents(self, subs);
		  		},
		  		error: function(error) {
			    	console.error("Error retrieving subscriptions: " + error.code + " " + error.message);
		  		}
		  	});
		},
		
		saveChanges: function() {
			var self = this;
			_.each(self.subViews, function(view){
				if(view.toDelete) {
					console.log("Destroying subscription.");
					view.model.destroy();
					
					view.undelegateEvents();
				    view.$el.removeData().unbind(); 
				    view.remove();  
			    	delete view;
				}
			});
			
			self.subViews = new Array();
			
			self.render().$el.trigger('create');
		},
		
		undoChanges: function() {
			var self = this;
			
			_.each(self.subViews, function(view){
				if(view.toDelete) {
					view.toDelete = false;
					view.render().$el.trigger('create');
				}
			});
			
			self.render().$el.trigger('create');
		},
		
		hasRecurring: function(results) {
			for (var i = 0; i < results.length; i++) {
				if(results[i].get('recurring')) {
					return true;
				}	
			}
			
			return false;
		},
		
		displayEvents: function (self, results, hasRecur) {
			if(!self.hasRecurring(results)) {
				self.$("#no-once").css('display', 'block');
			}
			
			if(results.length == 0) {
				self.$("#no-recur").css('display', 'block');
			}
			
        	// this.$el.html(this.template({
        		// recurring: self.hasRecurring(results) ? 'none' : 'block',
        		// once: (results.length != 0) ? 'none' : 'block'
        	// }));
			
			for (var i = 0; i < results.length; i++) {
				var sub   = results[i];
		      	//var event = sub.get("event");
		      	
		      	var view = new EventSubView({model: sub});
		      	
		      	if(!sub.get("recurring")) {
			  		self.$("#once-subs").append(view.render().el);
			  	}
			  	else {
			  		self.$("#recur-subs").append(view.render().el);
			  	}
			  	
			  	self.subViews.push(view);
		    }
			console.log(self.subViews);
		    
		    self.$el.trigger('create');
		},
		
		render: function() {
			this.$el.trigger('create');
			return this;	
		}
	});
});