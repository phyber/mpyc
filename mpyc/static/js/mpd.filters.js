"use strict";

(function() {
	var filters = angular.module('mpd.filters', []);
	filters.filter('duration', function() {
		var SECS_DAY = 86400;
		var SECS_HOUR = 3600;
		var SECS_MIN = 60;
		var SECS_SEC = 1;
		var DURATION_SECS = [SECS_DAY, SECS_HOUR, SECS_MIN, SECS_SEC];
		var DURATION_LONG_STR = ['d ', 'h ', 'm ', 's'];
		var DURATION_SHORT_STR = [':', ':', ':', ''];
		return function(secs, longFormat) {
			if (angular.isUndefined(secs)) {
				return '';
			}
			var str = '';
			for (var i in DURATION_SECS) {
				var show = false;
				var num = parseInt(secs / DURATION_SECS[i]);

				secs -= num * DURATION_SECS[i];

				if (longFormat) {
					var show = (num != 0);
					str += show ? num + DURATION_LONG_STR[i] : '';
				}
				else {
					// Pad with a leading zero if it's no the 'days' value
					if (i > 0 && num < 10) {
						num = '0' + num;
					}
					// Show this number if > 0 and force it to show
					// if it's a minutes or a seconds number.
					var show = (num != 0 || i > 1);
					str += show ? num + DURATION_SHORT_STR[i] : '';
				}
			}
			return str;
		}
	});
	filters.filter('paging', function() {
		return function(input, startFrom) {
			/* Sometimes input is undefined for some reason */
			if (angular.isUndefined(input)) {
				return;
			}
			startFrom = +startFrom;
			return input.slice(startFrom);
		}
	});
	filters.filter('state', function() {
		var MPD_STATES = {
			'pause': 'paused',
			'play': 'playing',
			'stop': 'stopped',
		};
		return function(state) {
			return MPD_STATES[state];
		}
	});
	filters.filter('volume', function() {
		return function(volume) {
			if (volume == -1) {
				return "N/A";
			}
			else {
				return volume;
			}
		}
	});
})();
