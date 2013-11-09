/**
 * 
 */
package utils;

import com.sun.speech.freetts.FreeTTS;
import com.sun.speech.freetts.Voice;
import com.sun.speech.freetts.VoiceManager;

/**
 * @author hirokiterashima
 *
 */
public class TTS {
	
	VoiceManager voiceManager;
	Voice voice;
	FreeTTS freetts;
	
	public TTS(String audioFileUrl) {
		voiceManager = VoiceManager.getInstance();
		voice = voiceManager.getVoice("kevin16");
        freetts = new FreeTTS(voice);
        freetts.setAudioFile(audioFileUrl);
	}
	
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		TTS tts = new TTS("/Users/hirokiterashima/output.wav");
		String text = "speak here now!";		
		tts.saveToFile(text);
    }

	public boolean saveToFile(String text) {
		// TODO Auto-generated method stub
        freetts.startup();
        voice.startBatch();
        boolean success = voice.speak(text);
        voice.endBatch();
        freetts.shutdown();		
        return success;
	}

}
