$(function(){
	
	CalendarView = Parse.View.extend({
		el: ".content",
		
		template: _.template($("#calendar-template").html()),
		
		displayedEvents: new Array(),
		
		initialize: function() {
			var self = this;
			
			//self.setElement($("#page > div.content"));
			
			_.bindAll(this, "grabEvents");
			
			console.log("Initing calendar view");
			
			//self.$el.html(_.template($("#calendar-template").html()));
			
		  	
		  	var query = new Parse.Query("Event");
		  	query.select("start");
		  	query.find({
		  		success: function(eventDates) {
		  			var dateStr = "";
		  			
		  			for(var i=0; i < eventDates.length-1; i++){
		  				dateStr = appendHighDate(dateStr, moment(eventDates[i].get('start')).format('YYYY-MM-DD'));
		  			}
		  			// Clear trailing comma
	  				dateStr = appendHighDate(dateStr, moment(eventDates[i].get('start')).format('YYYY-MM-DD'), true);
	  				
	  				self.highDates = dateStr;
	  				
	  				console.info("HIGH DATES: " + dateStr);
	  				
	  				self.render();
		  		},
		  		error: function(error) {}
		  	});
		},
		
		grabEvents: function(eventDate) {
			var self = this;
			
			var subsQuery = new Parse.Query("Sub");
		  	subsQuery.equalTo("owner", Parse.User.current());
		  	subsQuery.find({
		  		success: function(subs) {
		  			self.subs = subs;
		  			
		  			var query = new Parse.Query("Event");
					query.greaterThanOrEqualTo("start", eventDate.toDate());
					query.lessThanOrEqualTo("start", eventDate.add('days', 1).toDate());
					query.find({
						success: function(results){
							console.info("Garnered " + results.length + " events.");
							self.displayEvents(self, results);
						},
						
						error: function(error) {
							console.error("Calendar list view Event query failure: " + error.code + ": " + error.message);
						}
					});
		  		},
		  		error: function(error) {}
		  	});
			
			//this.render();
		},
		
		hasSubscription: function(self, event) {
			var result = false;
			for(var i=0; i < self.subs.length; i++) {
				//if(self.subs[i] == event.id) {
				if(self.subs[i].get('event').id == event.id) {
					result = true;
					break;
				}
			}
			
			return result;
		},
		
		displayEvents: function (self, results) {
			console.log(results[0]);
			for (var i = 0; i < results.length; i++) {
		      	var event = results[i];

		      	var subed = self.hasSubscription(self, event);
		      
		      	var view = new EventView({model: event});
		      	view.subed = subed;
		      	view.owner = event.get('username') == Parse.User.current().get('username');
		      	
		      	self.displayedEvents.push(view);
		      
		  		$("#calendar-view").append(view.render().el);
		    }
		    
		    self.$el.trigger('create');	
		},
		
		render: function() {
			var self = this;
			
			console.log("rendering calendar");
			
			self.$el.html(self.template({
				highDates: self.highDates
			}));
			
			
			$('#main-calendar').bind('datebox', function(event, passed) {
				if(passed.method == "set") {
					 console.info(event);
					 console.info(passed);
					 console.info(passed.value);
					 console.info(moment(passed.value, "YYYY-MM-DD"));
					//pushView(new CalendarListView({eventDate: moment(passed.value, "YYYY-MM-DD")}));
					
					console.info(self.displayedEvents.length);
					
					self.displayedEvents.forEach(function(evt) {console.info("Destroying " + evt + this); destroyView(evt);});
					
					$("#calendar-view").html("");
					
					self.displayedEvents = new Array();
					console.info(self.displayedEvents.length);
					
					self.grabEvents(moment(passed.value, "YYYY-MM-DD"));
					
					e.stopPropagation();
		    	}
		  	});
			
			self.$el.trigger('create');	
			
			$("#main-calendar").css({ 'width': '40px', 'border': 0, 'background': 'transparent', 'padding': 0, 'margin': 0, 'box-shadow': 'none', 'display': 'none'});
		    $("#main-calendar").parent().parent().css({'border':0,  'padding': 0, 'margin': 0, 'background': 'transparent', 'box-shadow': 'none'});
		    
			return self;
		}
		
	});
	
	CalendarEventView = Parse.View.extend({
		el: "<div class='container_12'>",
		
		template: _.template($("#calendar-event-template").html()),
		
		initialize: function() {
			
		},
		
		render: function() {
			var self = this;
		  
		    var name = this.model.get('name');
		  
		    $(this.el).html(this.template({
		  		name: name
		    }));
		    
		    // console.info(self.$('div.grid_4').height());
		    // console.info("GRID 4 HEIGHT: " + self.$('div.grid_4').height());
		    // console.info("CONTAINER HEIGHT: " + self.$('div.container_12').height());
		    
		    
		    
			return this;
		}
	});
	
	
	CalendarListView = Parse.View.extend({
		el: "#calendarPage",
		
		initialize: function() {
			var self = this;
			
			console.log("intializing calendar view");
			console.info(self.options.eventDate.toDate());
			console.info(self.options.eventDate.add('days', 1).toDate());
			//this.$el.html(_.template("#calendar-view-template").html());
			
			// FIXME: THIS WILL EVENTUALLY JUST QUERY CACHE FOR NAMES
			var query = new Parse.Query("Event");
			query.greaterThanOrEqualTo("start", self.options.eventDate.toDate());
			query.lessThanOrEqualTo("start", self.options.eventDate.add('days', 1).toDate());
			query.find({
				success: function(results){
					console.info("Garnered " + results.length + " events.");
					self.displayEvents(self, results);
				},
				
				error: function(error) {
					console.error("Calendar list view Event query failure: " + error.code + ": " + error.message);
				}
			});
			
			this.render();
		},
		
		displayEvents: function (self, results) {
			for (var i = 0; i < results.length; i++) {
		      	var event = results[i];
		      	
		      	var view = new CalendarEventView({model: event});
		      
		  		$("#calendarPage > .ui-content").append(view.render().el);
		    }
		    
		    self.$el.trigger('create');	
		    // Dialog present in a multipage document
			$.mobile.changePage("#calendarPage", {role: "dialog"});
			
			//console.info(self.$('div.grid_4'));
			self.$('div.container_12').each(function(obj) {
				console.info($(this).height());
			});
			
			// while (this.$el.height() > this.$('.grid_4').height()) {
		        // var height = parseFloat(this.$el.css('height')) - 1 + "px";
		        // this.$el.css('height', height);
		    // }
		},
		
		render: function() {
			return this;
		}
	});
	
});