(function(root){
	'use strict';

	// top level namespace
	var app = {};

	// global export
	root.app = app;

	/*
	 * Model
	 *	number: -1, //numeric representation of the word
	 *	words : [] //order by weight
	 */

	var Item = Backbone.Model.extend({

		defaults: {
			number: -1,
			words: []
		},

		validate: function(attr) {
			if(!attr.number) {
				return 'number is required';
			}

			if(!attr.words) {
				return 'list of words are required';
			}

			if(isNaN(attr.number)) {
				return attr.number + ' should be a number';
			}

			if (!(attr.words instanceof Array)) {
				return attr.words + ' should be an array';
			}
		},

		initialize: function() {
			this.on('invalid', function(model, error) {
				console.log(error);
			});
		}

	});


	/*
	 * Collection
	 */

	var Dictionary = Backbone.Collection.extend({

		model: Item,

		search: function(attr) {
			var number = attr.number;
			var limit = attr.limit || Number.MAX_VALUE;
			var k = 0;

			return this.filter(function(data) {
				if(data.get('number') == number ) {
					return true;
				} else if(data.get('number').indexOf(number) == 0 && k<limit) {
					k += data.get('words').length;
					return true;
				}
				return false;
			});
		},

		setItems: function(file) {
			var self = this;
			var reader = new FileReader();
			reader.readAsText(file);

			reader.onload = function(event) {
				self._parseText(event.target.result);
			};
		},

		_parseText: function(result) {
			var
				text,

				plainWords,
				countedWords,
				orderedWords,
				groupedWords,

				self = this
			;

			text = result.toLowerCase().replace(/('s)|'/g,'').replace(/[\W\d\n\r_]/g,' ');
			plainWords = _.compact(text.split(' '));
			
			countedWords = _.countBy(plainWords);

			orderedWords = _.pairs(countedWords).sort(function(a, b) {
				return (b[1] - a[1]);
			});

			groupedWords = _.groupBy(orderedWords, function(item) {
				return item[0]
							.replace(/[abc]/g,2)
							.replace(/[def]/g,3)
							.replace(/[ghi]/g,4)
							.replace(/[jkl]/g,5)
							.replace(/[mno]/g,6)
							.replace(/[pqrs]/g,7)
							.replace(/[tuv]/g,8)
							.replace(/[wxyz]/g,9)
						;
			});

			self.add(
				_.map(groupedWords, function(item, index) {
					var words = _.map(item, function(word) {
						return word[0];
					});
					return {number: index, words:words}
				})
			);

			self.trigger('ready');
		}
	});


	/*
	 * View
	 */

	var DictionaryView = Backbone.View.extend({

		el: 'body',

		collection: null,
		template: null,

		events: {
			'keyup #search': 'searchItem',
			'change #dataset': 'fillCollection'
		},

		initialize: function() {
			this.collection = new Dictionary();
			this.template = $('#list-template').html();

			this.collection.on('ready', this.ready, this);

			// DOM
			this.$result = $('#results');
			this.$alert = $('.alert');
		},


		searchItem: function(event) {
			var value = event.target.value;

			if(this.collection.length == 0) {
				this.$alert.addClass('active');
			} else if(value) {
				var prefixMatches = this.collection.search({number: event.target.value, limit:5}) || [];

				this.renderList(prefixMatches);
			} else {
				this.clean();
			}
		},

		renderList: function(list) {
			var arr = [];

			_.each(list, function(model) {
				arr = arr.concat(model.get('words'));
			});

			this.render(arr);
		},


		clean: function() {
			this.render([]);
		},

		render: function(list) {
			var html  = _.template(this.template, {list:list});
			this.$result.html(html);
		},

		fillCollection: function(event) {
			this.collection.setItems(event.target.files[0]);
		},

		ready: function() {
			this.$alert.removeClass('active');
		}

	});

	// public objects
	app.View = DictionaryView;
	app.Model = Item;
	app.Collection = Dictionary;

})(window);


$(function() {
	new app.View();
});