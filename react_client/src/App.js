import React, { useState } from 'react';
import axios from 'axios';
import ReactPlayer from "react-player";

function App() {
  const [text, setText] = useState(''); // for store the input text to speech model
  const [file, setFile] = useState(null); // for store the .wav file input for speech to text model
  const [transcription, setTranscription] = useState(''); // for store the text output from speech to text model
  const [isPlaying, setIsPlaying] = useState(false); // for store the ReactPlayer parameter
  const [audioUrl, setAudioUrl] = useState(''); // for store the url audio file from text to speech model output

  // change the state of ReactPlayer parameter
  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  // for handle the changes in textarea form
  const handleChange = (e) => {
    setText(e.target.value);
  };

  // for handle the changes in input file
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // handle the submit button for text to speech feature
  const handleButtonText = async (event) => {
    event.preventDefault();
    try {
      if (text !== '') {
        const response = await axios.post('http://localhost:5000/predict_text', { text });
        if (response.data.success) {
          console.log('done text to speech');
          // Get the filepath from the response
          const newAudioUrl = `http://localhost:5000/get_audio/${response.data.audio_url}`;
          // Set the audio URL in your frontend state
          setAudioUrl(newAudioUrl);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // handle the submit button for speech to text feature
  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/predict_audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        console.log('done speech to text')
        setTranscription(response.data.transcription);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div>
      <h1>Text To Speech</h1>
      <form onSubmit={handleButtonText} id="tts_form">
        <textarea
          value={text}
          onChange={handleChange}
          placeholder="Enter text..."
          rows="4"
          cols="50"
        />
        <br />
        <button type="submit">Generate Audio</button>
      </form>
      <ReactPlayer
        url={audioUrl}
        height="50px"
        playing={isPlaying}
        controls={true}
        onPlay={handlePlay}
        onPause={handlePause}
      />
      <h1>Speech to Text</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleSubmit}>Generate Text</button>
      {transcription && <div><h2>Transcription:</h2><p>{transcription}</p></div>}
    </div>
  );
}

export default App;
