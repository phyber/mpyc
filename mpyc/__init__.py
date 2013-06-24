#!/usr/bin/python

import os
import flask

app = flask.Flask(__name__)
# Load defaults.
app.config.from_object('mpyc.default_settings')
# Load user config.
app.config.from_pyfile(os.path.expanduser('~/.mpyc.conf'))

import mpyc.views
