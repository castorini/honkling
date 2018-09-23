import json
import librosa
import os
from random import shuffle
import numpy as np
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs, unquote

HOST_NAME = '0.0.0.0'
PORT_NUMBER = 8080
DATA_DIR_PATH = '../data/speech_commands'
UNKNOWN_KEYWORD = 'unknown'

sample_rate = 0
command_list = []

def get_audio(index):
    audio_file_name = testing_list[index]
    data = {}

    data['index'] = index
    audio_class = os.path.dirname(audio_file_name)
    if audio_class in command_list:
        data['command'] = audio_class
        data['commandIndex'] = command_list.index(audio_class)
        data['class'] = 'positive'
    else :
        data['command'] = UNKNOWN_KEYWORD
        data['commandIndex'] = command_list.index(UNKNOWN_KEYWORD)
        data['class'] = 'negative'

    print('\nretrieving ' + str(index) + ' / ' + str(test_size) + ' - ' + audio_file_name + ' (' + data['class'] + ')')

    audio_file_path = os.path.join(DATA_DIR_PATH, audio_file_name)
    features = librosa.core.load(audio_file_path, sr=sample_rate)[0]
    features = np.pad(features, (0, sample_rate - len(features)), 'constant')

    data['features'] = features.tolist()
    return data

class AudioRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global sample_rate, command_list

        print(urlparse(self.path))
        parsed_url = urlparse(self.path)

        params = parse_qs(unquote(parsed_url.query))
        path = parsed_url.path

        result = None

        if path == '/init':
            sample_rate = int(params['sampleRate'][0])
            command_list = unquote(params['commands'][0]).split(',')
            result = {'totalCount' : test_size}

            print('init result', result)

        elif path == '/get_audio':
            index = int(params['index'][0])
            result = get_audio(index)

            if index == test_size - 1:
                print('===================== audio retrieval for all ' + str(test_size) + ' is completed =====================\n\n')
        # send headers
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        response = json.dumps(result)
        # Write content as utf-8 data
        self.wfile.write(response.encode())

        return

if __name__ == '__main__':
    global testing_list, test_size

    testing_list_file = os.path.join(DATA_DIR_PATH, 'testing_list.txt')
    with open(testing_list_file) as f:
        content = f.readlines()
    testing_list = [x.strip() for x in content]
    shuffle(testing_list)
    test_size = len(testing_list)

    server_address = (HOST_NAME, PORT_NUMBER)
    httpd = HTTPServer(server_address, AudioRequestHandler)
    print('running server ...')
    httpd.serve_forever()
