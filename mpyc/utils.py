#!/usr/bin/python

import flask

JSON_SEPARATORS = (',', ':')

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
