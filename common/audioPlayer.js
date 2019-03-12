let audioPlayer;

class AudioPlayer {
  constructor() {
    audioPlayer = this;

    if (window.hasOwnProperty('webkitAudioContext') &&
    !window.hasOwnProperty('AudioContext')) {
      window.AudioContext = webkitAudioContext;
    }

    if (navigator.hasOwnProperty('webkitGetUserMedia') &&
    !navigator.hasOwnProperty('getUserMedia')) {
      navigator.getUserMedia = webkitGetUserMedia;
      if (!AudioContext.prototype.hasOwnProperty('createScriptProcessor')) {
        AudioContext.prototype.createScriptProcessor = AudioContext.prototype.createJavaScriptNode;
      }
    }

    this.audioContext = new AudioContext();
    this.sampleRate = audioConfig.offlineSampleRate;
    this.playDeferred = null;
    this.source = null;
  }

  play(data, onEnd) {
    this.playDeferred = $.Deferred();

    let buffer = this.audioContext.createBuffer(1, data.length, this.sampleRate);

    let channel = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i++) {
      channel[i] = data[i];
    }

    let source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.onended = onEnd;
    source.connect(this.audioContext.destination);
    source.start();

    return this.playDeferred.promise();
  }
}
