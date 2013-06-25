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

// TODO: Make values private somehow.
var cache = {
	values: {},
	// Returns undefined if we don't have that key,
	// otherwise returns the value
	get: function(key) {
		if (key in this.values) {
			return this.values[key];
		}
		return undefined;
	},
	// Returns the value that was set.
	set: function(key, value) {
		this.values[key] = value;
		return value;
	},
}

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
function mpd_currentsong_show(complete, data) {
	if (!complete) {
		return;
	}
	cache.set('currentsong', data);
	$('#playlist-pos-' + data['pos']).addClass('track-current');
	$('#mpd-current-album-text').html(data['album']);
	$('#mpd-current-artist-text').html(data['artist']);
	$('#mpd-current-track-text').html(data['title']);
	$('#mpd-current-trackdate-text').html(data['date']);
}

function mpd_playlistinfo_show(complete, data) {
	if (!complete) {
		return;
	}
	cache.set('playlistinfo', data);
	var html = '';
	var total_time = 0;
	for (var i = 0; i < data.length; i++) {
		var current = data[i];
		total_time = total_time + parseInt(current['time']);
		html += '<tr class="playlist-pos" id="playlist-pos-'+ current['pos'] +'">';
		html += '<td class="track-time track-time-color">'+ duration(current['time']) +'</div>';
		html += '<td class="track-artist track-artist-color">'+ current['artist'] +'</div>';
		html += '<td class="track-title track-title-color">'+ current['title'] +'</div>';
		html += '<td class="track-album track-album-color">'+ current['album'] +'</div>';
		html += '</tr>';
	}
	$('#mpd-playlist-table').append(html);
	$('#mpd-playlist-items-text').html(data.length);
	$('#mpd-playlist-length-text').html(duration(total_time, true));
}

/*
function mpd_stats_show(complete, data) {
	if (!complete) {
		return;
	}
	var html = 'Artists: '+ data['artists'] +'<br/>';
	html += 'Albums: '+ data['albums'] +'<br/>';
	html += 'Songs: '+ data['songs'] +'<br/>';
	html += 'Playlist time: '+ duration(data['playtime'], true) +'<br/>';
	$('#mpd-stats-text').html(html);
}
*/

function mpd_status_show(complete, data) {
	if (!complete) {
		return;
	}
	cache.set('status', data);

	$('#mpd-current-status-text').html('[' + MPD_STATES[data['state']] +']');

	var volume_text = 'Vol: ';
	if (data['volume'] == '-1') {
		volume_text += 'N/A';
	}
	else {
		volume_text += data['volume'];
	}
	$('#mpd-volume-text').html(volume_text);

	var times = data['time'].split(':');
	var current_time_str = duration(times[0]) + '/' + duration(times[1]);
	$('#mpd-current-time-text').html(current_time_str);
}

/*
 * Toggles between stop/pause and play status.
 * stop -> play
 * play -> pause
 * pause -> play
 */
function mpd_toggle_state() {
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

function mpd_update_state(complete, data, arg) {

}

var mpd_command_handler = {
	// Playback commands
	'play': mpd_update_state,
	'pause': mpd_update_state,
	// Info commands
	'currentsong': mpd_currentsong_show,
	'playlistinfo': mpd_playlistinfo_show,
	//'stats': mpd_stats_show,
	'status': mpd_status_show,
};

function mpd_execute(command) {
	var handler = mpd_command_handler[command];
	if (handler === undefined) {
		return;
	}
	var req = {
		url: '/mpd/'+command+'.json',
		data: null,
		type: 'GET',
		cache: false,
		dataType: 'json',
		beforeSend: function(data, textStatus, errorThrown) {
			handler(false, 'Fetching');
		},
		success: function(data, textStatus, errorThrown) {
			handler(true, data);
		},
		error: function(data, textStatus, errorThrown) {
			alert("Aww: "+textStatus+": "+errorThrown);
		},
		complete: function(data, textStatus, errorThrown) {
			// Some commands need followups. Like the playlistinfo command.
			switch (command) {
				// Follow up 'playlistinfo' command with 'currentsong' to highlight the 
				// currently playing song in the playlist.
				case "playlistinfo":
					mpd_execute('currentsong');
					break;
				default:
					break;
			}
		},
	}
	$.ajax(req);
}

function mpd_get_info() {
	//mpd_execute('stats');
	mpd_execute('status');
	mpd_execute('playlistinfo');
}

$(document).ready(mpd_get_info);
