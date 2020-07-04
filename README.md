# hey_firefox
This branch contains minimal code for the pocketsphinx/honlking based hey firefox detection demo.

Unlike the existing implementation of Honkling, this implementation functions as a web service on its own exploiting Node.js.

## Instructions
* Fetch trained weights: `git submodule update --init --recursive`

* [Install docker](https://docs.docker.com/engine/install/) and [enable GPU support](https://cnvrg.io/how-to-setup-docker-and-nvidia-docker-2-0-on-ubuntu-18-04/)

* `docker build -t honkling .`

* `nvidia-docker run -it -p 8000:8000 -v $(pwd):/app/src/ honkling` (use `docker` instead of `nvidia-docker` if GPU is missing)

Open a browser (Firefox recommended) and navigate to `localhost:8000` for honkling-based implementation

PocketSphinx-based implementation is available at `localhost:8000/pocketsphinx`. For this implementation, user needs to click start manually.
