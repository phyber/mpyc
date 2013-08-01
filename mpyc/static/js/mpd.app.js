"use strict";

angular.module('mpd', [
	'mpd.controllers',
	'mpd.filters',
	'mpd.services',
])
.config(function($httpProvider, $locationProvider) {
	$httpProvider.defaults.cache = false;
	$locationProvider.defaults.hashPrefix('!');
	$locationProvider.defaults.html5mode(true);
})
.constant('constant', {
	PLAYLIST_PAGE_SIZE: 50,
	CURRENTSONG_URI: '/mpd/currentsong.json',
	INFO_STREAM_URI: '/mpd/info_stream',
	PLAY_URI: '/mpd/play.json',
	PLAYLISTINFO_URI: '/mpd/playlistinfo.json',
	STATUS_URI: '/mpd/status.json',
});
