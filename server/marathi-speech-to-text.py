import os
import sys
import json
import sounddevice as sd
import vosk
import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

# --------------------------
# SPEECH RECOGNITION (Vosk)
# --------------------------
MODEL_PATH = "vosk-model-marathi"  # path to downloaded model

if not os.path.exists(MODEL_PATH):
    print("❌ Marathi model not found! Please download and set MODEL_PATH.")
    sys.exit()

model = vosk.Model(MODEL_PATH)
rec = vosk.KaldiRecognizer(model, 16000)

def record_and_recognize(seconds=5):
    print("🎤 Speak now in Marathi...")
    audio = sd.rec(int(seconds * 16000), samplerate=16000, channels=1, dtype='int16')
    sd.wait()
    if rec.AcceptWaveform(audio):
        result = rec.Result()
        text = json.loads(result)["text"]
        return text
    return ""

# --------------------------
# TRANSLATION (IndicTrans2)
# --------------------------
device = "cuda" if torch.cuda.is_available() else "cpu"

translation_model = AutoModelForSeq2SeqLM.from_pretrained("ai4bharat/indictrans2-en", trust_remote_code=True).to(device)
translation_tokenizer = AutoTokenizer.from_pretrained("ai4bharat/indictrans2-en", trust_remote_code=True)

def translate_marathi_to_english(text):
    inputs = translation_tokenizer(text, return_tensors="pt").to(device)
    with torch.no_grad():
        outputs = translation_model.generate(**inputs, max_length=128)
    return translation_tokenizer.decode(outputs[0], skip_special_tokens=True)

# --------------------------
# MAIN FLOW
# --------------------------
if __name__ == "__main__":
    marathi_text = record_and_recognize(7)
    print("📝 Marathi recognized:", marathi_text)

    if marathi_text.strip():
        english_text = translate_marathi_to_english(marathi_text)
        print("✅ English translation:", english_text)
