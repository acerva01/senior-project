$(function(){	
	
	Subscription = Parse.Object.extend("Subscription", {
		defaults: {
			owner: Parse.User.current(),
    		ACL:    new Parse.ACL(Parse.User.current())
		}
	});
	
	Sub = Parse.Object.extend("Sub", {
		defaults: {
			owner: Parse.User.current(),
    		ACL:    new Parse.ACL(Parse.User.current())
		},

	    initialize: function() {
	    	var self = this;
	    	var usr = Parse.User.current();
    		var ACL = new Parse.ACL(usr);
	    	
	    	self.set({"ACL": ACL, "owner": usr});
	    }
	});
	
	Event = Parse.Object.extend("Event", {
		defaults: {
			name:   "",
			desc:   "",
			start:  new Date(),
			end:    new Date(),
			invite: false,
			recur:  false,
			repeat: {'Sun':false, 
					 'Mon':false, 
					 'Tue':false, 
					 'Wed':false, 
					 'Thu':false, 
					 'Fri':false, 
					 'Sat':false
					},
			each:	0,
		},

	    initialize: function() {
	    	var self = this;
	    	var usr = Parse.User.current();
	    	var username = Parse.User.current().get('username');
    		var ACL = new Parse.ACL(usr);
    		
    		ACL.setPublicReadAccess(true);
	    	
	    	self.set({"ACL": ACL, "user": usr, "username": username});
	    }
	});	
	
	AddEventView = Parse.View.extend({
		events: {
			"click button.add-event": "saveEvent",
			"change #event-recur": "toggleRecur"
		},
		
		el: ".content",
		
		initialize: function() {
			var self = this;
			_.bindAll(this, "saveEvent", "toggleRecur", "continueInit");
			
			if(typeof self.options.editing == 'undefined') {
				console.info("Editing was not defined. New event being added.");
	        	self.model = new Event();
			}
			else {
				self.model = self.options.model;
			}
			
			console.info(self.model);
			console.info(self.options);
			console.info(moment(this.model.get('start')).format("YYYY-MM-DD"));
			console.info(moment(this.model.get('start')).format("HH:ss"));
			console.info(moment(this.model.get('end')).format("YYYY-MM-DD"));
			console.info(moment(this.model.get('end')).format("HH:ss"));
			
			Parse.Cloud.run("isUserRegistered", {}, {
				success: function(registered) {
					if(registered) {
						self.continueInit();
					}
					else {
						$.mobile.changePage("#register-dialog");
						goBack();
					}
				},
				error: function(error) {
					alert(error);
				}
			});
			
			self.saving = false;
		},
		
		continueInit: function() {
			var self = this;
			var template = _.template($("#add-event-template").html());
			
			
				// defaultStartDate:	moment(this.model.get('start')).format("YYYY-MM-DD"),
				// defaultStartTime:	moment(this.model.get('start')).format("HH:ss"),
				// defaultEndDate:		moment(this.model.get('end')).format("YYYY-MM-DD"),
				// defaultEndTime:		moment(this.model.get('end')).format("HH:ss")
	        
	        this.$el.html(template({
	        	name:   self.model.get('name'),
				desc:   self.model.get('desc'),
				start:  self.model.get('start'),
				end:    self.model.get('end'),
				invite: self.model.get('invite'),
				recur:  self.model.get('recur'),
				repeat: self.model.get('repeat'),
				each:	self.model.get('each') == 0,
	        }));
	        
	        
	        
	        console.info(new Date());
	        
	        this.eventName  = this.$('#event-name');
	        this.eventDesc  = this.$('#event-desc');
	        this.invite		= this.$('#event-anyone');
	        this.recur		= this.$('#event-recur');
	        this.weekly		= this.$("#recur-weekly");
	        this.start		= this.$('#event-start');
	        this.startTime	= this.$('#start-time');
	        this.end		= this.$('#event-end');
	        this.endTime	= this.$('#end-time');
	        this.repeat		= {'Sun':false, 'Mon':false, 'Tue':false, 'Wed':false, 'Thu':false, 'Fri':false,'Sat':false};
	        this.repeatMap 	= {0:'Sun', 1:'Mon', 2:'Tue', 3:'Wed', 4:'Thu', 5:'Fri', 6:'Sat'};
	        
	        if(!this.model.get('recur')){
	        	this.$('#event-recurrence').css("display", "none");	 
	        }  
	             
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
			var self = this;
			
			if(self.saving) {
				return;
			}
			
			self.saving = true;
			
			$("input[name='group4']").each(
				function(ndx, obj){
					self.repeat[self.repeatMap[ndx]] = $(this).is(":checked");
				});
			
			console.info("Saving Event");
			
			var buttonObj = self.$("button.add-event");
			buttonObj.html(buttonObj.html().replace("Submit", "Submiting..."));
				
			self.model.save({
				name: 	this.eventName.val(),
				desc: 	this.eventDesc.val(),
				invite: !this.invite.is(":checked"),
				recur:	this.recur.is(":checked"),
				each:	(this.weekly.is(":checked") ? 0 : 1),
				repeat: this.repeat,
				start:	this.createDate(this.start.val(), this.startTime.val()),
				end:	this.createDate(this.end.val(), this.endTime.val()),
				user: Parse.User.current(),
				username: Parse.User.current().get("username")
			}).then(
				function(obj){
					//console.info("Save success, creating new Event model.");
					//console.info(self.model);
					//self.model.clear();
					//console.info(self.model);
					//self.model = new Event({username: Parse.User.current().get("username")});
					console.info(self.model);
					if(typeof self.options.editing == 'undefined') {
						buttonObj.html(buttonObj.html().replace("Submiting...", "Event Created!"));
					}
					else {
						buttonObj.html(buttonObj.html().replace("Submiting...", "Edit Success!"));
					}
				},
				function(error) {
					alert("Error saving event: " + error.message);
					buttonObj.html(buttonObj.html().replace("Submiting...", "Submit"));
					self.saving = false;
				}
			);
		},
		//
		//
		// 		FIXME: REMEMBER TO FIX UTC TIME ISSUES
		//
		//
		createDate: function(startDate, timeString) {
			console.log(startDate);
			console.log(timeString);
			
			var milli = (new Date()).getTimezoneOffset()*60*1000;
			var newDate = new Date(Date.parse(startDate));
			
			console.info("Now: " + new Date());
			console.info("Base date start: " + newDate);
			newDate.setTime(newDate.getTime()+milli);
			console.info("Base date locale: " + newDate);
			
			
			clearTime(newDate);
			console.info("Base date cleared: " + newDate);
		    
		    var hours = timeString.slice(0,2);
		    var minutes = timeString.slice(3,5);
		    
		    console.log("Hours: " + hours);
		    
		    if(hours.charAt(0) == '0') {
		    	hours = hours.slice(1,2);
		    }
		    console.log("Hours: " + hours);
		    
		    newDate.setHours(hours);
		    newDate.setMinutes(minutes);
		    
		    console.log(newDate);
		    
		    return newDate;
		},
	
	    render: function() {
	    	var self = this;
	      	this.delegateEvents();
	   	  	this.$el.trigger('create');
	   	  	
	   	  	// Populate date/time fields with data for editing
	        if(typeof self.options.editing != 'undefined') {
	        	console.info("Populating date fields.");
	        	self.$('#event-start').trigger('datebox', {
	        		'method':'set', 
	        		'value': moment(self.model.get('start')).format("YYYY-MM-DD"), 
	        		'date':  self.model.get('start')
        		});
        		
        		console.info(moment(self.model.get('end')).format("YYYY-MM-DD"));
	        		
	        	self.$('#event-end').trigger('datebox', {
	        		'method':'set', 
	        		'value': moment(self.model.get('end')).format("YYYY-MM-DD"), 
	        		'date':  self.model.get('end')
        		});
	        		
	        	self.$('#start-time').trigger('datebox', {
	        		'method':'set', 
	        		'value': moment(self.model.get('start')).format("HH:ss"), 
	        		'date':  self.model.get('start')
        		});
	        	
	        	self.$('#end-time').trigger('datebox', {
	        		'method':'set', 
	        		'value': moment(self.model.get('end')).format("HH:ss"), 
	        		'date':  self.model.get('end')
        		});
	        }
	   	  	
		  	return this;
	    }
	});
	
	
	EventView = Parse.View.extend({	
		events: {
			"click button.subscribe" : "subscribe",
			"click button.edit" : "edit",
			"click button.desub" : "unsubscribe",
			"click button.delete" : "deleteEvent"
		},
			
		el: "<div class='event-item-collapse' data-role='collapsible' data-iconpos='right'>",
		
		template: _.template($("#event-item-template").html()),
		
		intialize: function() {
			var self = this;
			_.bindAll(this, "subscribe");
		},
		
		subscribe: function() {
			var self = this;
			
			if(self.subed) {
				return;
			}
			
			// Parse.Cloud.run("addUserSubscription", {userID: Parse.User.current().id, eventID: self.model.id}, {
				// success: function() {},
				// error:	 function(error) {console.log("Error adding subscription: " + error.code + error.message);}
			// });
			
			//self.$("button.subscribe").attr("disabled", "true");
			//self.$("button.desub").removeAttr("disabled");
			
			var buttonObj = self.$("button.subscribe");
			buttonObj.html(buttonObj.html().replace("Subscribe", "Subscribing..."));
			
			//self.$("button.subscribe").attr("value", "Subscribed &check;").trigger('create');
			// FIXME: Subscribed! After subscribe
			var sub = new Sub({
				event: self.model,
				recurring: self.model.get("recur") // FIXME: This is not correct! 
			});
			sub.save().then(
				function(){
					self.subed = true;
					buttonObj.html(buttonObj.html().replace("Subscribing...", "Subscribed!"));
				},
				function(error){
					alert("Error saving subscription: " + error.message);
				}
			);
		},
		
		edit: function() {
			var self = this;
			replaceView("AddEventView", {model: self.model, editing: true});
		},
		
		deleteEvent: function() {
			var self = this;
			self.model.destroy();
					
			self.undelegateEvents();
		    self.$el.removeData().unbind(); 
		    self.remove();  
	    	delete self;
		},
		
		unsubscribe: function() {
			var self = this;
			
			self.$("button.desub").attr("disabled", "true");
			//self.$("button.subscribe").removeAttr("disabled");
			
			self.options.subscription.destroy();
		},
		
		render: function() {
		    var self = this;
		    //console.log(this.model.get('start').getTime());
		  	//console.log(self.subed);
		  
		    var startObj = this.model.get('start');
		    var startDate = startObj.toLocaleDateString();
		    var startTime = startObj.toLocaleTimeString();
		    startDate = startDate.slice(0, startDate.lastIndexOf(","));
		    startTime = startTime.slice(0, startTime.lastIndexOf(":")) + startTime.slice(startTime.lastIndexOf(" "), startTime.length);
		    start 	= startDate  + " at " + startTime;
		  
		    var endObj = this.model.get('end');
		    var endDate = endObj.toLocaleDateString();
		    var endTime = endObj.toLocaleTimeString();
		    endDate	= endDate.slice(0, endDate.lastIndexOf(","));
		    endTime	= endTime.slice(0, endTime.lastIndexOf(":")) + endTime.slice(endTime.lastIndexOf(" "), endTime.length);
		    end 		= endDate  + " at " + endTime;
		  
		    var name = this.model.get('name');
		    var desc = this.model.get('desc');
		    var each = this.model.get('each');
		    var repeat = this.model.get('repeat');
		    var recur = this.model.get('recur');
		    var username = this.model.get('username');
		    var subed = self.subed;
		    var owner = self.owner;
		    //console.log(repeat);
		    
		    recurring = (repeat["Sun"] ? "Sun, " : "") +
		    			(repeat["Mon"] ? "Mon, " : "") +
		    			(repeat["Tue"] ? "Tue, " : "") +
		    			(repeat["Wed"] ? "Wed, " : "") +
		    			(repeat["Thu"] ? "Thu, " : "") +
		    			(repeat["Fri"] ? "Fri, " : "") +
		    			(repeat["Sat"] ? "Sat, " : "");
		    			
		    //console.log(recurring);
		    			
		    recurring = recurring.slice(0, recurring.length-2);
		  
		    $(this.el).html(this.template({
		  		name: name,
		  		desc: desc,
		  		startDate: startDate,
		  		start: start,
		  		endDate: endDate,
		  		end: end,
		  		subed: subed,
		  		owner: owner,
		  		recur: recur,
		  		each: each,
		  		recurring: recurring,
		  		username: username
		    }));
		    
	        return this;
	    }    
	});
	
	
	
	TwoWeekView = Parse.View.extend({
		
		el: ".content",
		// Keep these in sync
		elemStr: ".content",
		
		initialize: function() {
		  	var self = this;
		  	
	        this.$el.html(_.template($("#two-week-template").html()));
	        
		  	var weekStart1 = new Date();
		  	weekStart1.setDate(weekStart1.getDate() - weekStart1.getDay());
		  	clearTime(weekStart1);
		  	
		  	var weekEnd1 = new Date(weekStart1.getTime());
		  	weekEnd1.setDate(weekStart1.getDate() + 7);
		  	clearTime(weekEnd1);
		  	
		  	var weekEnd2 = new Date(weekEnd1.getTime());
		  	weekEnd2.setDate(weekEnd1.getDate() + 7);
		  	clearTime(weekEnd2);
		  	
		  	console.info("Start: " + weekStart1);
		  	console.info("End: " + weekEnd1);
		  	console.info("End2: " + weekEnd2);
		  	
		  	// Query all subscriptions of current user
		  	// FIXME: Eventually, this will be cached locally.
		  	
		  	var query = new Parse.Query("Sub");
		  	query.equalTo("owner", Parse.User.current());
		  	
		  	//Parse.Cloud.run("getUserSubscriptions", {userID: Parse.User.current().id}, {
		  		
		  	query.find({
		  		success: function(subs) {
		  			self.subs = subs;
		  			
		  			console.info(subs.length);
		  			console.info(subs);
			
					// query all events
					var query = new Parse.Query(Event);
					query.greaterThanOrEqualTo("start", weekStart1);
					query.lessThanOrEqualTo("start", weekEnd2);
					query.find({
					  	success: function(results) {
					  		console.info(results[0].get("username"));
					  		self.displayEvents(self, results, weekEnd1);
					  	},
					  	error: function(error) {
					    	console.error("Error retrieving events: " + error.code + " " + error.message);
					  	}
				  	});
		  		},
		  		error: function(error) {
			    	console.error("Error retrieving subscriptions: " + error.code + " " + error.message);
		  		}
		  	});
		},
		
		hasSubscription: function(self, event) {
			for(var i=0; i < self.subs.length; i++) {
				//if(self.subs[i] == event.id) {
				if(self.subs[i].get('event').id == event.id) {
					return self.subs[i];
				}
			}
			
			return null;
		},
		
		displayEvents: function (self, results, weekOneEnd) {
			for (var i = 0; i < results.length; i++) {
		      	var event = results[i];
		      	
		      	var subed = self.hasSubscription(self, event);
		      
		      	var view = new EventView({model: event, subscription: subed});
		      	view.subed = (subed != null);
		      	view.owner = event.get('username') == Parse.User.current().get('username');
		      
		      	if(event.get('start').getTime() < weekOneEnd.getTime()) {
			  		$(self.elemStr + " > #two-week-view > .week1").append(view.render().el);
			  	}
			  	else {
			  		$(self.elemStr + " > #two-week-view  > .week2").append(view.render().el);
			  	}
		    }
		    
		    self.$el.trigger('create');
		},
		
		render: function() {
			return this;
		}
	});
});