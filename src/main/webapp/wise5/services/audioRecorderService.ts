import { Injectable } from "@angular/core";
import { UpgradeModule } from "@angular/upgrade/static";

@Injectable()
export class AudioRecorderService {

  mediaRecorder: MediaRecorder;
  requester: string;

  constructor(private upgrade: UpgradeModule) {
  }

  async init(constraints) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const options = {
        mimeType: 'audio/webm'
      };
      try {
        this.mediaRecorder = new MediaRecorder(stream, options);
        this.mediaRecorder.ondataavailable = (event: any) => {
          this.upgrade.$injector.get('$rootScope').$broadcast('audioRecorded',
              { requester: this.requester, audioFile: this.getAudioFile(event.data) });
        }
        this.mediaRecorder.start();
      } catch (e) {
        console.error('Exception while creating MediaRecorder:', e);
        return;
      }
    } catch (e) {
      console.error('navigator.getUserMedia error:', e);
    }
  }

  getAudioFile(blob: Blob) {
    const now = new Date().getTime();
    const filename = encodeURIComponent(`audio_${now}.webm`);
    return new File([blob], filename, {
      lastModified: now,
    });
  }

  startRecording(requester: string) {
    this.requester = requester;
    const constraints = {
      audio: {
        echoCancellation: {exact: true}
      }
    };
    this.init(constraints);
  }

  stopRecording() {
    this.mediaRecorder.stop();
  }
}
