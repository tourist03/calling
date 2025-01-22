import React, { useState, useEffect, useRef } from 'react';
import './CallScreen.css';
// Import the image directly
import profileImage from '../assets/profile-placeholder.jpg';
import callAudio from '../assets/Voice 001.m4a'; // Updated to use your m4a file

const CallScreen = () => {
  const [callState, setCallState] = useState('incoming'); // 'incoming' or 'ongoing'
  const [callDuration, setCallDuration] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [showDialpad, setShowDialpad] = useState(false);
  
  // Create audio ref
  const audioRef = useRef(new Audio(callAudio));
  const audioTimeoutRef = useRef(null);
  const durationIntervalRef = useRef(null);

  useEffect(() => {
    // Configure audio
    audioRef.current.loop = false;
    
    // Set initial volume
    audioRef.current.volume = 0.8; // Set to 80% volume by default
    
    const handleAudioEnd = () => {
      console.log('Audio finished playing');
    };
    
    audioRef.current.addEventListener('ended', handleAudioEnd);
    
    // Cleanup on component unmount
    return () => {
      audioRef.current.removeEventListener('ended', handleAudioEnd);
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Try to scroll after component mounts
    const scrollTimeout = setTimeout(() => {
      window.scrollTo({
        top: 1,
        behavior: 'smooth'
      });
    }, 500);

    // Vibration pattern for incoming call
    const startVibration = () => {
      if ('vibrate' in navigator) {
        console.log('Vibration supported, starting...');
        // More intense vibration pattern: [vibrate, pause] repeated
        const pattern = [800, 800, 800, 800, 800, 800];
        try {
          navigator.vibrate(pattern);
          console.log('Vibration started');
          
          // Repeat vibration every 3.2 seconds (sum of pattern duration)
          const vibrateInterval = setInterval(() => {
            navigator.vibrate(pattern);
            console.log('Vibration pattern repeating');
          }, 4800);
          
          return vibrateInterval;
        } catch (error) {
          console.error('Vibration error:', error);
        }
      } else {
        console.log('Vibration not supported');
      }
    };

    let vibrateInterval;
    if (callState === 'incoming') {
      vibrateInterval = startVibration();
    } else if (callState === 'ongoing') {
      // Stop vibration and start call duration timer
      if ('vibrate' in navigator) {
        navigator.vibrate(0); // Stop any ongoing vibration
      }
      durationIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => {
        clearInterval(durationIntervalRef.current);
        clearTimeout(scrollTimeout);
      };
    }

    // Cleanup function
    return () => {
      if (vibrateInterval) {
        clearInterval(vibrateInterval);
      }
      if ('vibrate' in navigator) {
        navigator.vibrate(0); // Stop any ongoing vibration
        console.log('Vibration stopped');
      }
      clearTimeout(scrollTimeout);
    };
  }, [callState]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Initial scroll to hide URL bar
    setTimeout(() => {
      window.scrollTo(0, 1);
    }, 100);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    console.log('Image path:', profileImage);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
    setCallState('ongoing');
    
    // Clear any existing timeout
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
    }
    
    // Changed to 2 seconds
    audioTimeoutRef.current = setTimeout(() => {
      audioRef.current.currentTime = 0;
      try {
        audioRef.current.play().catch(error => {
          console.log('Audio playback error:', error);
        });
      } catch (error) {
        console.log('Audio playback error:', error);
      }
    }, 2000);
  };

  const handleEndCall = () => {
    // Clear the timeout if call ends before audio plays
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
    }
    // Stop audio if it's playing
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCallState('incoming');
    setCallDuration(0);
  };

  // Handle mute toggle
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    audioRef.current.muted = !isMuted;
  };

  // Handle speaker toggle
  const handleSpeakerToggle = () => {
    setIsSpeaker(!isSpeaker);
    // You might want to adjust volume or audio output here
    audioRef.current.volume = !isSpeaker ? 1.0 : 0.5;
  };

  const testVibration = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([1000]);
      console.log('Test vibration triggered');
    } else {
      console.log('Vibration not supported');
    }
  };

  const renderDialpad = () => {
    return (
      <div className="dialpad-overlay">
        <div className="dialpad-container">
          <div className="dialpad-display">
            <span>Carol</span>
            <span className="dialpad-time">{formatTime(callDuration)}</span>
          </div>
          <div className="dialpad-grid">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
              <button key={key} className="dialpad-key">
                {key}
              </button>
            ))}
          </div>
          <button className="hide-dialpad" onClick={() => setShowDialpad(false)}>
            <i className="fas fa-chevron-down"></i>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`call-screen ${isScrolled ? 'scrolled' : ''}`}>
      <div className="background-image">
        <img 
          src={profileImage} 
          alt="" 
          onError={(e) => {
            console.error('Image failed to load');
            console.log('Image path:', profileImage);
          }}
        />
      </div>
      <div className="content-overlay">
        {callState === 'incoming' ? (
          <>
            <div className="caller-info incoming">
              <div className="network-status">
                <i className="fas fa-globe-americas"></i>
                <span>International Call</span>
              </div>
              <h1 className="caller-name">Carol</h1>
              <p className="phone-number">+1 (617) 659-4175</p>
              <div className="location-info">
                <i className="fas fa-map-marker-alt"></i>
                <span>Boston, MA</span>
              </div>
              <p className="call-status">Incoming call</p>
            </div>
            
            <div className="incoming-actions">
              <div className="decline-section">
                <button className="decline-call-btn">
                  <i className="fas fa-phone-slash"></i>
                </button>
                <span>Decline</span>
              </div>
              
              <div className="accept-section">
                <button className="accept-call-btn" onClick={handleAnswer}>
                  <i className="fas fa-phone"></i>
                </button>
                <span>Accept</span>
              </div>
            </div>
          </>
        ) : (
          <div className="ongoing-call-container">
            <div className="call-header">
              <div className="network-status">
                <i className="fas fa-signal"></i>
                <span>HD Voice</span>
              </div>
              <div className="encryption-status">
                <i className="fas fa-lock"></i>
                <span>End-to-end encrypted</span>
              </div>
            </div>

            <div className="caller-info-ongoing">
              <div className="caller-avatar">
                <img src={profileImage} alt="Carol" />
                <div className="caller-status"></div>
              </div>
              <h1 className="caller-name">Carol</h1>
              <p className="phone-number">+1 (617) 659-4175</p>
              <p className="call-duration">{formatTime(callDuration)}</p>
            </div>
            
            <div className="call-actions">
              <div className="call-controls primary-controls">
                <button className={`control-btn ${isMuted ? 'active' : ''}`} onClick={() => setIsMuted(!isMuted)}>
                  <i className={`fas fa-microphone${isMuted ? '-slash' : ''}`}></i>
                  <span>Mute</span>
                </button>
                <button className={`control-btn ${isVideoEnabled ? 'active' : ''}`} onClick={() => setIsVideoEnabled(!isVideoEnabled)}>
                  <i className="fas fa-video"></i>
                  <span>Video</span>
                </button>
                <button className={`control-btn ${isSpeaker ? 'active' : ''}`} onClick={() => setIsSpeaker(!isSpeaker)}>
                  <i className="fas fa-volume-up"></i>
                  <span>Audio</span>
                </button>
              </div>
              
              <div className="call-controls secondary-controls">
                <button className="control-btn" onClick={() => setShowDialpad(true)}>
                  <i className="fas fa-keyboard"></i>
                  <span>Keypad</span>
                </button>
                <button className="control-btn">
                  <i className="fas fa-pause"></i>
                  <span>Hold</span>
                </button>
                <button className="control-btn">
                  <i className="fas fa-user-plus"></i>
                  <span>Add</span>
                </button>
              </div>
              
              <button className="end-call-btn" onClick={handleEndCall}>
                <i className="fas fa-phone-slash"></i>
              </button>
            </div>
          </div>
        )}
        {/* <button onClick={testVibration} style={{position: 'absolute', top: 10, right: 10, zIndex: 1000}}>
          Test Vibration
        </button> */}
      </div>
      {showDialpad && renderDialpad()}
    </div>
  );
};

export default CallScreen; 