"use strict";

angular.module('mpd.services', [])
.service('cache', function() {
	var values = {};
	return {
		get: function(key) {
			return values[key];
		},
		set: function(key, value) {
			values[key] = value;
		},
	};
});
