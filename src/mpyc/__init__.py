#!/usr/bin/python

import os
import flask

app = flask.Flask(__name__)
# Load user config, don't complain if it's missing.
app.config.from_pyfile('settings', silent=True)

import mpyc.views
