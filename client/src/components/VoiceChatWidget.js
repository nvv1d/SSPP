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

const PermissionAlert = styled.div`
  background-color: #fff3cd;
  color: #856404;
  padding: 1rem;
  border-radius: var(--radius2);
  margin-bottom: 1rem;
  border: 1px solid #ffeeba;
`;

const VoiceChatWidget = () => {
  const { currentUser } = useAuth();
  const [character, setCharacter] = useState('Maya');
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Ready to chat');
  const [audioDevices, setAudioDevices] = useState({ inputs: [], outputs: [] });
  const [selectedInput, setSelectedInput] = useState('');
  const [selectedOutput, setSelectedOutput] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  // Refs for audio handling
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const processorNodeRef = useRef(null);
  const audioBufferRef = useRef([]);
  const audioElementRef = useRef(null);
  const websocketRef = useRef(null);
  
  // Visual indicator refs
  const visualValueRef = useRef(0);
  const animationFrameRef = useRef(null);
  const visualIndicatorRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;
    
    // Create audio element for playback
    const audioEl = new Audio();
    audioEl.autoplay = true;
    audioElementRef.current = audioEl;
    
    // Get available audio devices
    const fetchDevices = async () => {
      try {
        // Request permission to access audio
        await navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            // Release the stream immediately after getting permission
            stream.getTracks().forEach(track => track.stop());
            setPermissionDenied(false);
          })
          .catch(err => {
            console.error("Error getting user media:", err);
            setPermissionDenied(true);
            setStatus("Microphone access denied. Please check browser permissions.");
            return;
          });
        
        // List available devices
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
    };

    fetchDevices();
    
    return () => {
      // Clean up on unmount
      stopAudioProcessing();
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [currentUser]);

  const startAudioProcessing = async () => {
    try {
      // Get user media with selected device
      const constraints = { 
        audio: {
          deviceId: selectedInput ? { exact: selectedInput } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // Set up audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      // Create source node from microphone
      const sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNodeRef.current = sourceNode;
      
      // Create script processor node for audio processing
      const processorNode = audioContext.createScriptProcessor(2048, 1, 1);
      processorNodeRef.current = processorNode;
      
      // Process audio data
      processorNode.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calculate RMS for visualization
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        visualValueRef.current = rms * 2; // Scale up for better visualization
        
        // Send audio data to server if websocket is connected
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
          // Convert Float32Array to Int16Array for transmission
          const int16Data = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            // Convert float [-1.0, 1.0] to int16 [-32768, 32767]
            int16Data[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
          }
          
          // Send data as arraybuffer
          websocketRef.current.send(int16Data.buffer);
        }
      };
      
      // Connect nodes
      sourceNode.connect(processorNode);
      processorNode.connect(audioContext.destination);
      
      // Start animation for visualization
      updateVisualIndicator();
      
      setStatus(`Connected. Chatting with ${character}...`);
      
      // Establish WebSocket connection to backend
      connectWebSocket();
      
    } catch (err) {
      console.error("Error starting audio processing:", err);
      setStatus("Error: Could not access microphone. Please check permissions.");
      setIsListening(false);
    }
  };
  
  const stopAudioProcessing = () => {
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Disconnect audio nodes
    if (sourceNodeRef.current && processorNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect(processorNodeRef.current);
        processorNodeRef.current.disconnect();
      } catch (e) {
        console.log("Error disconnecting audio nodes:", e);
      }
    }
    
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.log("Error closing audio context:", e);
      }
    }
    
    // Close WebSocket connection
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    
    // Reset visuals
    visualValueRef.current = 0;
    cancelAnimationFrame(animationFrameRef.current);
    if (visualIndicatorRef.current) {
      visualIndicatorRef.current.style.width = '0%';
    }
  };
  
  const connectWebSocket = () => {
    // For security, API endpoints should be handled through your backend
    // This is a simplified example - in production, get the WebSocket URL from your server
    const ws = new WebSocket(`wss://${window.location.host}/api/voice-chat`);
    
    ws.binaryType = 'arraybuffer';
    
    ws.onopen = () => {
      console.log("WebSocket connected");
      // Send initial configuration
      ws.send(JSON.stringify({
        type: 'config',
        character: character,
        userId: currentUser.uid
      }));
    };
    
    ws.onmessage = (event) => {
      // Handle different message types
      if (typeof event.data === 'string') {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'status') {
            setStatus(message.content);
          }
        } catch (e) {
          console.error("Error parsing WebSocket message:", e);
        }
      } else if (event.data instanceof ArrayBuffer) {
        // Handle audio data from server
        const audioData = event.data;
        
        // Play the audio
        const blob = new Blob([audioData], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        if (audioElementRef.current) {
          audioElementRef.current.src = url;
          
          // Clean up old object URLs
          audioElementRef.current.onended = () => {
            URL.revokeObjectURL(url);
          };
        }
      }
    };
    
    ws.onclose = () => {
      console.log("WebSocket closed");
      if (isListening) {
        setStatus("Connection lost. Try again.");
      }
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setStatus("Error: Connection failed.");
    };
    
    websocketRef.current = ws;
  };
  
  const updateVisualIndicator = () => {
    if (visualIndicatorRef.current) {
      const value = visualValueRef.current;
      // Scale and clamp value to reasonable range for display
      const scaledValue = Math.min(100, Math.max(0, value * 100));
      visualIndicatorRef.current.style.width = `${scaledValue}%`;
    }
    
    animationFrameRef.current = requestAnimationFrame(updateVisualIndicator);
  };

  const toggleListening = () => {
    if (isListening) {
      // Stop listening
      stopAudioProcessing();
      setIsListening(false);
      setStatus("Chat ended");
    } else {
      // Start listening
      setIsListening(true);
      setStatus(`Connecting to ${character}...`);
      startAudioProcessing();
    }
  };

  const handleCharacterChange = (newCharacter) => {
    setCharacter(newCharacter);
    
    // If already chatting, reconnect with new character
    if (isListening) {
      stopAudioProcessing();
      setStatus(`Switching to ${newCharacter}...`);
      setTimeout(() => {
        startAudioProcessing();
      }, 500);
    }
  };

  // This function would require a full implementation of the backend
  // For demonstration, we're showing a simplified version
  const handleOutputDeviceChange = (deviceId) => {
    setSelectedOutput(deviceId);
    
    // Set audio output device if supported
    if (audioElementRef.current && audioElementRef.current.setSinkId) {
      audioElementRef.current.setSinkId(deviceId)
        .catch(e => console.error("Error setting audio output device:", e));
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
        {permissionDenied && (
          <PermissionAlert>
            Microphone access is required. Please allow microphone access in your browser settings and reload the page.
          </PermissionAlert>
        )}
      
        <DeviceLabel>Input Device:</DeviceLabel>
        <DeviceSelector 
          value={selectedInput}
          onChange={(e) => setSelectedInput(e.target.value)}
          disabled={isListening}
        >
          {audioDevices.inputs.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Microphone ${device.deviceId.substring(0, 5)}...`}
            </option>
          ))}
        </DeviceSelector>

        <DeviceLabel>Output Device:</DeviceLabel>
        <DeviceSelector 
          value={selectedOutput}
          onChange={(e) => handleOutputDeviceChange(e.target.value)}
          disabled={isListening}
        >
          {audioDevices.outputs.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Speaker ${device.deviceId.substring(0, 5)}...`}
            </option>
          ))}
        </DeviceSelector>

        <ControlButton 
          active={isListening}
          onClick={toggleListening}
          disabled={permissionDenied}
        >
          {isListening ? "End Chat" : "Start Chat"}
        </ControlButton>

        <VisualIndicator 
          active={isListening} 
          ref={visualIndicatorRef}
        />

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
