import json
import librosa
import os
import random
import numpy as np
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs, unquote

HOST_NAME = '0.0.0.0'
PORT_NUMBER = 8080
DATA_DIR_PATH = '../data/speech_commands'
UNKNOWN_KEYWORD = 'unknown'
SILENCE_TAG = '__silence__'
noise_prob = 0.8

def get_noise():
    bg_noise = random.choice(background_noise)
    start_pos = random.randint(0, len(bg_noise) - sample_rate - 1)
    return bg_noise[start_pos:start_pos + sample_rate]


def get_audio(type, index):
    bg_noise = get_noise()

    data = {}
    data['index'] = index
    if index < len(audios[type]['list']):
        audio_file_name = audios[type]['list'][index]
        audio_class = os.path.dirname(audio_file_name)
        audio_file_path = os.path.join(DATA_DIR_PATH, audio_file_name)
        features = librosa.core.load(audio_file_path, sr=sample_rate)[0]
    else:
        audio_file_name = SILENCE_TAG
        audio_class = SILENCE_TAG
        features = np.zeros(sample_rate, dtype=np.float32)

    features = np.pad(features, (0, sample_rate - len(features)), 'constant')

    noise_flag = False
    if type == 'val' and (random.random() < noise_prob or audio_class == SILENCE_TAG):
        a = random.random() * 0.1
        features = np.clip(a * bg_noise + features, -1, 1)
        noise_flag = True

    if audio_class in command_list:
        data['command'] = audio_class
        data['commandIndex'] = command_list.index(audio_class)
        data['class'] = 'positive'
    else :
        data['command'] = UNKNOWN_KEYWORD
        # TODO :: should silence be separate index?
        data['commandIndex'] = command_list.index(UNKNOWN_KEYWORD)
        data['class'] = 'negative'

    print('\n[' + type + ' - ' + data['class'] + '] retrieving ' + str(index) + ' / ' + str(audios[type]['size']) + ' - ' + audio_file_name + ' ( noise = ' + str(noise_flag) + ' )')

    data['features'] = features.tolist()
    return data

def init_bg_noise():
    global background_noise

    background_noise_folder = os.path.join(DATA_DIR_PATH, '_background_noise_')
    background_noise = []
    for file in os.listdir(background_noise_folder):
        if file.endswith('.wav'):
            audio_file_path = os.path.join(background_noise_folder, file)
            features = librosa.core.load(audio_file_path, sr=sample_rate)[0]
            background_noise.append(features)

    print('background_noise initialization completed')


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
            init_bg_noise()
            result = {'testCount' : audios['test']['size'], 'valCount' : audios['val']['size']}
            print('init result', result)

        elif path == '/get_audio':
            type = params['type'][0]
            index = int(params['index'][0])
            result = get_audio(type, index)

            if index == audios[type]['size']-1:
                print('===================== audio retrieval for ' + type + ' set ' + str(audios[type]['size']) + ' is completed =====================\n\n')

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
    global audios

    """
    val_set 3091
    val_set audio_files 2834
    test_set 3079
    test_set audio_files 2823
    """

    val_file_list = 'dev_set.txt'
    val_size = 3091
    with open(val_file_list) as f:
        content = f.readlines()
    val_set = [x.strip() for x in content]
    random.shuffle(val_set)

    test_file_list = 'test_set.txt'
    test_size = 3079
    with open(test_file_list) as f:
        content = f.readlines()
    test_set = [x.strip() for x in content]
    random.shuffle(test_set)

    audios = {
        'val': {
            'size' : val_size,
            'list' : val_set
        },
        'test': {
            'size' : test_size,
            'list' : test_set
        }
    }

    server_address = (HOST_NAME, PORT_NUMBER)
    httpd = HTTPServer(server_address, AudioRequestHandler)
    print('running server ...')
    httpd.serve_forever()
