#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, HTTPServer
from scipy.io import wavfile
import numpy as np
import json

HOST_NAME = 'localhost'
PORT_NUMBER = 8081

class AudioRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # retrieve audio to respond with
        json_response = {}

        sample_rate, data = wavfile.read('../data/go/0ab3b47d_nohash_0.wav')
        data = np.pad(data, (0, sample_rate - len(data)), 'constant')

        json_response['sampleRate'] = sample_rate
        json_response['data'] = data.tolist()

        response = json.dumps(json_response)

        # Send response status code
        self.send_response(200)

        # Send headers
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        # Write content as utf-8 data
        self.wfile.write(response.encode())
        return

if __name__ == '__main__':
    print('starting server ...')

    #Server settings
    server_address = (HOST_NAME, PORT_NUMBER)
    httpd = HTTPServer(server_address, AudioRequestHandler)
    print('running server ...')
    httpd.serve_forever()

