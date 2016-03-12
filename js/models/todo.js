/*global Backbone */
var app = app || {};

(function () {
	'use strict';

	// Todo Model
	// ----------

	// Our basic **Todo** model has `title`, `order`, and `completed` attributes.
	app.Todo = Backbone.Model.extend({
		// Default attributes for the todo
		// and ensure that each todo created has `title`,  `completed`  and `priority`, keys.
		defaults: {
			title: '',
			completed: false,
            priority: 0
		},

        // Toggle the `priority` state of this todo item
        togglePriority: function(){
           this.save({
               priority: this.get('priority')
           });
        },
        
		// Toggle the `completed` state of this todo item.
		toggle: function () {
			this.save({
				completed: !this.get('completed'),                
			});
		}
	});
})();
