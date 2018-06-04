import librosa
import numpy as np
import torch
from argparse import ArgumentParser

# Preprocessing logics of Honk
# noise are off shifting is no longer random
# usage :
#     ./preprocessing.py --file "data/test.wav"

sampleRate = 44100

def timeshift_audio(config, data):
    shift = (sampleRate * config["timeshift_ms"]) // 1000
    # shift = random.randint(-shift, shift)
    print('shift = ', shift, '\n\r');
    a = -min(0, shift)
    b = max(0, shift)
    data = np.pad(data, (a, b), "constant")
    return data[:len(data) - a] if a else data[b:]

def preprocess_audio(data, n_mels, dct_filters):
    data = librosa.feature.melspectrogram(data, sampleRate, n_mels=n_mels, hop_length=441, n_fft=1323, fmin=20, fmax=4000)
    print('melspectrogram data\n\r', data.shape, '\n\r', data, '\n\r')
    data[data > 0] = np.log(data[data > 0])
    data = [np.matmul(dct_filters, x) for x in np.split(data, data.shape[1], axis=1)]
    data = np.array(data, order="F").squeeze(2).astype(np.float32)
    print('transformed data\n\r', data.shape, '\n\r', data, '\n\r')
    return data

def preprocess(config, example, timeshift=True, silence=False):
    if silence:
        example = "__silence__"

    in_len = config["input_length"]
    if silence:
        data = np.zeros(in_len, dtype=np.float32)
    else:
        data = librosa.core.load(example, sampleRate)[0]

    print('loaded data\n\r', data.shape, '\n\r', data, '\n\r')

    data = np.pad(data, (0, max(0, in_len - len(data))), "constant")
    print('padded data\n\r', len(data), '\n\r', data, '\n\r')
    if timeshift:
        data = timeshift_audio(config, data)

    print('shifted data\n\r', data.shape, '\n\r', data, '\n\r')

    data = preprocess_audio(data, config["n_mels"], config["filters"])

    print('preprocessed data\n\r', data.shape, '\n\r', data, '\n\r')

    data = torch.from_numpy(data);

    return data

def main():
    parser = ArgumentParser()
    parser.add_argument("-f", "--file", dest="filename", default="data/test.wav")
    args = parser.parse_args()

    config = {
        "n_dct_filters" : 40,
        "n_mels" : 40,
        "input_length" : sampleRate,
        "timeshift_ms" : 100,
        "shift" : 800
    };

    config["filters"] = librosa.filters.dct(config["n_dct_filters"], config["n_mels"])

    print('filters\n\r', config["filters"].shape, '\n\r', config["filters"], '\n\r')

    data = preprocess(config, args.filename)

    print('final data\n\r', data.shape, '\n\r', data, '\n\r')
    

if __name__ == "__main__":
    main()