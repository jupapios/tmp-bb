describe('AppSpec', function() {

	// Basic model validation
	describe('Model validation', function() {
		var model;

		beforeEach(function() {
			model = new app.Model();
		});

		it('can be created with defaults values', function() {
			expect(model.get('number')).toBe(-1);
			expect(model.get('words')).toEqual([]);
		});

		it('can validate NaN', function() {
			var item = model.set('number', 'a', {validate:true});
			expect(item).toBe(false);
		});


		it('can validate not an array words', function() {
			var item = model.set('words', '1', {validate:true});
			expect(item).toBe(false);
		});

		it('can set {number, words}', function() {
			var item = model.set({'words': [], 'number': 1}, {validate:true});
			expect(item).toBeTruthy();
		});
	});

	// Text
	describe('Word Processing', function() {
		var collection;
		var text;

		beforeEach(function() {
			collection = new app.Collection();

			text = "\
				The the the the * * *--\
				\
				tie tie\
			";
		});

		it('can create basic dictionary', function() {
			var spy = jasmine.createSpy('ready _parseText');

			collection.on('ready', spy);

			collection._parseText(text);

			expect(spy).toHaveBeenCalled();
			expect(collection.models.length).toBeGreaterThan(0);

		});

		it('can order word by concurrence (+)', function() {
			collection._parseText(text);

			var models = collection.models;

			expect(models[0].get('words')[0]).toBe('the');	
		});

		it('can order word by concurrence (-)', function() {
			var	text = "\
				The the the the * * *--\
				\
				tie tie tie tie tie tie\
			";
			collection._parseText(text);

			var models = collection.models;

			expect(models[0].get('words')[0]).toBe('tie');
		});

		it('can converts words to numbers', function() {
			collection._parseText(text);

			var models = collection.models;

			expect(models[0].get('number')).toBe('843');				
		});

	});

});