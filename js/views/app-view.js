/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
	'use strict';

	// The Application
	// ---------------

	// Our overall **AppView** is the top-level piece of UI.
	app.AppView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#todoapp',

		// Our template for the line of statistics at the bottom of the app.
		statsTemplate: _.template($('#stats-template').html()),

		// Delegated events for creating new items, and clearing completed ones.
		events: {
			'keypress #new-todo': 'createOnEnter',
			'click #clear-completed': 'clearCompleted',
			'click #toggle-all': 'toggleAllComplete',
            'click .priority-btn': 'setPriority',
            'click #sort-btn': 'sort'
		},

		// At initialization we bind to the relevant events on the `Todos`
		// collection, when items are added or changed. Kick things off by
		// loading any preexisting todos that might be saved in *localStorage*.
		initialize: function () {
			this.allCheckbox = this.$('#toggle-all')[0];
			this.$input = this.$('#new-todo');
			this.$footer = this.$('#footer');
			this.$main = this.$('#main');
			this.$list = $('#todo-list');
            this.$priorityButton = this.$('#new-priority-btn');
            this.$priorityLabel = this.$('#new-priority-label');
            this.$newtodoview = this.$('.newtodoview');
            this.$newpriority = this.$('#new-priority');
            this.$sortList = this.$('#sort-list');
            
            this.priorityList = [
                'low',
                'medium',
                'high'
            ];
            
            this.currentPriorityIndex = null;

			this.listenTo(app.todos, 'add', this.addOne);
			this.listenTo(app.todos, 'reset', this.addAll);
			this.listenTo(app.todos, 'change:completed', this.filterOne);
			this.listenTo(app.todos, 'filter', this.filterAll);
			this.listenTo(app.todos, 'all', this.render);

			// Suppresses 'add' events with {reset: true} and prevents the app view
			// from being re-rendered for every model. Only renders when the 'reset'
			// event is triggered at the end of the fetch.
			app.todos.fetch({reset: true});
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function () {
			var completed = app.todos.completed().length;
			var remaining = app.todos.remaining().length;

			if (app.todos.length) {
				this.$main.show();
				this.$footer.show();

				this.$footer.html(this.statsTemplate({
					completed: completed,
					remaining: remaining
				}));

				this.$('#filters li a')
					.removeClass('selected')
					.filter('[href="#/' + (app.TodoFilter || '') + '"]')
					.addClass('selected');
			} else {
				this.$main.hide();
				this.$footer.hide();
			}

			this.allCheckbox.checked = !remaining;
		},

		// Add a single todo item to the list by creating a view for it, and
		// appending its element to the `<ul>`.
		addOne: function (todo) {
			var view = new app.TodoView({ model: todo });
			this.$list.append(view.render().el);
            this.$newtodoview.removeClass('priority');
		},

		// Add all items in the **Todos** collection at once.
		addAll: function () {
			this.$list.html('');
			app.todos.each(this.addOne, this);
		},

		filterOne: function (todo) {
			todo.trigger('visible');
		},

		filterAll: function () {
			app.todos.each(this.filterOne, this);
		},
        
        /*
        Sort the todos on the selected criteria. Some criteria, like priority when based on true
        or false, need to be reversed to show true (1) first before false (0).
        */
        sort: function(){
            var sortProperty = this.$sortList[0].selectedOptions[0].value;
            app.todos.comparator = function(model){
                var sortCriteria = model.get(sortProperty);
                switch(sortProperty){
                    case 'priority' : 
                        sortCriteria = !sortCriteria;
                    break;
                }                
                return sortCriteria;
            };
            app.todos.sort();
            this.addAll();
        },
        
		// Generate the attributes for a new Todo item.
		newAttributes: function () {
			return {
				title: this.$input.val().trim(),
				order: app.todos.nextOrder(),
				completed: false,
                priority:  this.$newpriority.attr('value') ? +this.$newpriority.attr('value') : null
			};
		},

		// If you hit return in the main input field, create new **Todo** model,
		// persisting it to *localStorage*.
		createOnEnter: function (e) {
			if (e.which === ENTER_KEY && this.$input.val().trim()) {
				app.todos.create(this.newAttributes());
				this.$input.val('');
			}
		},

		// Clear all completed todo items, destroying their models.
		clearCompleted: function () {
			_.invoke(app.todos.completed(), 'destroy');
			return false;
		},

        // Set the `"priority"` state of the new Todo item.
		setPriority: function (event) {
			var target = event.target;
            if(target){
                var $target = $(target);
                var className = $target.attr('class');
                
                var up = className.match(/up$/);
                var down = className.match(/down$/);
                
                if(up){
                    if(typeof this.currentPriorityIndex === 'number' && this.currentPriorityIndex >= this.priorityList.length - 1){
                        return;
                    }
                    
                    if(this.currentPriorityIndex === null){
                        this.currentPriorityIndex = 0;
                    } else {
                        this.currentPriorityIndex++;
                    }                    
                }
                
                if(down){
                    if(typeof this.currentPriorityIndex === 'number' && (this.currentPriorityIndex - 1) < 0){
                        this.currentPriorityIndex = null;
                    } else if(this.currentPriorityIndex === null){
                        return;
                    }
                    
                    this.currentPriorityIndex--;
                }
                
                var priorityLabelText = '';
                for(var i = 0; i < this.currentPriorityIndex + 1; i++){
                    priorityLabelText += '!';
                }
                
                this.$priorityLabel.text(priorityLabelText); 
                
                /*
                Only set the priority value for the new todo item if the priority is set
                */
                if(this.currentPriorityIndex >= 0){
                    this.$newpriority.attr('value', this.currentPriorityIndex);
                } else {
                    this.$newpriority.removeAttr('value');
                }
                
            }
		},
        
		toggleAllComplete: function () {
			var completed = this.allCheckbox.checked;

			app.todos.each(function (todo) {
				todo.save({
					completed: completed
				});
			});
		}
	});
})(jQuery);
