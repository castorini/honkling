import json
import librosa
import os
import random
import ssl
import numpy as np
import data_collector as dc
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs, unquote

HOST_NAME = '0.0.0.0'
# ENV = "DEV"
# ENV = "TEST"
ENV = "PROD"
DATA_DIR_PATH = '../data/speech_commands'
UNKNOWN_KEYWORD = 'unknown'
SILENCE_KEYWORD = 'silence'
noise_prob = 0.8
sample_rate = 16000
data_collectors = {}
random_obj = {}

def get_noise(rand):
    bg_noise = rand.choice(background_noise)
    start_pos = rand.randint(0, len(bg_noise) - sample_rate - 1)
    return bg_noise[start_pos:start_pos + sample_rate]


def get_audio(app_id, type, index):
    bg_noise = get_noise(random_obj[app_id])

    data = {}
    data['index'] = index
    if index < len(audios[type]['list']):
        audio_file_name = audios[type]['list'][index]
        audio_class = os.path.dirname(audio_file_name)
        audio_file_path = os.path.join(DATA_DIR_PATH, audio_file_name)
        features = librosa.core.load(audio_file_path, sr=sample_rate)[0]
    else:
        audio_file_name = SILENCE_KEYWORD
        audio_class = SILENCE_KEYWORD
        features = np.zeros(sample_rate, dtype=np.float32)

    features = np.pad(features, (0, sample_rate - len(features)), 'constant')

    noise_flag = False
    if audio_class == SILENCE_KEYWORD:
        a = random_obj[app_id].random() * 0.1
        features = np.clip(a * bg_noise + features, -1, 1)
        noise_flag = True

    if audio_class == SILENCE_KEYWORD:
        data['command'] = SILENCE_KEYWORD
        data['commandIndex'] = command_list.index(SILENCE_KEYWORD)
        data['class'] = 'negative'
    elif audio_class in command_list:
        data['command'] = audio_class
        data['commandIndex'] = command_list.index(audio_class)
        data['class'] = 'positive'
    else:
        data['command'] = UNKNOWN_KEYWORD
        data['commandIndex'] = command_list.index(UNKNOWN_KEYWORD)
        data['class'] = 'negative'

    print('\n ID : ' + str(app_id) + ' - [' + type + ' - ' + data['class'] + '] retrieving ' + str(index) + ' / ' + str(audios[type]['size']) + ' - ' + audio_file_name + ' ( noise = ' + str(noise_flag) + ' )')

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

def store_data(params):
    app_id = int(params['appId'][0])
    type = params['type'][0]
    audio_class = params['class'][0]
    mfcc_time = float(params['mfccCompTime'][0])
    inference_time = float(params['inferenceTime'][0])
    result = params['result'][0] == "true"
    total_time = mfcc_time + inference_time

    report = data_collectors[app_id][type]

    report["summary"]["total_count"] = report["summary"]["total_count"] + 1
    report[audio_class]["total_count"] = report[audio_class]["total_count"] + 1
    if result:
        report["summary"]["success_count"] = report["summary"]["success_count"] + 1
        report[audio_class]["success_count"] = report[audio_class]["success_count"] + 1

    report["summary"]["collector"]["mfcc"].insert(mfcc_time)
    report["summary"]["collector"]["inference"].insert(inference_time)
    report["summary"]["collector"]["process"].insert(total_time)

    report[audio_class]["collector"]["mfcc"].insert(mfcc_time)
    report[audio_class]["collector"]["inference"].insert(inference_time)
    report[audio_class]["collector"]["process"].insert(total_time)

def get_report(app_id, type):
    report = data_collectors[app_id][type]

    for key, val in report.items():
        if key == "type":
            continue;

        if val["total_count"] != 0:
            val["accuracy"] = val["success_count"]/val["total_count"]
        else:
            val["accuracy"] = 0

        val["mfcc"] = val["collector"]["mfcc"].get_summary()
        val["inference"] = val["collector"]["inference"].get_summary()
        val["process"] = val["collector"]["process"].get_summary()

        val.pop('collector', None)

    if ENV != "DEV":
        with open('result/'+str(app_id)+'-'+type+'.json', 'w') as f:
            json.dump(report, f, sort_keys=True, indent=4)

    data_collectors[app_id].pop(type, None)

    return report

