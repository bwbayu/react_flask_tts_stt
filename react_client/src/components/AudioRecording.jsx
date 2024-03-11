import React, { Component } from 'react';
import MicRecorder from 'mic-recorder-to-mp3';

const Mp3Recorder = new MicRecorder({ bitrate: 128 });
export default class AudioRecording extends Component {
    state = {
        isRecording: false,
        blobURL: '',
        isBlocked: false,
    };

    componentDidMount() {
        navigator.getUserMedia({ audio: true },
            () => {
                console.log("Permission Granted");
                this.setState({ isBlocked: false });
            },
            () => {
                console.log("Permission Denied");
                this.setState({ isBlocked: true });
            },
        );
    }

    start = () => {
        if (this.state.isBlocked) {
            console.log('Permission Denied');
        } else {
            Mp3Recorder.start().then(() => {
                this.setState({ isRecording: true });
            }).catch((e) => console.error(e));
        }
    }

    stop = () => {
        Mp3Recorder.stop().getMp3().then(([buffer, blob]) => {
            const blobURL = URL.createObjectURL(blob);
            this.setState({ blobURL: blobURL, isRecording: false });
            this.props.onRecordingStop(blob);
        }).catch((e) => console.error(e));
    }

    render() {
        return (
            <div>
                <div>
                    {!this.state.isRecording ?
                        (<button onClick={this.start} disabled={this.state.isRecording}>
                            Start Recording
                        </button>) :
                        (<button onClick={this.stop} disabled={!this.state.isRecording}>
                            Stop Recording
                        </button>)}
                </div>
                <div>
                    <audio src={this.state.blobURL} controls="controls" />
                </div>
            </div>
        )
    }
}