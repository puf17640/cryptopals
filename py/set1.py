from base64 import b64decode, b64encode
from binascii import hexlify, unhexlify

def hex64(hex_string):
	return b64encode(unhexlify(hex_string))
