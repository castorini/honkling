import gzip
import math
import os
import pathlib
import random
import tarfile
import time
import wave
import pyaudio
import librosa
import numpy as np
import sounddevice as sd

class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

CHUNK = 1000
FORMAT = pyaudio.paInt16
SAMPLE_SIZE = 2
CHANNELS = 1
SAMPLE_RATE = 44100
INITIAL_NOISE_DROP_RATE = 0.045
INITIAL_NOISE_INDEX = math.floor(SAMPLE_RATE * INITIAL_NOISE_DROP_RATE)
RECORD_SECONDS = 1
sd.default.samplerate = SAMPLE_RATE

POS_COUNT = 50
NEG_COUNT = 10

KEYWORDS = ['bird', 'dog', 'eight', 'four', 'happy', 'left', 'marvin', 'no', 'on', 'seven', 'six', 'tree', 'up', 'wow', 'zero', 'bed', 'cat', 'down', 'five', 'go', 'house', 'nine', 'off', 'one', 'right', 'sheila', 'stop', 'three', 'two', 'yes']
POS_KEYWORDS = ['yes', 'no', 'up', 'down', 'left', 'right', 'on', 'off', 'stop', 'go']

def play_audio(keyword, file_name):
    audio_data, _ = librosa.core.load(file_name, SAMPLE_RATE)
    print(len(audio_data))

    print("\n--- playing recorded audio for " + keyword)
    sd.play(audio_data, SAMPLE_RATE, blocking=True)
    sd.stop()

def record_audio(keyword):
    global sample
    p = pyaudio.PyAudio()

    print(bcolors.WARNING + "\n--- target word : " + keyword + bcolors.ENDC)
    print("> press enter to record")
    input()
    print(bcolors.FAIL + "--- recording started" + bcolors.ENDC)
    stream = p.open(format=FORMAT,
                    channels=CHANNELS,
                    rate=SAMPLE_RATE,
                    input=True,
                    frames_per_buffer=CHUNK)

    frames = []

    for i in range(0, int((SAMPLE_RATE / CHUNK) * RECORD_SECONDS)):
        data = stream.read(CHUNK)
        frames.append(data)

    print(bcolors.FAIL + "--- recording stop" + bcolors.ENDC)
    stream.stop_stream()
    stream.close()
    p.terminate()

    return frames

def postprocess(keyword, index, input_file):
    # load it using librosa
    audio = librosa.core.load(input_file, SAMPLE_RATE)
    # drop initial noise and save
    audio[0][:INITIAL_NOISE_INDEX] = 0
    # bring audio to center
    data = np.roll(audio[0], -math.floor(INITIAL_NOISE_INDEX/2))

    file_name = name+"/"+keyword+"/"+str(index)+".wav"
    librosa.output.write_wav(file_name, data ,SAMPLE_RATE)

    return data

print("> What is your name?")
name = input()

if name == "":
    name = "Potter"

print("> welcome! ", name, ", let's practice recording !")

print("> for each recording, you will be given a target keyword")
print("> press enter to start recording. you only have 1 second!")

ready = False
while not ready:
    frames = record_audio('test')
    wf = wave.open('test.wav', 'wb')
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(SAMPLE_SIZE)
    wf.setframerate(SAMPLE_RATE)
    wf.writeframes(b''.join(frames))
    wf.close()
    time.sleep(0.5)
    play_audio('test', 'test.wav')
    os.remove('test.wav')
    print("\n> did it capture your recording? [y/n]")
    response = input()
    ready = response == 'y'
    if not ready:
        print("> let's try again")

time.sleep(1)

# setting up directory
pathlib.Path(name).mkdir(parents=True, exist_ok=True)

remaining = {}
total_count = 0

for keyword in KEYWORDS:
    pathlib.Path(name+"/"+keyword).mkdir(parents=True, exist_ok=True)
    if keyword in POS_KEYWORDS:
        remaining[keyword] = POS_COUNT
        total_count += POS_COUNT
    else:
        remaining[keyword] = NEG_COUNT
        total_count += NEG_COUNT

print("\n> Okay! let's go! number of recording to do : ", total_count)

for i in range(total_count):
    keyword = list(remaining.keys())[random.randrange(len(remaining))]

    ready = False
    while not ready:
        frames = record_audio(keyword)
        wf = wave.open('temp.wav', 'wb')
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(SAMPLE_SIZE)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(b''.join(frames))
        wf.close()
        time.sleep(0.5)
        play_audio(keyword, 'temp.wav')
        print("\n> did it capture your recording? [y/n]")
        response = input()
        ready = response == 'y'
        if not ready:
            os.remove('temp.wav')
            print("> let's try again")

    postprocess(keyword, remaining[keyword], 'temp.wav')
    os.remove('temp.wav')
    time.sleep(0.25)

    remaining[keyword] -= 1

    if remaining[keyword] == 0:
        remaining.pop(keyword)
        print(bcolors.OKGREEN + '> finsihed with keyword ', keyword, "! " , math.floor(i / total_count * 100), '% completed' + bcolors.ENDC)

    if int(i % 20) == 0 and i != 0:
        print(bcolors.OKGREEN + '> ', math.floor(i / total_count * 100), '% completed (' + str(i) +' / '+ str(total_count) + ')' + bcolors.ENDC)

tar_file_name = name+"_audio"
tar = tarfile.open(tar_file_name + ".tar.gz", "w:gz")
tar.add(name, arcname=tar_file_name)
tar.close()

print(bcolors.OKGREEN + '\n> Congratulation! You are done!\n> please send me ' + tar_file_name + '.tar.gz. Thank you' + bcolors.ENDC)
