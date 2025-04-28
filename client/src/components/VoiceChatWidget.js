import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const WidgetContainer = styled.div`
  width: 100%;
  max-width: 600px;
  border-radius: var(--radius1);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin: 0 auto;
  border: 1px solid var(--green4);
`;

const CharacterSelector = styled.div`
  display: flex;
  width: 100%;
  border-bottom: 1px solid var(--green4);
`;

const CharacterButton = styled.button`
  width: 50%;
  padding: 1rem;
  background-color: ${props => props.active ? 'var(--green6)' : 'white'};
  border: none;
  color: var(--green1);
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.active ? 'var(--green6)' : 'var(--green7)'};
  }
`;

const ControlPanel = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--s24);
  background-color: white;
`;

const ControlButton = styled.button`
  padding: 1rem;
  border-radius: var(--radius2);
  background-color: ${props => props.active ? 'var(--green1)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--green1)'};
  border: 1px solid var(--green1);
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.active ? 'var(--green2)' : 'var(--green7)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusDisplay = styled.div`
  background-color: var(--green7);
  border-radius: var(--radius2);
  padding: var(--s16);
  margin-top: var(--s16);
  display: flex;
  flex-direction: column;
`;

const StatusText = styled.p`
  margin: 0;
  color: var(--green2);
  font-size: 14px;
  line-height: 1.5;
`;

const VisualIndicator = styled.div`
  height: 60px;
  width: 100%;
  border-radius: var(--radius2);
  margin: var(--s16) 0;
  background-color: var(--green6);
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    height: 100%;
    width: ${props => props.active ? '30%' : '0%'};
    background-color: var(--green3);
    left: 50%;
    transform: translateX(-50%);
    transition: width 0.3s ease;
  }
`;

const DeviceSelector = styled.select`
  padding: 0.5rem;
  border-radius: var(--radius2);
  border: 1px solid var(--green4);
  margin-bottom: 0.5rem;
  background-color: white;
  color: var(--green1);
`;

const DeviceLabel = styled.label`
  display: block;
  margin-bottom: 0.25rem;
  color: var(--green2);
  font-size: 14px;
`;

const VoiceChatWidget = () => {
  const { currentUser } = useAuth();
  const [character, setCharacter] = useState('Maya');
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Ready to chat');
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedInput, setSelectedInput] = useState('');
  const [selectedOutput, setSelectedOutput] = useState('');

  useEffect(() => {
    // Simulate getting audio devices
    const fetchDevices = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioInputs = devices.filter(device => device.kind === 'audioinput');
          const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
          setAudioDevices({ inputs: audioInputs, outputs: audioOutputs });

          if (audioInputs.length > 0) {
            setSelectedInput(audioInputs[0].deviceId);
          }

          if (audioOutputs.length > 0) {
            setSelectedOutput(audioOutputs[0].deviceId);
          }
        } catch (err) {
          console.error("Error enumerating devices:", err);
          setStatus("Error accessing audio devices. Please check permissions.");
        }
      } else {
        setStatus("Your browser doesn't support audio device selection.");
      }
    };

    if (currentUser) {
      fetchDevices();
    }
  }, [currentUser]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      setStatus("Chat ended");
    } else {
      setIsListening(true);
      setStatus(`Chatting with ${character}...`);
    }
  };

  const handleCharacterChange = (newCharacter) => {
    setCharacter(newCharacter);
    if (isListening) {
      setStatus(`Chatting with ${newCharacter}...`);
    }
  };

  return (
    <WidgetContainer>
      <CharacterSelector>
        <CharacterButton 
          active={character === 'Maya'} 
          onClick={() => handleCharacterChange('Maya')}
        >
          Maya
        </CharacterButton>
        <CharacterButton 
          active={character === 'Miles'} 
          onClick={() => handleCharacterChange('Miles')}
        >
          Miles
        </CharacterButton>
      </CharacterSelector>

      <ControlPanel>
        <DeviceLabel>Input Device:</DeviceLabel>
        <DeviceSelector 
          value={selectedInput}
          onChange={(e) => setSelectedInput(e.target.value)}
          disabled={isListening}
        >
          {audioDevices.inputs && audioDevices.inputs.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Microphone ${device.deviceId.substring(0, 5)}...`}
            </option>
          ))}
        </DeviceSelector>

        <DeviceLabel>Output Device:</DeviceLabel>
        <DeviceSelector 
          value={selectedOutput}
          onChange={(e) => setSelectedOutput(e.target.value)}
          disabled={isListening}
        >
          {audioDevices.outputs && audioDevices.outputs.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Speaker ${device.deviceId.substring(0, 5)}...`}
            </option>
          ))}
        </DeviceSelector>

        <ControlButton 
          active={isListening}
          onClick={toggleListening}
        >
          {isListening ? "End Chat" : "Start Chat"}
        </ControlButton>

        <VisualIndicator active={isListening} />

        <StatusDisplay>
          <StatusText>{status}</StatusText>
          <StatusText>
            {isListening 
              ? "Speak naturally. The AI is listening..." 
              : "Press 'Start Chat' to begin a conversation"}
          </StatusText>
        </StatusDisplay>
      </ControlPanel>
    </WidgetContainer>
  );
};

export default VoiceChatWidget;
