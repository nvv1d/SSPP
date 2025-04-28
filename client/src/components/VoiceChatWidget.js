import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import voiceService from '../api/voiceService';
import { getAuth } from 'firebase/auth';

// Styled components
const Container = styled.div`
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background-color: white;
  padding: 2rem;
`;

const Title = styled.h2`
  margin: 0 0 1.5rem;
  color: #202124;
  font-size: 24px;
  text-align: center;
`;

const CharacterAvatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  background-image: ${props => `url('/characters/${props.character.toLowerCase()}.png')`};
  background-size: cover;
  background-position: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: ${props => props.active ? '#e74c3c' : '#1a73e8'};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 1rem;

  &:hover {
    background-color: ${props => props.active ? '#c0392b' : '#1665cc'};
  }
`;

const StatusDisplay = styled.div`
  background-color: #f5f9ff;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
`;

const StatusText = styled.p`
  margin: 0;
  color: #5f6368;
  font-size: 14px;
  line-height: 1.5;
`;

const VisualIndicator = styled.div`
  height: 40px;
  width: 100%;
  border-radius: 4px;
  margin: 1rem 0;
  background-color: #f1f3f4;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    height: 100%;
    width: ${props => props.active ? '30%' : '0%'};
    background-color: ${props => props.active ? '#1a73e8' : 'transparent'};
    left: 50%;
    transform: translateX(-50%);
    transition: width 0.3s ease;
  }
`;

const VoiceChatWidget = ({ character = 'Maya' }) => {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Ready to chat');
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const audioContext = useRef(null);
  const audioQueue = useRef([]);
  const audioBufferSource = useRef(null);

  // Set up audio context
  useEffect(() => {
    try {
      // Create AudioContext when component mounts
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContext.current = new AudioContext();

      return () => {
        // Clean up AudioContext when component unmounts
        if (audioContext.current && audioContext.current.state !== 'closed') {
          audioContext.current.close();
        }
      };
    } catch (error) {
      console.error('Error setting up AudioContext:', error);
      setErrorMessage('Your browser does not support audio playback.');
    }
  }, []);

  // Set up WebSocket connection and handlers
  useEffect(() => {
    const setupVoiceService = async () => {
      try {
        setStatus('Connecting...');

        // Set up message handler for audio data
        voiceService.setMessageHandler((event) => {
          if (event.data instanceof ArrayBuffer) {
            handleAudioData(event.data);
          } else {
            try {
              const jsonMessage = JSON.parse(event.data);
              console.log('Received JSON message:', jsonMessage);
              // Handle any JSON messages here
            } catch (e) {
              // Not a JSON message, might be text
              console.log('Received text message:', event.data);
            }
          }
        });

        // Set up close handler
        voiceService.setCloseHandler(() => {
          setIsConnected(false);
          setIsListening(false);
          setStatus('Connection closed. Try again.');
          console.log('WebSocket connection closed');
        });

        // Set up error handler
        voiceService.setErrorHandler((error) => {
          setIsConnected(false);
          setIsListening(false);
          setStatus('Connection error. Try again.');
          setErrorMessage('WebSocket error: ' + error.message);
          console.error('WebSocket error:', error);
        });

        // Connect to voice service
        await voiceService.connect(character);
        setIsConnected(true);
        setStatus('Connected. Ready to chat!');
      } catch (error) {
        console.error('Error connecting to voice service:', error);
        setIsConnected(false);
        setStatus('Connection failed. Try again.');
        setErrorMessage(error.message);
      }
    };

    setupVoiceService();

    return () => {
      // Clean up voice service when component unmounts
      voiceService.disconnect();
    };
  }, [character]);

  // Handle audio data received from the server
  const handleAudioData = async (arrayBuffer) => {
    if (!audioContext.current) return;

    try {
      // Add the buffer to the queue
      audioQueue.current.push(arrayBuffer);

      // If we're not currently playing, start playing
      if (!audioBufferSource.current) {
        playNextAudio();
      }
    } catch (error) {
      console.error('Error handling audio data:', error);
    }
  };

  // Play the next audio in the queue
  const playNextAudio = async () => {
    if (audioQueue.current.length === 0) {
      audioBufferSource.current = null;
      return;
    }

    try {
      const arrayBuffer = audioQueue.current.shift();
      const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);

      audioBufferSource.current = audioContext.current.createBufferSource();
      audioBufferSource.current.buffer = audioBuffer;
      audioBufferSource.current.connect(audioContext.current.destination);

      audioBufferSource.current.onended = () => {
        audioBufferSource.current = null;
        playNextAudio();
      };

      audioBufferSource.current.start();
    } catch (error) {
      console.error('Error playing audio:', error);
      audioBufferSource.current = null;
      playNextAudio(); // Skip problematic audio
    }
  };

  // Toggle listening state
  const toggleListening = async () => {
    if (!isConnected) {
      setStatus('Not connected. Please wait...');
      return;
    }

    try {
      if (!isListening) {
        setStatus('Starting microphone...');

        // Check if browser supports getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Your browser does not support audio recording');
        }

        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Create audio processor to capture microphone data
        const mediaRecorder = new MediaRecorder(stream);

        // Send audio data to server when available
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && isListening) {
            event.data.arrayBuffer().then(buffer => {
              voiceService.send(buffer);
            });
          }
        };

        // Set up recording interval
        mediaRecorder.start(250);

        // Store mediaRecorder in a ref for cleanup
        window.mediaRecorder = mediaRecorder;

        setIsListening(true);
        setStatus('Listening...');
      } else {
        // Stop recording
        if (window.mediaRecorder && window.mediaRecorder.state !== 'inactive') {
          window.mediaRecorder.stop();
          window.mediaRecorder.stream.getTracks().forEach(track => track.stop());
          window.mediaRecorder = null;
        }

        setIsListening(false);
        setStatus('Ready to chat');
      }
    } catch (error) {
      console.error('Error toggling microphone:', error);
      setIsListening(false);
      setStatus('Microphone error');
      setErrorMessage(error.message);
    }
  };

  // Get user name
  const auth = getAuth();
  const userName = auth.currentUser ? auth.currentUser.displayName : 'User';

  return (
    <Container>
      <Title>Chat with {character}</Title>
      <CharacterAvatar character={character} />

      <Button 
        onClick={toggleListening} 
        active={isListening}
        disabled={!isConnected}
      >
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </Button>

      <StatusDisplay>
        <StatusText>Status: {status}</StatusText>
        {errorMessage && <StatusText style={{ color: '#e74c3c' }}>Error: {errorMessage}</StatusText>}
        <VisualIndicator active={isListening} />
        <StatusText>{isConnected ? `Connected as ${userName}` : 'Disconnected'}</StatusText>
      </StatusDisplay>
    </Container>
  );
};

export default VoiceChatWidget;
