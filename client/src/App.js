
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CharacterSelectorComponent from './components/CharacterSelector';
import { getAuth } from 'firebase/auth';
import VoiceChatWidget from './components/VoiceChatWidget';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  padding: 20px;
`;

function App() {
  const [user, setUser] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState('Maya');
  
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);
  
  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
  };
  
  return (
    <AppContainer>
      {!user ? (
        <CharacterSelectorComponent onCharacterSelect={handleCharacterSelect} />
      ) : (
        <VoiceChatWidget character={selectedCharacter} />
      )}
    </AppContainer>
  );
}

export default App;
