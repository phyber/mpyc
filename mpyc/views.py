#!/usr/bin/python

import flask
from mpyc import app
from mpyc import mpd
import mpyc.utils
from flask.ext.mpd.exceptions import InvalidCommand


@app.route("/", methods=['GET'])
def root():
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
        data = mpd.execute(mpd_command)
    except InvalidCommand as e:
        error = {'error': e.msg}
        return mpyc.utils.jsonify(error)
    except Exception as e:
        return "Fail: {e}".format(e=e)
    return mpyc.utils.jsonify(data)


@app.route("/mpd/info_stream")
def mpd_info_stream():
    """
    Handles /mpd/info_stream GET requests.
    Returns a HTML5 text/event-stream stream.
    """
    def event_stream():
        """
        Yields events from MPD's 'idle' command, allowing the front-end
        to auto-update.
        """
        # Outside of a request we have to get the context
        with app.app_context():
            while True:
                message = mpd.idle()
                yield 'data: {data}\n\n'.format(
                    data=flask.json.dumps(
                        message,
                        separators=mpyc.utils.JSON_SEPARATORS
                    )
                )

    return flask.Response(
        event_stream(),
        mimetype='text/event-stream')
