'use strict';

(function (window) {

  var WORKER_PATH = 'wise5/components/audioRecorder/recorderWorker.js';

  var Recorder = function Recorder(stream) {
    var context, audioInput, processor, gain, gainFunction, processorFunction;
    var recording = false,
        currCallback;

    // http://typedarray.org/from-microphone-to-wav-with-getusermedia-and-web-audio/
    context = new AudioContext();
    gainFunction = context.createGain || context.createGainNode;
    gain = gainFunction.call(context);
    audioInput = context.createMediaStreamSource(stream);
    console.log('Media stream created.');
    console.log("input sample rate " + context.sampleRate);

    audioInput.connect(gain);
    console.log('Input connected to audio context destination.');

    processorFunction = context.createScriptProcessor || context.createJavaScriptNode;
    processor = processorFunction.call(context, 4096, 2, 2);

    var worker = new Worker(WORKER_PATH);
    worker.postMessage({
      command: 'init',
      sampleRate: context.sampleRate
    });

    processor.onaudioprocess = function (e) {
      if (!recording) return;
      worker.postMessage({
        command: 'record',
        buffer: e.inputBuffer.getChannelData(0)
      });
    };

    this.record = function () {
      recording = true;
    };

    this.stop = function () {
      recording = false;
    };

    this.clear = function () {
      worker.postMessage({ command: 'clear' });
    };

    this.close = function () {
      context.close();
    };

    this.exportMP3 = function (cb) {
      currCallback = cb;
      if (!currCallback) throw new Error('Callback not set');
      worker.postMessage({ command: 'exportMP3' });
    };

    worker.onmessage = function (e) {
      var blob = e.data;
      currCallback(blob);
    };

    gain.connect(processor);
    processor.connect(context.destination);
  };

  window.Recorder = Recorder;
})(window);