def init_data_collectors(app_id):
    global data_collectors

    def init_collector_set():
        return {
            "mfcc": dc.DataCollector("mfcc computation time", "ms", 3),
            "inference": dc.DataCollector("inference time", "ms", 3),
            "process": dc.DataCollector("overall process time", "ms", 3),
        }

    def init_report_set():
        return {
            "total_count" : 0,
            "success_count" : 0,
            "collector" : init_collector_set(),
        }

    if app_id not in data_collectors:
        data_collectors[app_id] = {
            "val" : {
                "type" : "val",
                "summary" : init_report_set(),
                "positive" : init_report_set(),
                "negative" : init_report_set()
            },
            "test" : {
                "type" : "test",
                "summary" : init_report_set(),
                "positive" : init_report_set(),
                "negative" : init_report_set()
            }
        }
    else:
        if 'val' not in data_collectors[app_id]:
            data_collectors[app_id]["val"] = {
                "type" : "val",
                "summary" : init_report_set(),
                "positive" : init_report_set(),
                "negative" : init_report_set()
            }
        if 'test' not in data_collectors[app_id]:
            data_collectors[app_id]["test"] = {
                "type" : "test",
                "summary" : init_report_set(),
                "positive" : init_report_set(),
                "negative" : init_report_set()
            }

class AudioRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global command_list, random_obj

        print(urlparse(self.path))
        parsed_url = urlparse(self.path)

        params = parse_qs(unquote(parsed_url.query))
        path = parsed_url.path

        result = None

        if path == '/init':
            app_id = int(params['appId'][0])
            command_list = unquote(params['commands'][0]).split(',')

            result = {
                'testCount' : 0,
                'valCount' : 0,
                'testTotal' : audios['test']['size'],
                'valTotal' : audios['val']['size']
            }
            if app_id in data_collectors:
                if 'val' in data_collectors[app_id]:
                    result['valCount'] = data_collectors[app_id]['val']['summary']['total_count']
                if 'test' in data_collectors[app_id]:
                    result['testCount'] = data_collectors[app_id]['test']['summary']['total_count']
            init_data_collectors(app_id)
            random_obj[app_id] = random.Random(10)
            print('init result', result)

        elif path == '/get_audio':
            app_id = int(params['appId'][0])
            type = params['type'][0]
            index = int(params['index'][0])
            result = get_audio(app_id, type, index)

        elif path == '/store_data':
            store_data(params)

        elif path == '/get_report':
            app_id = int(params['appId'][0])
            type = params['type'][0]
            result = get_report(app_id, type)

            print('===================== audio retrieval for ' + str(app_id) + ' - ' + type + ' is completed =====================\n\n')

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

    random.seed(0)

    val_file_list = 'dev_set.txt'
    val_size = 3091
    if ENV == "DEV":
        val_size = 20
    with open(val_file_list) as f:
        content = f.readlines()
    val_set = [x.strip() for x in content]
    random.shuffle(val_set)
    if ENV == "DEV":
        val_set[:16]

    test_file_list = 'test_set.txt'
    test_size = 3079
    if ENV == "DEV":
        test_size = 20
    with open(test_file_list) as f:
        content = f.readlines()
    test_set = [x.strip() for x in content]
    random.shuffle(test_set)
    if ENV == "DEV":
        test_set[:16]

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
    init_bg_noise()

    if ENV == "PROD":
        server_address = (HOST_NAME, 443)
        httpd = HTTPServer(server_address, AudioRequestHandler)
        httpd.socket = ssl.wrap_socket (httpd.socket,
           certfile='/etc/letsencrypt/live/honkling.xyz/fullchain.pem',
           keyfile='/etc/letsencrypt/live/honkling.xyz/privkey.pem',
           server_side=True)
        print('prod server on port 443')
    else:
        server_address = (HOST_NAME, 8080)
        httpd = HTTPServer(server_address, AudioRequestHandler)
        print('dev server on port 8080')

    httpd.serve_forever()
