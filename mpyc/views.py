#!/usr/bin/python

import json
import flask
#import mpd
import socket

from mpyc import app
from mpyc.exceptions import InvalidCommand
import mpyc.mpdclient

JSON_SEPARATORS = (',', ':')

MPC = mpyc.mpdclient.MPC(app.config)

def jsonify(arg):
	return app.response_class(
		flask.json.dumps(arg, separators=JSON_SEPARATORS),
		mimetype='application/json'
		)

@app.route("/", methods=['GET'])
def index_view():
	return flask.render_template("index.html")

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
