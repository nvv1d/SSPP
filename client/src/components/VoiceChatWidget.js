
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const WidgetContainer = styled.div`
  width: 100%;
  max-width: 800px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  margin: 2rem auto;
`;

const WidgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  color: #3cf;
  margin: 0;
`;

const UserInfoBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const UserAvatar = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
`;

const UserName = styled.span`
  color: #3cf;
  font-weight: 500;
`;

const CallArea = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  height: 350px;
  margin-bottom: 1.5rem;
`;

const CharacterButton = styled.div`
  width: 50%;
  height: 100%;
  position: absolute;
  top: 0;
  cursor: pointer;
  transition: transform 0.5s;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &:hover {
    opacity: 0.9;
  }
`;

const MayaButton = styled(CharacterButton)`
  left: 0;
  background: #3f5145;
  transform: ${props => props.active ? 'scale(1.05)' : 'scale(1)'};
  z-index: ${props => props.active ? 2 : 1};
`;

const MilesButton = styled(CharacterButton)`
  right: 0;
  background: #42506b;
  transform: ${props => props.active ? 'scale(1.05)' : 'scale(1)'};
  z-index: ${props => props.active ? 2 : 1};
`;

const CharacterLabel = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 0.5rem;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  pointer-events: none;
`;

const MayaLabel = styled(CharacterLabel)`
  left: 25%;
  transform: translate(-50%, -50%);
`;

const MilesLabel = styled(CharacterLabel)`
  right: 25%;
  transform: translate(50%, -50%);
`;

const PhoneIcon = styled.svg`
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.8);
`;

const StatusMessage = styled.p`
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  margin-top: 0.5rem;
  height: 1.5rem;
  font-size: 0.9rem;
`;

const VisualizeCircle = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  z-index: 10;
  display: ${props => props.active ? 'block' : 'none'};
`;

function VoiceChatWidget({ user }) {
  const [selectedCharacter, setSelectedCharacter] = useState('Maya');
  const [characters, setCharacters] = useState(['Maya', 'Miles']);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('Press to start a conversation');
  const [isCallActive, setIsCallActive] = useState(false);
  const audioContext = useRef(null);
  const analyser = useRef(null);
  const microphone = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    // Fetch available characters
    async function fetchCharacters() {
      try {
        const response = await fetch('/api/characters');
        const data = await response.json();

        if (data.characters && data.characters.length > 0) {
          setCharacters(data.characters);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching characters:', error);
        setStatus('Error loading characters. Please try again later.');
        setIsLoading(false);
      }
    }

    fetchCharacters();
  }, []);

  useEffect(() => {
    if (user) {
      setStatus(`Welcome, ${user.displayName}! Press to start a conversation`);
    }
  }, [user]);

  const handleCharacterSelect = (character) => {
    if (!isCallActive) {
      setSelectedCharacter(character);
    }
  };

  const handleStartCall = async () => {
    if (isCallActive) {
      // End call
      stopMicrophone();
      setIsCallActive(false);
      setStatus(`${selectedCharacter} enjoyed your call, please feel free to call again`);
    } else {
      // Start call
      setStatus(`Starting conversation with ${selectedCharacter}...`);
      try {
        await startMicrophone();
        setIsCallActive(true);
        setStatus(`Connected to ${selectedCharacter}. Start talking...`);
      } catch (error) {
        console.error('Error starting microphone:', error);
        setStatus('Error starting microphone. Please check permissions and try again.');
      }
    }
  };

  const startMicrophone = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio context
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
      microphone.current = audioContext.current.createMediaStreamSource(stream);
      
      // Connect nodes
      microphone.current.connect(analyser.current);
      
      // Configure analyser
      analyser.current.fftSize = 256;
      
      // Start visualization
      visualize();
      
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  };

  const stopMicrophone = () => {
    if (microphone.current && microphone.current.mediaStream) {
      microphone.current.mediaStream.getTracks().forEach(track => track.stop());
    }
    
    if (audioContext.current) {
      audioContext.current.close();
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const visualize = () => {
    if (!analyser.current) return;
    
    const bufferLength = analyser.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!analyser.current) return;
      
      analyser.current.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      
      // Use average for visualization if needed
      console.log("Volume level:", average);
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
  };

  return (
    <WidgetContainer>
      <WidgetHeader>
        <Title>Voice Chat</Title>
      </WidgetHeader>

      {user && (
        <UserInfoBar>
          <UserAvatar src={user.photoURL} alt={user.displayName} />
          <UserName>{user.displayName}</UserName>
          <span>•</span>
          <span>{user.email}</span>
        </UserInfoBar>
      )}

      <CallArea onClick={handleStartCall}>
        <MayaButton 
          active={selectedCharacter === 'Maya'} 
          onClick={(e) => {
            e.stopPropagation();
            handleCharacterSelect('Maya');
          }}
        >
          <MayaLabel>
            <PhoneIcon viewBox="0 0 19 19">
              <path fill="currentColor" d="M5.408 13.373C2.586 10.561.448 7.163.448 4.359c0-1.24.42-2.363 1.366-3.271C2.391.53 3.054.238 3.7.238c.528 0 1.016.205 1.348.674l2.1 2.96c.332.458.488.839.488 1.19 0 .45-.264.84-.694 1.29l-.693.712a.5.5 0 0 0-.146.362c0 .146.058.283.107.39.312.606 1.201 1.641 2.158 2.598.967.957 2.002 1.846 2.608 2.168a.9.9 0 0 0 .39.107.53.53 0 0 0 .371-.156l.694-.683c.449-.44.85-.694 1.289-.694.351 0 .742.156 1.191.469l2.998 2.129c.46.332.645.8.645 1.289 0 .664-.322 1.338-.84 1.914-.889.977-1.992 1.416-3.252 1.416-2.803 0-6.23-2.178-9.053-5" />
            </PhoneIcon>
            <p>Maya</p>
          </MayaLabel>
        </MayaButton>
        
        <MilesButton 
          active={selectedCharacter === 'Miles'} 
          onClick={(e) => {
            e.stopPropagation();
            handleCharacterSelect('Miles');
          }}
        >
          <MilesLabel>
            <PhoneIcon viewBox="0 0 19 19">
              <path fill="currentColor" d="M5.408 13.373C2.586 10.561.448 7.163.448 4.359c0-1.24.42-2.363 1.366-3.271C2.391.53 3.054.238 3.7.238c.528 0 1.016.205 1.348.674l2.1 2.96c.332.458.488.839.488 1.19 0 .45-.264.84-.694 1.29l-.693.712a.5.5 0 0 0-.146.362c0 .146.058.283.107.39.312.606 1.201 1.641 2.158 2.598.967.957 2.002 1.846 2.608 2.168a.9.9 0 0 0 .39.107.53.53 0 0 0 .371-.156l.694-.683c.449-.44.85-.694 1.289-.694.351 0 .742.156 1.191.469l2.998 2.129c.46.332.645.8.645 1.289 0 .664-.322 1.338-.84 1.914-.889.977-1.992 1.416-3.252 1.416-2.803 0-6.23-2.178-9.053-5" />
            </PhoneIcon>
            <p>Miles</p>
          </MilesLabel>
        </MilesButton>
        
        <VisualizeCircle active={isCallActive} />
      </CallArea>

      <StatusMessage>{status}</StatusMessage>
    </WidgetContainer>
  );
}

export default VoiceChatWidget;
