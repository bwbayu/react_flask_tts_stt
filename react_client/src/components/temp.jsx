// const handleRecordingStop = async (blob) => {
//     try {
//       console.log(blob);
//       const reader = new FileReader();
//       reader.onload = () => {
//         const audioContext = new window.AudioContext();
//         audioContext.decodeAudioData(reader.result, async (buffer) => {
//           const wavBlob = new Blob([buffer], { type: 'audio/wav' });
//           console.log(wavBlob);
//           const formData = new FormData();
//           formData.append('file', wavBlob);

//           // const response = await axios.post('http://localhost:5000/predict_audio', formData, {
//           //   headers: {
//           //     'Content-Type': 'multipart/form-data'
//           //   }
//           // });
//           // if (response.data.success) {
//           //   console.log('done speech to text');
//           //   setTranscription(response.data.transcription);
//           // }
//         });
//       };
//       reader.readAsArrayBuffer(blob);
//     } catch (error) {
//       console.error('Error uploading file:', error);
//     }
//   };