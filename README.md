<p align="center">
  <img src="logo/Logomark-github-opt.png?raw=true" width="250">
  <hr/>
</p>

# Honkling : JavaScript based Keyword Spotting System

[Honkling](https://castorini.github.io/honkling/) is a novel web application with an in-browser keyword spotting system implemented with [TensorFlow.js](https://js.tensorflow.org/).

Honkling can efficiently identify simple commands (e.g., "stop" and "go") in-browser without a network connection. It demonstrates cross-platform speech recognition capabilities for interactive intelligent agents with its pure JavaScript implementation. For more details, please consult our writeup:

* Jaejun Lee, Raphael Tang, Jimmy Lin. [Honkling: In-Browser Personalization for Ubiquitous Keyword Spotting.](https://www.aclweb.org/anthology/D19-3016/) _Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing and the 9th International Joint Conference on Natural Language Processing (EMNLP-IJCNLP): System Demonstrations_, pages 91-96.
* Jaejun Lee, Raphael Tang, Jimmy Lin. [JavaScript Convolutional Neural Networks for Keyword Spotting in the Browser: An Experimental Analysis.](https://arxiv.org/abs/1810.12859) _arXiv:1810.12859_, October 2018.

Honkling implements a residual convolutional neural network [1] and utilizes [Speech Commands Dataset](https://research.googleblog.com/2017/08/launching-speech-commands-dataset.html) for training.

## Honkling-node & Honkling-assistant

Node.js implementation of Honkling is also available under [Honking-node](https://github.com/castorini/honkling/tree/master/honkling-node) folder.

[Honkling-assistant](https://github.com/castorini/honkling/tree/master/honkling-assistant) is a customizable voice-enabled virtual assistants implemented using Honkling-node and [Electron](https://electronjs.org/).

Details about Honkling-node and Honkling-assistant can be found in:

* Jaejun Lee, Raphael Tang, and Jimmy Lin. 2019. [Universal Voice-Enabled User Interfaces Using JavaScript.](https://doi.org/10.1145/3308557.3308693) _Proceedings of the 24th International Conference on Intelligent User Interfaces: Companion (IUI '19)_, pages 81-82.

## Personalization

Honkling can be personalized to individual user by recognizing the accent.
From our experiments it is found that only 5 recordings of individual keyword can increase accuracy by up to 10\%!
With GPU, personalization can be achieved within only 8 seconds.

## Pre-trained Weights

Pre-trained weights are available at [Honkling-models](https://github.com/castorini/honkling-models).

Please run the following command to obtain pre-trained weights:

`git submodule update --init --recursive`

## Customizing Honkling

Please refer [`honkling` branch of honk](https://github.com/castorini/honk/tree/honkling#training-model-for-honkling) to customize keyword set or train a new model.

Once you obtain weight file in json format using honk, move the file into `weights/` directory and append `weights[<wight_id>] =` to link it to weights object.

Depending on change, [config.js](`https://github.com/castorini/honkling/blob/master/common/config.js`) has to be updated and a model object can be instantiated as `let model = new SpeechResModel(<wight_id>, commands);`

## Performance Evaluation

It is possible to evaluate the in-browser neural network inference performance of your device on the [Evaluate Performance](https://castorini.github.io/honkling/view/evaluatePerformance.html) page of Honkling.

Evaluation is conducted on a subset of the validation and test sets used in training.
Once the evaluation is complete, it will generate reports on input processing time ([MFCC](https://en.wikipedia.org/wiki/Mel-frequency_cepstrum)) and inference time.

As part of our research, we explored the network slimming [2] technique to analyze trade-offs between accuracy and inference latency.
With honkling, it is possible to evaluate the performance on a pruned model as well!

The following is the evaluation result on Macbook Pro (2017) with Firefox:

| Model | Amount Pruned (%) | Accuracy (%) | Innput Processing (ms) | Inference (ms) |
| ------ | ------ | ------ | ------ | ------ |
| RES8-NARROW | - | 90.78 | 21 | 10 |
| RES8-NARROW-40 | 40 | 88.99 | 21 | 9 |
| RES8-NARROW-80 | 80 | 84.90 | 22 | 9 |
| RES8 | - | 93.96 | 23 | 24 |
| RES8-40 | 40 | 93.99 | 23 | 17 |
| RES8-80 | 80 | 91.66 | 22 | 11 |

* Note that WebGL is disabled on Chrome and enabled on Firefox by default
* Honkling uses RES8-NARROW
* Details on model architecture can be found in the paper

## Reference

1. Raphael Tang and Jimmy Lin. [Deep Residual Learning for Small-Footprint Keyword Spotting.](https://ieeexplore.ieee.org/document/8462688) _Proceedings of the 2018 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP 2018)_, pages 5484-5488.
2.  Zhuang Liu, Jianguo Li, Zhiqiang Shen, Gao Huang, Shoumeng Yan, Changshui Zhang. [Learning Efficient Convolutional Networks through Network Slimming.](http://openaccess.thecvf.com/content_ICCV_2017/papers/Liu_Learning_Efficient_Convolutional_ICCV_2017_paper.pdf) _Proceedings of the 2017 IEEE International Conference on Computer Vision (ICCV 2017)_, pages 2755-2763.
