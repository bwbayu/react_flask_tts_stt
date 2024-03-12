from faster_whisper import WhisperModel
from transformers import VitsModel, AutoTokenizer
import torch
from scipy.io import wavfile
import numpy as np
from flask import Flask, request, jsonify, send_file
from num2words import num2words
from flask_cors import CORS
import os
import uuid

app = Flask(__name__, static_url_path='', static_folder='static')
CORS(app, origins='*')

# load model
# model_stt = WhisperModel("medium")
model_stt = WhisperModel("medium", device="cpu", compute_type="int8")
model_tts = VitsModel.from_pretrained("facebook/mms-tts-ind")
processor_tts = AutoTokenizer.from_pretrained("facebook/mms-tts-ind")

# text processing for convert number to word, ex. 4 -> empat
def text_preprocessing(text):
    words = []
    for word in text.split():
        if word.isdigit():
            words.append(num2words(int(word), lang='id')) # indonesian word
        else:
            words.append(word)
    return ' '.join(words)

# endpoint for get audio for text to speech
@app.route('/get_audio/<filename>', methods=['GET'])
def get_audio(filename):
    base_dir = "static"
    filepath = os.path.join(base_dir, filename)
    return send_file(filepath, mimetype="audio/wav")

# endpoint for run the model for text to speech engine
@app.route('/predict_text', methods=['POST'])
def tts():
    # get data
    data = request.get_json()
    text = text_preprocessing(data['text'])
    # convert to tensor
    inputs = processor_tts(text, return_tensors="pt")

    # input the tensor to the model and get the waveform image of the audio
    with torch.no_grad():
        output = model_tts(**inputs).waveform

    # convert waveform image numpy
    output_np = output.squeeze().numpy()

    # generate uuid
    unique_id = uuid.uuid4()

    # save the numpy to .wav file
    filename = f"tts_{unique_id}.wav"
    filepath = os.path.join("static", filename)
    wavfile.write(filepath, rate=model_tts.config.sampling_rate, data=output_np)

    return jsonify({"success": True, "audio_url": filename})

# endpoint for run the model for speech to text engine
@app.route('/predict_audio', methods=['POST'])
def stt():
    # get data
    file = request.files['file']
    # error handling
    if file.filename == '':
        return jsonify({'error': 'No file uploaded'}), 400
    
    if file and file.filename.endswith('.wav'):
        # save the .wav file to the folder static in folder flask_sv
        file_path = os.path.join(app.static_folder, 'input_audio.wav')
        file.save(file_path)
        # run the model
        segments, info = model_stt.transcribe(file_path)
        # init the empty text
        text = ""
        # iterate the output text
        for segment in segments:
            text += segment.text
        return jsonify({'transcription': text, "success": True}), 200
    else:
        return jsonify({'error': 'Invalid file format, only .wav files are accepted'}), 400

# index endpoint
@app.route('/')
def index():
    return "reload complete"

if __name__ == '__main__':
    app.run(debug=True)