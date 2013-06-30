#!/usr/bin/python

import mpd
import socket
from mpyc.exceptions import InvalidCommand

# Commands not in this list will be rejected by the execute method.
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
	"""
	MPD client class.

	>>> mpc = MPC(app.config)
	"""
	def __init__(self, config):
		self._host = config['MPD_HOST']
		self._port = config['MPD_PORT']
		self._password = config['MPD_PASS']
		self._client = None

	def connect(self):
		"""
		Connect to MPD using the credentials the class was initialized
		with.

		>>> connect()
		True

		Returns True on success and False on any error.
		"""
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
		"""
		Disconnect from MPD.
		"""
		try:
			self._client.disconnect()
		except:
			pass
		self._client = None

	def execute(self, func_name, args=None):
		"""
		Execute a command on the MPD.

		Connects to MPD if necessary.

		Given commands are checked against the VALID_COMMANDS tuple.
		mpyc.exceptions.InvalidCommand is raised if it's not a
		valid command.

		If the command is valid, it's passed to MPD and the results
		returned to the caller.

		>>> execute('stats')
		{"uptime":"3700562","db_update":"1370545488",,...}
		"""
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
