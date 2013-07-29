import os
import flask
from flask.ext.mpd import MPD

app = flask.Flask(__name__)
# Load defaults.
app.config.from_object('mpyc.default_settings')
# Load user config, don't complain if it's missing.
app.config.from_pyfile('../local.cfg', silent=True)
mpd = MPD(app)

import mpyc.views
