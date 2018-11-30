function AudioInputManager() {
  this.events = {};

  // audio
  this.commands_2048 = ["silence", "unknown", "left", "right", "up", "down"]; // to be replace
  this.lastCommandTime = 0;
  this.commandDelay = 1000;

  this.micAudioProcessor = new MicAudioProcessor(audioConfig);
  this.model = new SpeechResModel("2048", this.commands_2048);

  this.moveMapping = {
    "up": 0, // Up
    "right": 1, // Right
    "down": 2, // Down
    "left": 3 // Left
  }

  this.listen();
}

AudioInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

AudioInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

AudioInputManager.prototype.processCommand = function(command) {
  if (command != 'silence' && command != 'unknown') {
    let currentTime = new Date().getTime();

    if (currentTime > this.lastCommandTime + this.commandDelay) {
      console.log('input command ', command);
      this.lastCommandTime = new Date().getTime();

      this.emit("move", this.moveMapping[command]);
    }
  }
};

AudioInputManager.prototype.listen = function () {
  var self = this;

  this.micAudioProcessor.getMicPermission().done(function() {
    setInterval(function() {
      let offlineProcessor = new OfflineAudioProcessor(audioConfig, self.micAudioProcessor.getData());
      offlineProcessor.getMFCC().done(function(mfccData) {
        let command = self.commands_2048[predict(mfccData, self.model)];
        self.processCommand(command);
      })
    }, predictionFrequency);
  }).fail(function() {
    alert('mic permission is required, please enable the mic usage!')
  })

  // Respond to button presses
  this.bindButtonPress(".retry-button", this.restart);
  this.bindButtonPress(".restart-button", this.restart);
  this.bindButtonPress(".keep-playing-button", this.keepPlaying);
};

AudioInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};

AudioInputManager.prototype.keepPlaying = function (event) {
  event.preventDefault();
  this.emit("keepPlaying");
};

AudioInputManager.prototype.bindButtonPress = function (selector, fn) {
  var button = document.querySelector(selector);
  button.addEventListener("click", fn.bind(this));
  button.addEventListener(this.eventTouchend, fn.bind(this));
};
