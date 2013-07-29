#!/usr/bin/env python2.7

from mpyc import app

# Run application
app.run(
    host=app.config.get('SERVER_HOST', None),
    port=app.config.get('SERVER_PORT', None),
    threaded=True
)
