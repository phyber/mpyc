"use strict";

/*
 * Variables for functions/filters
 */
var SECS_DAY = 86400;
var SECS_HOUR = 3600;
var SECS_MIN = 60;
var SECS_SEC = 1;
var DURATION_SECS = [SECS_DAY, SECS_HOUR, SECS_MIN, SECS_SEC];
var DURATION_LONG_STR = ['d ', 'h ', 'm ', 's'];
var DURATION_SHORT_STR = [':', ':', ':', ''];

angular.module('mpdFilters', []).
	filter('duration', function() {
		return function(secs, longFormat) {
			if (secs == undefined) {
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
					var show = (num != 0 || i > 1)
						str += show ? num + DURATION_SHORT_STR[i] : '';
				}
			}
			return str;
		}
	}).
	filter('paging', function() {
		return function(input, startFrom) {
			/* Sometimes input is undefined for some reason */
			if (input == undefined) {
				return;
			}
			startFrom = +startFrom;
			return input.slice(startFrom);
		}
	}).
	filter('state', function() {
		var MPD_STATES = {
			'pause': 'paused',
			'play': 'playing',
			'stop': 'stopped',
		};
		return function(state) {
			return MPD_STATES[state];
		}
	}).
	filter('volume', function() {
		return function(volume) {
			if (volume == -1) {
				return "N/A";
			}
			else {
				return volume;
			}
		}
	}).
	service('cache', function() {
		var values = {};
		return {
			get: function(key) {
				return values[key];
			},
			set: function(key, value) {
				values[key] = value;
			},
		};
	})
;

function PlaylistInfoCtrl($rootScope, $scope, $http, $filter) {
	$scope.headers = [
		"Time",
		"Artist",
		"Title",
		"Album"
	];
	$scope.track_info = [
		"time",
		"artist",
		"title",
		"album",
	];
	$scope.currentPage = 0;
	$scope.pageSize = 50;
	$scope.numberOfPages = function() {
		return Math.ceil($scope.playlistinfo.length / $scope.pageSize);
	}
	$rootScope.$on('currentsong', function(event, currentsong) {
		$scope.currentSongPos = currentsong['pos'];
	});
	$http.get('/mpd/playlistinfo.json').success(function(data) {
		var total_time_secs = 0;
		for (var i = 0; i < data.length; i++) {
			var current = data[i];
			var track_time = current['time'];
			total_time_secs += parseInt(track_time);
			current['time'] = $filter('duration')(track_time);
		}
		$scope.playlist_total_time_secs = total_time_secs;
		$scope.playlistinfo = data;
	});
}

function StatusCtrl($rootScope, $scope, $http) {
	$http.get('/mpd/status.json').success(function(data) {
		$scope.status = data;
		$rootScope.$broadcast('status', data);
	});
	$http.get('/mpd/currentsong.json').success(function(data) {
		$scope.currentsong = data;
		$rootScope.$broadcast('currentsong', data);
	});
}
