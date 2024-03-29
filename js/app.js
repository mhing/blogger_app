App = Ember.Application.create();

App.Router.map(function() {
	this.resource('about');
	this.resource('posts', function() {
		this.resource('post', { path: ':post_id' }); // dynamic segment of the url, pased by params hash
	});
});

// Routes, responsible translating url into model for template
App.PostsRoute = Ember.Route.extend({
	model: function() {
		// can do asynchronous return, Supports promise
		return $.getJSON('http://tomdale.net/api/get_recent_posts/?callback=?').then(function(data) {
			return data.posts.map(function(post) {
				post.body = post.content; // translate JSON data form server to format template expects
				return post;
			});
		});

		//return posts; // synchronous data
	} 
});

App.PostRoute = Ember.Route.extend({
	model: function(params) { // opject responsible for giving post template its model
		return $.getJSON('http://tomdale.net/api/get_post/?id='+params.post_id+'&callback=?').then(function(data) {
			data.post.body = data.post.content;
			return data.post;
		});

		//return posts.findBy('id', params.post_id)
	}
});

// Controller, object that stores application state and responds to events from templates
App.PostController = Ember.ObjectController.extend({
	isEditing: false, // not presisted on model in case user refreshes the page, wouldn't expect to be in edit mode

	// actions hash that contains methods for each action from our template
	actions: {
		edit: function() {
			this.set('isEditing', true);
		},

		doneEditing: function() {
			this.set('isEditing', false);
		}
	}
});

// Handlebars helper
Ember.Handlebars.helper('format-date', function(date) {
	// uses the moment.js format lib included in index.html
	return moment(date).fromNow(); 
});

var showdown = new Showdown.converter();

Ember.Handlebars.helper('format-markdown', function(input) {
	// uses showdown js lib
	// important that handlebars helpers escape html by default
	// to opt out of XSS protection, use the SafeString method
	return new Handlebars.SafeString(showdown.makeHtml(input));
});

// // Javascript variable since not hooked up to backend
// var posts = [{
//   id: '1',
//   title: "Rails is Omakase",
//   author: { name: "d2h" },
//   date: new Date('12-27-2012'),
//   excerpt: "There are lots of à la carte software environments in this world. Places where in order to eat, you must first carefully look over the menu of options to order exactly what you want.",
//   body: "I want this for my ORM, I want that for my template language, and let's finish it off with this routing library. Of course, you're going to have to know what you want, and you'll rarely have your horizon expanded if you always order the same thing, but there it is. It's a very popular way of consuming software.\n\nRails is not that. Rails is omakase."
// }, {
//   id: '2',
//   title: "The Parley Letter",
//   author: { name: "d2h" },
//   date: new Date('12-24-2012'),
//   excerpt: "My [appearance on the Ruby Rogues podcast](http://rubyrogues.com/056-rr-david-heinemeier-hansson/) recently came up for discussion again on the private Parley mailing list.",
//   body: "A long list of topics were raised and I took a time to ramble at large about all of them at once. Apologies for not taking the time to be more succinct, but at least each topic has a header so you can skip stuff you don't care about.\n\n### Maintainability\n\nIt's simply not true to say that I don't care about maintainability. I still work on the oldest Rails app in the world."  
// }];