#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs, unquote
import numpy as np
import json
import librosa
import os

HOST_NAME = '0.0.0.0'
PORT_NUMBER = 8080
DATA_DIR_PATH = '../data/speech_commands'

audio_files = {}
unknown_audio_files = {}
size_per_unknown_keyword = 0
unknown_keywords = []
sample_rate = 0;

def init_audio_files(commands, size):
    print('\ninitializing dataset for commands ' + str(commands) + ' with '
          + str(size) + ' audios each')

    global audio_files, unknown_audio_files, size_per_unknown_keyword, unknown_keywords

    if bool(audio_files):
        audio_files = {}
        unknown_audio_files = {}
        size_per_unknown_keyword = 0
        unknown_keywords = []

    # generate unknown keyword sets
    for folder_name in os.listdir(DATA_DIR_PATH):
        if folder_name == '_background_noise_':
            continue
        folder_path = os.path.join(DATA_DIR_PATH, folder_name)
        if os.path.isdir(folder_path) and folder_name not in commands:
            unknown_keywords.append(folder_name)
            unknown_audio_files[folder_name] = []

    print('unknown keywords : ' + str(unknown_keywords))

    # populate positive sets
    for folder_name in commands:
        if folder_name == 'unknown':
            continue
        folder_path = os.path.join(DATA_DIR_PATH, folder_name)
        audio_files[folder_name] = os.listdir(folder_path)[:size]

    # populate negative sets
    size_per_unknown_keyword = size // len(unknown_keywords) + 1
    print('number of commands in unknown is ' + str(len(unknown_keywords)) +
          ' each command with ' + str(size_per_unknown_keyword) + ' audios each')
    for folder_name in unknown_keywords:
        folder_path = os.path.join(DATA_DIR_PATH, folder_name)
        unknown_audio_files[folder_name] = os.listdir(folder_path)[:size_per_unknown_keyword]

    print('< positive commands counts >')
    for audio_command in audio_files:
        print('\t', audio_command, len(audio_files[audio_command]))
    print('< negative commands counts >')
    for audio_command in unknown_audio_files:
        print('\t', audio_command, len(unknown_audio_files[audio_command]))

    result = {}
    result['positiveAudioCount'] = size # TODO :: size should contain correct count in case there are not enough audio files
    result['negativeAudioCount'] = size_per_unknown_keyword
    result['commands'] = commands
    result['unknownKeywords'] = unknown_keywords
    result['totalCount'] = size * len(audio_files) + size_per_unknown_keyword * len(unknown_audio_files)

    return result

def get_audio(command, index):
    if command == 'unknown':
        command = unknown_keywords[index % len(unknown_keywords)]
        index = index // len(unknown_keywords)

        file_name = unknown_audio_files[command][index]
        print('\nretrieving [negative] ' + str(index) + 'th audio for ' + command + ' (' + file_name + ')')
    else :
        index = index % len(audio_files[command])
        file_name = audio_files[command][index]
        print('\nretrieving [positive] ' + str(index) + 'th audio for ' + command + ' (' + file_name + ')')

    file_path = os.path.join(DATA_DIR_PATH, command, file_name)
    data = librosa.core.load(file_path, sr=sample_rate)[0]

    features = np.pad(data, (0, sample_rate - len(data)), 'constant')

    data = {}
    data['command'] = command
    data['index'] = index
    data['fileName'] = file_name
    data['sampleRate'] = sample_rate
    data['features'] = features.tolist()

    return data

class AudioRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global sample_rate

        print(urlparse(self.path))
        parsed_url = urlparse(self.path)

        params = parse_qs(unquote(parsed_url.query))
        path = parsed_url.path

        if path == '/init':
            commands = unquote(params['commands'][0]).split(',')
            size = int(params['size'][0])
            sample_rate = int(params['sampleRate'][0])
            result = init_audio_files(commands, size)
        elif path == '/get_audio':
            command = params['command'][0]
            index = int(params['index'][0])
            result = get_audio(command, index)
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
    print('starting server ...')

    #Server settings
    server_address = (HOST_NAME, PORT_NUMBER)
    httpd = HTTPServer(server_address, AudioRequestHandler)
    print('running server ...')
    httpd.serve_forever()
