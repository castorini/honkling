import librosa
import numpy as np
import torch
import random
from argparse import ArgumentParser

# Preprocessing logics of Honk
# noise are off shifting is no longer random
# usage :
#     python ./preprocessing.py --file "data/test.wav"

sample_rate = 16000

def print_data(name, data) :
    print name, '\t', data.shape, '\n', data
    if (np.iscomplex(np.min(data))) :
        print '\trange : ( ', np.min(data), ' ~ ', np.max(data), ' )'
        print '\tmean : ', np.mean(data)
        print '\tmdedian : ', np.median(data) , '\n'
    else :
        print '\trange : ( ', round(np.min(data), 10), ' ~ ', round(np.max(data), 10), ' )'
        print '\tmean : ', round(np.mean(data), 10)
        print '\tmdedian : ', round(np.median(data), 10) , '\n'

def timeshift_audio(config, data):
    shift = (sample_rate * config["timeshift_ms"]) // 1000
    shift = random.randint(-shift, shift)
    print 'shift = ', shift, '\n'
    a = -min(0, shift)
    b = max(0, shift)
    data = np.pad(data, (a, b), "constant")
    return data[:len(data) - a] if a else data[b:]

def preprocess_audio(data, config):
    amp_spectrum = librosa.core.stft(data, n_fft=config["n_fft"], hop_length=config["hop_length"], pad_mode='constant');
    print_data('amp_spectrum data', amp_spectrum)

    # np.abs(D[f, t]) is the magnitude of frequency bin f at frame t
    power_spectrum = np.abs(amp_spectrum)**2
    print_data('power spectrogram data', power_spectrum)

    # corresponding librosa operations

    # S, _ = librosa.spectrum._spectrogram(y=data, n_fft=config["n_fft"], hop_length=config["hop_length"],
    #                         power=2)
    # print_data('power spectrogram generated through _spectrogram', S)

    mel_basis = librosa.filters.mel(sample_rate, n_fft=config["n_fft"], n_mels=config["n_mels"], fmin=config["fmin"], fmax=config["fmax"])
    print_data('mel_basis', mel_basis)

    data = np.dot(mel_basis, power_spectrum)
    print_data('melspectrogram data', data)

    # corresponding librosa operations

    # data = librosa.feature.melspectrogram(data, sample_rate, n_mels=config["n_mels"], hop_length=config["hop_length"], n_fft=config["n_fft"], fmin=config["fmin"], fmax=config["fmax"])
    # print_data('melspectrogram data', data)

    data[data > 0] = np.log(data[data > 0])
    print_data('logged melspectrogram data', data)
    data = [np.matmul(config["dct_filters"], x) for x in np.split(data, data.shape[1], axis=1)]
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
        data = librosa.core.load(example, sample_rate)[0]

    print_data('loaded data', data)

    data = np.pad(data, (0, max(0, in_len - len(data))), "constant")
    print_data('padded data', data)

    if timeshift:
        data = timeshift_audio(config, data)

    print_data('shifted data', data)

    data = preprocess_audio(data, config)

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
        "n_fft" : 512, # window size (limited by browser)
        "hop_length" : 160,
        "input_length" : sample_rate,
        "timeshift_ms" : 0,
        "fmin" : 20,
        "fmax" : 4000,
    };

    config["dct_filters"] = librosa.filters.dct(config["n_dct_filters"], config["n_mels"])

    print_data('dct_filter', config["dct_filters"])

    data = preprocess(config, args.filename)


if __name__ == "__main__":
    main()
