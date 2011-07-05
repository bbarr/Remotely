
var Remotely = { count: 0 };

Remotely.Object = function(src) {
	this.keys = [];
	this._actions = [];
	this._remotely_id = ++Remotely.count;
	this._extend(src);
};

Remotely.Object.prototype = {

	register: function(data) {
		var key, action;
		for (key in data) {
			action = new Remotely.Action(this, key, data[key]);
			this[key] = action.fire;
			this.actions.push(action);
		}
	},
	
	_extend: function(src) {
		for (var key in src) this[key] = src[key];
		return this;
	},

	_to_json: function() {
		var collapsed = this._collapse();
		return JSON.stringify(collapsed);
	},
	
	_collapse: function() {
		
		var data = {}, 
		    keys = this.keys, 
		    key, prop;
		
		for (key in this) {
			prop = this[key];
			if (keys.indexOf(key) === -1) continue;
			data[key] = typeof prop._collapse === 'function' ? prop._collapse() : prop;
		}
		
		return data;
	}
	
};

Remotely.Action = function(host, name, full_template) {

	this.name = name;
	this.host = host;	

	var parts = full_template.split(' ');
	this.method = parts[0];
	this.template = parts[1];

	this.params = this.template.match(/\:\w*/) || [];
}

Remotely.Action.prototype = {
	
	fire: function(args) {

		var request = this._generate(args),
		    self = this;

		$.ajax({
			url: request.uri,
			type: request.method,
			data: request.data,
			contentType: request.content_type,
			success: request.success,
			error: request.error
		});
	},

	_generate: function(args) {

		var request = {};

		request.params = [].slice.call(args, 0);
		request.data = (this.params.length < request.params.length) ? request.params.pop() : {};

		this._decorate_uri(request);
		this._decorate_callbacks(request);

		return request;
	},

	_decorate_uri: function(request) {

		var uri = this.template,
		    request_params = request.params,
		    action_params = this.params,
		    len = action_params.length,
		    i = 0;

		for (; i < len; i++) uri = uri.replace(action_params[i], request_params[i]);

		request.uri = uri;
	},

	_decorate_callbacks: function(request) {
	
		var self = this;
		
		request.success = function(data) {
			self.host.publish(self.name + '_success', data);
		};

		request.error = function(data) {
			self.host.publish(self.name + '_error', data);
		};

	}
};