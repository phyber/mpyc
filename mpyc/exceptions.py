class InvalidCommand(Exception):
	"""
	Raised by the MPD client when a given command is not valid.
	"""
	def __init__(self, msg):
		self.msg = msg
	def __str__(self):
		return repr(self.msg)
