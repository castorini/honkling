import librosa
import numpy as np
import torch
import random
from argparse import ArgumentParser

# Preprocessing logics of Honk
# noise are off shifting is no longer random
# usage :
#     python ./preprocessing.py --file "data/test.wav"

sampleRate = 16000

def print_data(name, data) :
    print name, '\t', data.shape, '\n', data
    print '\trange : ( ', np.min(data), ' ~ ', np.max(data), ' )'
    print '\tmean : ', np.mean(data)
    print '\tmdedian : ', np.median(data) , '\n'

def timeshift_audio(config, data):
    shift = (sampleRate * config["timeshift_ms"]) // 1000
    shift = random.randint(-shift, shift)
    print 'shift = ', shift, '\n'
    a = -min(0, shift)
    b = max(0, shift)
    data = np.pad(data, (a, b), "constant")
    return data[:len(data) - a] if a else data[b:]

def preprocess_audio(data, n_mels, dct_filters):
    data = librosa.feature.melspectrogram(data, sampleRate, n_mels=n_mels, hop_length=sampleRate//100, n_fft=512, fmin=20, fmax=4000)
    print_data('melspectrogram data', data)
    data[data > 0] = np.log(data[data > 0])
    print_data('logged melspectrogram data', data)
    data = [np.matmul(dct_filters, x) for x in np.split(data, data.shape[1], axis=1)]
    data = np.array(data, order="F").squeeze(2).astype(np.float32)
    print_data('dct_filted data', data)
    return data

def preprocess(config, example, timeshift=True, silence=False):
    if silence:
        example = "__silence__"

    in_len = config["input_length"]
    if silence:
        data = np.zeros(in_len, dtype=np.float32)
    else:
        data = librosa.core.load(example, sampleRate)[0]

    print_data('loaded data', data)

    data = np.pad(data, (0, max(0, in_len - len(data))), "constant")
    print_data('padded data', data)

    if timeshift:
        data = timeshift_audio(config, data)

    print_data('shifted data', data)

    data = preprocess_audio(data, config["n_mels"], config["filters"])

    print_data('preprocessed data', data)

    # data = torch.from_numpy(data);

    return data

def main():
    parser = ArgumentParser()
    parser.add_argument("-f", "--file", dest="filename", default="data/test.wav")
    args = parser.parse_args()

    config = {
        "n_dct_filters" : 40,
        "n_mels" : 40,
        "input_length" : sampleRate,
        "timeshift_ms" : 0,
    };

    config["filters"] = librosa.filters.dct(config["n_dct_filters"], config["n_mels"])

    # print_data('dct_filter', config["filters"])

    data = preprocess(config, args.filename)

    print_data('final data', data)


if __name__ == "__main__":
    main()
