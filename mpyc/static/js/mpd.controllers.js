"use strict";

angular.module('mpd.controllers', [])
.controller('ServerSideEventCtrl', function($scope, constant) {
	$scope.msg = {};
	var sseCallback = function(msg) {
		$scope.$apply(function() {
			$scope.msg = angular.fromJson(msg.data);
		});
		console.log("Received MPD idle: " + msg.data);
		$scope.$broadcast('idle' + $scope.msg['idle'], $scope['info']);
	}
	var source = new EventSource(constant.INFO_STREAM_URI);
	source.addEventListener('message', sseCallback, false);
})
.controller('PlaylistInfoCtrl', function($rootScope, $scope, $http, $filter, $location, constant) {
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
	var setPage = function(page) {
		$scope.currentPage = page;
		$location.path('/playlist/page/' + page);
	}
	$scope.previousPage = function() {
		setPage($scope.currentPage - 1);
	}
	$scope.nextPage = function() {
		setPage($scope.currentPage + 1);
	}
	$scope.numberOfPages = function() {
		return Math.ceil($scope.playlistinfo.length / $scope.pageSize);
	}
	$scope.$watch(function() {
		return $location.path();
	}, function() {
		console.log("location.path changed.");
	});

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
})
.controller('StatusCtrl', function($rootScope, $scope, $http, constant) {
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
	$scope.$on('idleplayer', function(event, args) {
		fetchStatus();
	});
	fetchStatus();
});
