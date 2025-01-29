import React, { useState, useEffect, useRef } from 'react';
import './CallScreen.css';
import callerImage from '../assets/profile-placeholder.jpg';
import myImage from '../assets/download.jpeg';
import videoFile from '../assets/VideoCalling.mp4';

const CallScreen = () => {
  const [callState, setCallState] = useState('incoming');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    // Lock orientation to portrait
    if (window.screen?.orientation?.lock) {
      window.screen.orientation.lock('portrait').catch(console.error);
    }
  }, []);

  const handleAnswer = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setCallState('ongoing');
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  const endCall = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    }
    window.location.href = '/';
  };

  return (
    <div className="wa-call-screen">
      {callState === 'incoming' ? (
        <div className="wa-incoming">
          <div className="wa-background">
            <img src={callerImage} alt="" />
            <div className="wa-overlay" />
          </div>
          
          <div className="wa-incoming-content">
            <div className="wa-caller-info">
              <div className="wa-caller-image">
                <img src={callerImage} alt="" />
              </div>
              <h1>Carol Anderson</h1>
              <p className="wa-call-type">
                <i className="fas fa-video"></i>
                WhatsApp video call
              </p>
            </div>

            <div className="wa-call-actions">
              <button className="wa-btn wa-decline" onClick={endCall}>
                <i className="fas fa-phone-slash"></i>
              </button>
              <button className="wa-btn wa-accept" onClick={handleAnswer}>
                <i className="fas fa-video"></i>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="wa-video-call">
          <video
            ref={remoteVideoRef}
            className="wa-remote-video"
            playsInline
            autoPlay
            loop
            src={videoFile}
          />
          
          <div className="wa-header">
            <div className="wa-call-duration">00:05</div>
          </div>

          <div className="wa-preview">
            <div className="wa-preview-container">
              <img src={myImage} alt="" className="wa-preview-img" />
              <span className="wa-preview-label">You</span>
            </div>
          </div>

          <div className="wa-controls">
            <button 
              className={`wa-control-btn ${!isVideoEnabled ? 'off' : ''}`}
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            >
              <i className={`fas fa-video${!isVideoEnabled ? '-slash' : ''}`}></i>
            </button>
            <button 
              className={`wa-control-btn ${!isAudioEnabled ? 'off' : ''}`}
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            >
              <i className={`fas fa-microphone${!isAudioEnabled ? '-slash' : ''}`}></i>
            </button>
            <button className="wa-control-btn wa-end-call" onClick={endCall}>
              <i className="fas fa-phone-slash"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallScreen; 