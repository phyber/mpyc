#!/usr/bin/python

import json
import flask

from mpyc import app
from mpyc.exceptions import InvalidCommand
import mpyc.mpdclient

JSON_SEPARATORS = (',', ':')

MPC = mpyc.mpdclient.MPC(app.config)

def jsonify(arg):
	"""
	Produces JSON output based on the given argument.
	If the argument is None (command producing the arg didn't
	produce output, create an empty dict for returning to the frontend.
	Returns a flask.Response() to the caller.
	"""
	if arg is None:
		arg = {}
	status_code = 200
	if 'error' in arg:
		status_code = 501
	return flask.Response(
		response=flask.json.dumps(arg, separators=JSON_SEPARATORS),
		status=status_code,
		mimetype='application/json'
		)

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
	return jsonify(data)
