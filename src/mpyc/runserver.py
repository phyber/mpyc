#!/usr/bin/python

from mpyc import app


# Run application
def main():
    app.run(host=app.config['HOST'], port=app.config['PORT'])
