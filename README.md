# HOWL

In-browser keyword spotting for *hey firefox*

A weights can be obtained from the python implementation [howl](https://github.com/castorini/howl)

## Instructions
* Fetch trained weights: `git submodule update --init --recursive`

* [Install docker](https://docs.docker.com/engine/install/) and [enable GPU support](https://cnvrg.io/how-to-setup-docker-and-nvidia-docker-2-0-on-ubuntu-18-04/)

* `docker build -t howl .`

## In-browser keyword spotting

To see the working demo, simply run

```
docker run -it -p 8000:8000 -v $(pwd):/app/src/ howl
npm run dev
```

The server is running at localhost:8000

## Evaluating the performance of JS implementation

processed dataset for evaluation can be found from [howl](https://github.com/castorini/howl)

```
nvidia-docker run -it -p 8000:8000 -v <path_to_dataset>:/data -v $(pwd):/app/src/ howl
npm run eval
```

## Things to note
* Eventhough we use Meyda.js fore feature extraction, it has been modified quite a bit that we recommend looking at our source code directly to understand what is going on with feature extraction.
