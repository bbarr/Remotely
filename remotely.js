var remotely = {};

remotely.decorate = function(current_object) {	
	var remotely_object = new remotely.Object(current_object);
	jQuery.extend(current_object, remotely_object);
}

remotely.Object = function() {	
	this.log = [];
	this.subscribers = [];
}

remotely.Object.prototype = {
	
	route: function(name, method, uri) {
		this[name] = function(data) {
			var _this = this;
			_this.publish('before_' + name);
			jQuery.ajax(uri, { type: method })
			.complete(function(response) {
				_this.publish('after_' + name, response);
			});
		};
	},
	
	publish: function(event, data) {
		
	},
	
	subscribe: function(event, fn) {
		
	}
}