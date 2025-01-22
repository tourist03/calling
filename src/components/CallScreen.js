import React, { useState, useEffect } from 'react';
import './CallScreen.css';

const CallScreen = () => {
  const [callState, setCallState] = useState('incoming'); // 'incoming' or 'ongoing'
  const [callDuration, setCallDuration] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  
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
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => {
        clearInterval(timer);
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(0); // Stop vibration
      console.log('Vibration stopped on answer');
    }
    setCallState('ongoing');
  };

  const testVibration = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([1000]);
      console.log('Test vibration triggered');
    } else {
      console.log('Vibration not supported');
    }
  };

  return (
    <div className={`call-screen ${isScrolled ? 'scrolled' : ''}`}>
      <div className="background-image">
        <img src={`${process.env.PUBLIC_URL}/profile-placeholder.jpg`} alt="" />
      </div>
      <div className="content-overlay">
        {callState === 'incoming' ? (
          <>
            <div className="caller-info incoming">
              <h1 className="caller-name">John Doe</h1>
              <p className="call-status">Incoming call<span>...</span></p>
            </div>
            
            <div className="incoming-call-actions">
              <button className="decline-call-btn">
                <i className="fas fa-phone-slash"></i>
              </button>
              <button className="accept-call-btn" onClick={handleAnswer}>
                <i className="fas fa-phone"></i>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="caller-info">
              <h1 className="caller-name">John Doe</h1>
              <p className="call-duration">{formatTime(callDuration)}</p>
            </div>
            
            <div className="call-actions">
              <div className="call-controls">
                <button className="control-btn">
                  <i className="fas fa-volume-up"></i>
                  <span>Speaker</span>
                </button>
                <button className="control-btn">
                  <i className="fas fa-microphone-slash"></i>
                  <span>Mute</span>
                </button>
                <button className="control-btn">
                  <i className="fas fa-keyboard"></i>
                  <span>Keypad</span>
                </button>
              </div>
              
              <button className="end-call-btn">
                <i className="fas fa-phone-slash"></i>
              </button>
            </div>
          </>
        )}
        <button onClick={testVibration} style={{position: 'absolute', top: 10, right: 10, zIndex: 1000}}>
          Test Vibration
        </button>
      </div>
    </div>
  );
};

export default CallScreen; 