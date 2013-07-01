#!/usr/bin/python

from mpyc import app

# Run application
app.run(
		host=app.config['HOST'],
		port=app.config['PORT'],
		threaded=True
		)
