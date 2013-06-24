#!/usr/bin/python

import os
import flask

app = flask.Flask(__name__)
DEFAULT_SETTINGS = {
		'MPD_HOST': '127.0.0.1',
		'MPD_PORT': 6000,
		'MPD_PASS': None,
		}
app.default_settings = DEFAULT_SETTINGS
# Load defaults.
app.config.from_object('mpyc.default_settings')
# Load user config.
app.config.from_pyfile(os.path.expanduser('~/.mpyc.conf'))

import mpyc.views
