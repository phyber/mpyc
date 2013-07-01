#!/usr/bin/python

# Running with debugging on will automatically reload Flask when files are
# changed.
DEBUG = False

# IP address and port that the app server should listen on.
HOST = "0.0.0.0"
PORT = None

# MPD connection details.
MPD_HOST = "${settings:mpdhost}"
MPD_PORT = ${settings:mpdport}
MPD_PASS = None
