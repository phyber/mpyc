#!/usr/bin/python

import json
import flask

from mpyc import app
from mpyc.exceptions import InvalidCommand
import mpyc.mpdclient

JSON_SEPARATORS = (',', ':')

MPC = mpyc.mpdclient.MPC(app.config)

def jsonify(arg):
	# Provide an empty dict to jsonify if the command doesn't produce output.
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
	return flask.redirect(flask.url_for('mpd_view'))

@app.route("/mpd/", methods=['GET'])
def mpd_view():
	return flask.render_template("mpd.html")

@app.route("/mpd/<mpd_command>.json", methods=['GET'])
def mpd_command(mpd_command):
	try:
		data = MPC.execute(mpd_command)
	except InvalidCommand as e:
		error = {'error': e.msg}
		return jsonify(error)
	except Exception as e:
		return "Fail: {}".format(e)
	return jsonify(data)
