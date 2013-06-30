#!/usr/bin/python

import os
import flask

app = flask.Flask(__name__)
# Load defaults.
app.config.from_object('mpyc.default_settings')
# Load user config, don't complain if it's missing.
app.config.from_pyfile('../local.cfg', silent=True)

import mpyc.views
