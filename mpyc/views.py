#!/usr/bin/python

import flask

from mpyc import app
from mpyc.exceptions import InvalidCommand
import mpyc.mpdclient
import mpyc.utils

MPC = mpyc.mpdclient.MPC(app.config)

@app.route("/", methods=['GET'])
def index_view():
	"""
	Redirects to the /mpd/
	"""
	return flask.redirect(flask.url_for('mpd_view'))

@app.route("/mpd/", methods=['GET'])
def mpd_view():
	"""
	Renders the mpd.html template.
	"""
	return flask.render_template("mpd.html")

@app.route("/mpd/<mpd_command>.json", methods=['GET'])
def mpd_command(mpd_command):
	"""
	Handles /mpd/<mpd_command>.json GET requests.
	Commands are passed to MPC.execute, the results are jsonified
	and returned.
	"""
	try:
		data = MPC.execute(mpd_command)
	except InvalidCommand as e:
		error = {'error': e.msg}
		return jsonify(error)
	except Exception as e:
		return "Fail: {}".format(e)
	return mpyc.utils.jsonify(data)
