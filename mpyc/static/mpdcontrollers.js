"use strict";

var app = angular.module('mpd', []);
app.constant('constant', {
	PLAYLIST_PAGE_SIZE: 50,
	CURRENTSONG_URI: '/mpd/currentsong.json',
	INFO_STREAM_URI: '/mpd/info_stream',
	PLAY_URI: '/mpd/play.json',
	PLAYLISTINFO_URI: '/mpd/playlistinfo.json',
	STATUS_URI: '/mpd/status.json',
});
app.filter('duration', function() {
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
				var show = (num != 0 || i > 1)
					str += show ? num + DURATION_SHORT_STR[i] : '';
			}
		}
		return str;
	}
});
app.filter('paging', function() {
	return function(input, startFrom) {
		/* Sometimes input is undefined for some reason */
		if (angular.isUndefined(input)) {
			return;
		}
		startFrom = +startFrom;
		return input.slice(startFrom);
	}
});
app.filter('state', function() {
	var MPD_STATES = {
		'pause': 'paused',
		'play': 'playing',
		'stop': 'stopped',
	};
	return function(state) {
		return MPD_STATES[state];
	}
});
app.filter('volume', function() {
	return function(volume) {
		if (volume == -1) {
			return "N/A";
		}
		else {
			return volume;
		}
	}
});
app.service('cache', function() {
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

function ServerSideEventCtrl($rootScope, $scope, constant) {
	$scope.msg = {};
	var sseCallback = function(msg) {
		$scope.$apply(function() {
			$scope.msg = angular.fromJson(msg.data);
		});
		$rootScope.$broadcast('idle'+$scope.msg['idle'], $scope['info']);
	}
	var source = new EventSource(constant.INFO_STREAM_URI);
	source.addEventListener('message', sseCallback, false);
}

function PlaylistInfoCtrl($rootScope, $scope, $http, $filter, constant) {
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
	$scope.pageSize = constant.PLAYLIST_PAGE_SIZE;
	$scope.numberOfPages = function() {
		return Math.ceil($scope.playlistinfo.length / $scope.pageSize);
	}
	$scope.trackDblClick = function(pos) {
		var httpConfig = {
			'params': {'songid': pos},
		};
		$http.get(constant.PLAY_URI, httpConfig).success(function() {
			$scope.currentSongPos = pos;
		});
	}
	$rootScope.$on('currentsong', function(event, currentsong) {
		$scope.currentSongPos = currentsong['pos'];
	});
	$rootScope.$on('currentsongpage', function(event, currentsongpage) {
		$scope.currentSongPage = currentsongpage;
		$scope.currentPage = currentsongpage;
	});
	var fetchPlaylist = function() {
		$http.get(constant.PLAYLISTINFO_URI).success(function(data) {
			var total_time_secs = 0;
			for (var i = 0; i < data.length; i++) {
				var current = data[i];
				var track_time = current['time'];
				total_time_secs += parseInt(track_time);
				// Replaces the time in seconds with the human readable time as rendered by the duration filter.
				current['time'] = $filter('duration')(track_time);
			}
			$scope.playlist_total_time_secs = total_time_secs;
			$scope.playlistinfo = data;
		});
	}
	fetchPlaylist();
}

function StatusCtrl($rootScope, $scope, $http, constant) {
	var STATE_TRANSITION = {
		"pause": "play",
		"stop": "play",
		"play": "pause"
	};
	$scope.broadcastCurrentSongPage = function() {
		$rootScope.$broadcast('currentsongpage', $scope.currentSongPage);
	}
	$scope.toggleState = function() {
		var current_state = $scope.status['state'];
		var new_state = STATE_TRANSITION[current_state];
		$http.get('/mpd/'+new_state+'.json').success(function() {
			$scope.status['state'] = new_state;
		});
	}
	var fetchStatus = function() {
		$http.get(constant.STATUS_URI).success(function(data) {
			$scope.status = data;
			$rootScope.$broadcast('status', data);
			$scope.currentSongPage = Math.floor(data['song'] / constant.PLAYLIST_PAGE_SIZE);
			$scope.broadcastCurrentSongPage();
		});
		$http.get(constant.CURRENTSONG_URI).success(function(data) {
			$scope.currentsong = data;
			$rootScope.$broadcast('currentsong', data);
		});
	}
	$rootScope.$on('idleplayer', function(event, args) {
		fetchStatus();
	});
	fetchStatus();
}
