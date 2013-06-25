#!/usr/bin/python

import mpd
import socket
from mpyc.exceptions import InvalidCommand

VALID_COMMANDS = (
		# Control commands
		'pause',
		'play',
		# Info commands
		'currentsong',
		'playlistinfo',
		'stats',
		'status',
		)

class MPC:
	def __init__(self, config):
		self._host = config['MPD_HOST']
		self._port = config['MPD_PORT']
		self._password = config['MPD_PASS']
		self._client = None

	def connect(self):
		conn_info = {
				'host': self._host,
				'port': self._port,
				}
		self._client = mpd.MPDClient()
		try:
			self._client.connect(**conn_info)
		except socket.error:
			return False
		return True

	def disconnect(self):
		try:
			self._client.disconnect()
		except:
			pass
		self._client = None

	def execute(self, func_name, args=None):
		if self._client is None:
			self.connect()
		if func_name in VALID_COMMANDS:
			try:
				func = getattr(self._client, func_name)
				if args is None:
					ret = func()
				else:
					ret = func(*args)
				return ret
			except socket.error as e:
				self.disconnect()
				raise
		else:
			raise InvalidCommand("Invalid command: '{}'".format(func_name))
