import json
import librosa
import os
import numpy as np
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs, unquote

HOST_NAME = '0.0.0.0'
PORT_NUMBER = 8080
DATA_DIR_PATH = '../data/speech_commands'

sample_rate = 0
neg_label_index = 0
command_list = []
test_size = 0
X_test = []
Y_test = []

def prepare_dataset():
    print('loading data set with command list = ' + str(command_list))
    print('data dir = ' + DATA_DIR_PATH)

    X = []
    Y = []

    for folder_name in os.listdir(DATA_DIR_PATH):
        path_name = os.path.join(DATA_DIR_PATH, folder_name)
        # if not a directory, continue
        if os.path.isfile(path_name):
            continue
        # if bg noise folder, continue
        elif folder_name == "_background_noise_":
            continue
        for filename in os.listdir(path_name):
            wav_name = os.path.join(path_name, filename)

            if os.path.isfile(wav_name):
                # get time series
                data = librosa.core.load(wav_name, sr=sample_rate)[0]
                data = np.pad(data, (0, sample_rate - len(data)), 'constant')
                X.append(data)
                if folder_name in command_list:
                    index = command_list.index(folder_name)
                else:
                    index = command_list.index('unknown')
                Y.append(index)

    return np.array(X), np.array(Y)

def get_audio(index):
    label_index = Y_test[index]
    data = {}
    data['commandIndex'] = int(label_index)
    data['command'] = command_list[label_index]

    data['class'] = 'positive'
    if label_index == neg_label_index:
        data['class'] = 'negative'

    print('\nretrieving ' + str(index) + ' / ' + str(test_size) + ' - ' + data['command'] + ' (' + data['class'] + ')')

    data['index'] = index
    data['features'] = X_test[index].tolist()
    return data

class AudioRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global sample_rate, command_list, test_size, neg_label_index, X_test, Y_test

        print(urlparse(self.path))
        parsed_url = urlparse(self.path)

        params = parse_qs(unquote(parsed_url.query))
        path = parsed_url.path

        if path == '/init':
            sample_rate = int(params['sampleRate'][0])
            command_list = unquote(params['commands'][0]).split(',')
            seed = int(params['randomSeed'][0])
            X, Y = prepare_dataset()
            p = np.random.RandomState(seed).permutation(len(X))[int(.9 * len(X)):]
            X_test = X[p]
            Y_test = Y[p]
            test_size = len(Y_test)
            neg_label_index = command_list.index('unknown')

            result = {}
            result['totalCount'] = test_size
            result['posCount'] = len(Y_test[Y_test != neg_label_index])
            result['negCount'] = len(Y_test[Y_test == neg_label_index])

            print('init result', result)

        elif path == '/get_audio':
            index = int(params['index'][0])
            result = get_audio(index)

            if index == test_size - 1 :
                print('\taudio retrieval for all ' + str(test_size) + ' is completed')
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
    server_address = (HOST_NAME, PORT_NUMBER)
    httpd = HTTPServer(server_address, AudioRequestHandler)
    print('running server ...')
    httpd.serve_forever()
