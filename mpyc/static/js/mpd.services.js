"use strict";

(function() {
	var services = angular.module('mpd.services', []);
	services.service('cache', function() {
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
})();
