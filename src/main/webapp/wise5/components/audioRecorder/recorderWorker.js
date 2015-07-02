importScripts('libmp3lame.min.js');

var recLength = 0,
  recBuffer = [],
  mp3codec,
  sampleRate;

this.onmessage = function(e) {
  switch (e.data.command) {
    case 'init':
      init(e.data.sampleRate);
      break;
    case 'record':
      record(e.data.buffer);
      break;
    case 'exportMP3':
      exportMP3();
      break;
  }
};

function init(rate) {
  sampleRate = rate;
  mp3codec = Lame.init();

  Lame.set_mode(mp3codec, Lame.MONO);
  Lame.set_num_channels(mp3codec, 1);
  Lame.set_num_samples(mp3codec, -1);
  Lame.set_in_samplerate(mp3codec, sampleRate);
  Lame.set_out_samplerate(mp3codec, sampleRate);
  Lame.set_bitrate(mp3codec, 16);

  Lame.init_params(mp3codec);
}

function record(inputBuffer) {
  recBuffer.push(inputBuffer);
  recLength += inputBuffer.length;
}

function exportMP3() {
  var buffer = mergeBuffers();
  var mp3data = Lame.encode_buffer_ieee_float(mp3codec, buffer, buffer);
  var mp3Blob = new Blob(
    [ new Uint8Array(mp3data.data) ],
    { type: 'audio/mp3' }
  );
  this.postMessage(mp3Blob);
  Lame.encode_flush(mp3codec);
  Lame.close(mp3codec);
  mp3codec = null;
  recLength = 0;
  recBuffer = [];
  init(sampleRate);
}

function mergeBuffers() {
  var result = new Float32Array(recLength),
    offset = 0, i = 0, len = recBuffer.length;
  for (; i < len; i++) {
    result.set(recBuffer[i], offset);
    offset += recBuffer[i].length;
  }
  return result;
}