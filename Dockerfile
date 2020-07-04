FROM nvidia/cuda:10.2-base

# set up environment
RUN apt-get update

# Install nodejs
RUN apt-get -y install curl dirmngr apt-transport-https lsb-release ca-certificates
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs

# prepare environment
WORKDIR /app
COPY package.json /app
RUN npm install

ENV PATH /app/node_modules/.bin:$PATH
WORKDIR /app/src/

CMD ["npm", "start"]
