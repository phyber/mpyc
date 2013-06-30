var mpd = (function() {
	var SECS_DAY = 86400;
	var SECS_HOUR = 3600;
	var SECS_MIN = 60;
	var SECS_SEC = 1;
	var DURATION_SECS = [SECS_DAY, SECS_HOUR, SECS_MIN, SECS_SEC];
	var DURATION_LONG_STR = ['d ', 'h ', 'm ', 's'];
	var DURATION_SHORT_STR = [':', ':', ':', ''];
	var MPD_STATE_PAUSE = 'pause';
	var MPD_STATE_PLAY = 'play';
	var MPD_STATE_STOP = 'stop';
	var MPD_STATES = {
		'pause': 'paused',
		'play': 'playing',
		'stop': 'stopped',
	};
	var TRACK_INFO = ['time', 'artist', 'title', 'album'];
	var TBODY_ROWS = 50;

	var cache = (function() {
		var values = {};
		// Returns undefined if we don't have that key,
		// otherwise returns the value
		return {
			get: function(key) {
				return values[key];
			},
			// Returns the value that was set.
			set: function(key, value) {
				values[key] = value;
			},
		};
	})();

	/*
	 * Format a number of seconds in a nice readable format.
	 * Long format: 3d 4h 27m 6s
	 * Short format: 3:04:27:06
	 */
	function duration(secs, longFormat) {
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

	// Highlights the current track in the playlist and displays current song info.
	function mpd_currentsong_show() {
		console.log("mpd_currentsong_show();");
		var data = cache.get('currentsong');
		$('.track-current').removeClass('track-current');
		$('#playlist-pos-' + data['pos']).addClass('track-current');
		$('#mpd-current-album-text').html(data['album']);
		$('#mpd-current-artist-text').html(data['artist']);
		$('#mpd-current-track-text').html(data['title']);
		$('#mpd-current-trackdate-text').html(data['date']);
	}

	function mpd_playlistinfo_show() {
		console.log("mpd_playlist_show();");
		var data = cache.get('playlistinfo');

		// Total playlist time in seconds.
		var total_time_secs = 0;
		var tbody;
		var playlist_page = 1;
		for (var i = 0; i < data.length; i++) {
			var current = data[i];
			total_time_secs = total_time_secs + parseInt(current['time']);

			// Create table row
			var tr = document.createElement('tr');
			$(tr).attr('id', 'playlist-pos-' + current['pos'])
				.addClass("playlist-pos");

			// Create table data for each element we're showing.
			for (var j = 0; j < TRACK_INFO.length; j++) {
				var type = TRACK_INFO[j];
				var str;
				if (type == 'time') {
					str = duration(current[type]);
				}
				else {
					str = current[type];
				}

				// Create the table data for this element and
				// append it to the row.
				var td = document.createElement('td');
				$(td).addClass('track-' + type)
					.addClass('track-' + type + '-color')
					// Title attribute controls mouseover text.
					.attr('title', str)
					.html(str);
				$(tr).append(td);
			}

			// Add row to table.
			// Tbody grouping, TBODY_ROWS rows per tbody
			// Always make a fresh tbody when starting.
			if (i == 0) {
				tbody = document.createElement('tbody');
				$(tbody).attr('id', 'mpd-playlist-page-' + playlist_page)
					.addClass('mpd-playlist-page')
					.addClass('mpd-playlist-page-hidden')
					.data({page: playlist_page})
					;
				$('#mpd-playlist-table').append(tbody);
			}
			else if ((i % TBODY_ROWS) == 0) {
				playlist_page += 1;
				tbody = document.createElement('tbody');
				$(tbody).attr('id', 'mpd-playlist-page-' + playlist_page)
					.addClass('mpd-playlist-page')
					.addClass('mpd-playlist-page-hidden')
					.data({page: playlist_page})
					;
				$('#mpd-playlist-table').append(tbody);
			}

			// Append row to the tbody.
			$('#mpd-playlist-page-' + playlist_page).append(tr);
		}
		mpd_playlist_set_visible_page();
		$('#mpd-playlist-items-text').html(data.length);
		$('#mpd-playlist-length-text').html(duration(total_time_secs, true));
	}

	function mpd_status_update() {
		console.log("mpd_update_status();");
		var data = cache.get('status');

		$('#mpd-current-status-text').html('[' + MPD_STATES[data['state']] +']');

		var volume_text = 'Vol: ';
		if (data['volume'] == '-1') {
			volume_text += 'N/A';
		}
		else {
			volume_text += data['volume'] + '%';
		}
		$('#mpd-volume-text').html(volume_text);

		var times = data['time'].split(':');
		var current_tracktime_str = duration(times[0]);
		var current_total_tracktime_str = duration(times[1]);
		$('#mpd-current-tracktime-text').html(current_tracktime_str);
		$('#mpd-current-total-tracktime-text').html(current_total_tracktime_str);
	}

	/*
	 * Toggles between stop/pause and play status.
	 * stop -> play
	 * play -> pause
	 * pause -> play
	 */
	function mpd_toggle_state() {
		console.log("mpd_toggle_state();");
		var state = cache.get('status')['state'];
		switch (state) {
			case MPD_STATE_PLAY:
			case MPD_STATE_PAUSE:
				mpd_execute(MPD_STATE_PAUSE);
				break;
			case MPD_STATE_STOP:
				mpd_execute(MPD_STATE_PLAY);
				break;
			default:
				break;
		}
	}

	function noop() {}

	var mpd_command_handler = {
		// Playback commands
		'play': noop,
		'pause': noop,
		// Info commands
		'currentsong': mpd_currentsong_show,
		'playlistinfo': mpd_playlistinfo_show,
		'status': mpd_status_update,
	};

	function mpd_execute(command, arg) {
		var handler = mpd_command_handler[command];
		if (handler === undefined) {
			return;
		}
		var req = {
			url: '/mpd/'+command+'.json',
			data: arg,
			type: 'GET',
			cache: false,
			dataType: 'json',
			//beforeSend: function(data, textStatus, errorThrown) {
			//	handler(false);
			//},
			success: function(data, textStatus, errorThrown) {
				cache.set(command, data);
				handler();
			},
			error: function(data, textStatus, errorThrown) {
				alert("Aww: "+textStatus+": "+errorThrown);
			},
			complete: function(data, textStatus, errorThrown) {
				// Some commands need followups. Like the playlistinfo command.
				switch (command) {
					// Follow up 'playlistinfo' command with 'currentsong' to
					// highlight the currently playing song in the playlist.
					case "playlistinfo":
						mpd_execute('currentsong');
						break;
					case "pause":
					case "play":
						mpd_execute('status');
						break;
					default:
						break;
				}
			},
		}
		$.ajax(req);
	}

	function mpd_playlist_set_visible_page() {
		console.log("mpd_playlist_set_visible_page();");
		var page_number = parseInt($('body').data('hurl').link['page']);
		if (!page_number) {
			page_number = 1;
		}
		var playlistinfo = cache.get('playlistinfo');
		if (!playlistinfo) {
			return;
		}
		var total_pages = Math.ceil(playlistinfo.length / TBODY_ROWS);
		// TODO: Simplify this.
		if (page_number < total_pages) {
			$('#next-page').css('visibility', 'visible');
		}
		else {
			$('#next-page').css('visibility', 'hidden');
		}
		if (page_number > 1) {
			$('#prev-page').css('visibility', 'visible');
		}
		else {
			$('#prev-page').css('visibility', 'hidden');
		}
		// Hide all pages.
		$('.mpd-playlist-page-visible')
			.removeClass('mpd-playlist-page-visible')
			.addClass('mpd-playlist-page-hidden');
		// Show the page that we want to see.
		$('#mpd-playlist-page-' + page_number)
			.removeClass('mpd-playlist-page-hidden')
			.addClass('mpd-playlist-page-visible');
	}

	function mpd_playlist_set_page(event) {
		var current_page = parseInt($('body').data('hurl').link['page']);
		if (!current_page) {
			current_page = 1;
		}
		var new_page = current_page;
		if (event.data.type == 'prev') {
			new_page -= 1;
		}
		else {
			new_page += 1;
		}
		$.hurl('update', {'page': new_page});
	}

	function mpd_focus_current_track_page() {
		var page = $('.track-current').parent().data()['page'];
		$.hurl('update', {'page': page});
	}

	function mpd_install_onclicks() {
		$('#mpd-current-status-text').click(mpd_toggle_state);
		$('#mpd-current-track').click(mpd_focus_current_track_page);
		$('#next-page').click({'type': 'next'}, mpd_playlist_set_page);
		$('#prev-page').click({'type': 'prev'}, mpd_playlist_set_page);
	}

	return {
		setup: function() {
			mpd_execute('status');
			mpd_execute('playlistinfo');
			mpd_install_onclicks();
			// Monitor causes an issue where it keeps reloading over and over.
			// So we're just using hurl to parse location.hash and not much else.
			$.hurl({
				'monitor': false,
			});
			$(window).bind('hashchange', function () {
				$.hurl("parse");
				mpd_playlist_set_visible_page();
			});
			// Repeating function to update track time
			/*
			(function update_track_time() {
				//
				setTimeout(function() {
					update_track_time();
				}, 1000);
			})();
			*/
		}
	};
})();

$(document).ready(mpd.setup);
