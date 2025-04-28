
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Styled components
const Container = styled.div`
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background-color: white;
  animation: ${fadeIn} 0.5s ease;
`;

const CharacterSelector = styled.div`
  display: flex;
  width: 100%;
  border-bottom: 1px solid #e0e0e0;
`;

const CharacterButton = styled.button`
  width: 50%;
  padding: 1.2rem 0;
  background-color: ${props => props.active ? '#f5f9ff' : 'white'};
  border: none;
  color: ${props => props.active ? '#1a73e8' : '#5f6368'};
  font-weight: ${props => props.active ? '600' : '400'};
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background-color: ${props => props.active ? '#f5f9ff' : '#f8f9fa'};
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: ${props => props.active ? '100%' : '0'};
    height: 3px;
    background-color: #1a73e8;
    transition: width 0.3s ease;
  }
`;

const ContentSection = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const AnimatedAvatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 1rem 0 1.5rem;
  background-image: ${props => `url('/characters/${props.character.toLowerCase()}.png')`};
  background-size: cover;
  background-position: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: ${pulse} 2s infinite ease-in-out;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const CharacterTitle = styled.h2`
  margin: 0 0 0.5rem;
  color: #202124;
  font-size: 24px;
`;

const CharacterSubtitle = styled.p`
  margin: 0 0 2rem;
  color: #5f6368;
  font-size: 16px;
`;

const GoogleSignInButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background-color: white;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-family: 'Google Sans', Roboto, Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #3c4043;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s;
  
  &:hover {
    background-color: #f8f9fa;
    box-shadow: 0 1px 2px rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
  }
  
  img {
    margin-right: 12px;
    width: 18px;
    height: 18px;
  }
`;

const UserInfo = styled.div`
  margin-top: 1rem;
  font-size: 16px;
  color: #3c4043;
  
  p {
    margin: 8px 0;
  }
`;

const CharacterDescription = {
  Maya: "Chat with Maya, your friendly and knowledgeable assistant.",
  Miles: "Talk to Miles, your calm and helpful assistant."
};

const CharacterSelectorComponent = ({ onCharacterSelect }) => {
  const [character, setCharacter] = useState('Maya');
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Check if user is already signed in
    const auth = getAuth();
    setUser(auth.currentUser);
    
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    
    return () => unsubscribe();
  }, []);
  
  const handleCharacterChange = (newCharacter) => {
    setCharacter(newCharacter);
    if (onCharacterSelect) {
      onCharacterSelect(newCharacter);
    }
  };
  
  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };
  
  return (
    <Container>
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
      
      <ContentSection>
        <AnimatedAvatar character={character} />
        <CharacterTitle>{character}</CharacterTitle>
        <CharacterSubtitle>{CharacterDescription[character]}</CharacterSubtitle>
        
        {!user ? (
          <GoogleSignInButton onClick={handleGoogleSignIn}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" />
            Sign in with Google
          </GoogleSignInButton>
        ) : (
          <UserInfo>
            <p>Signed in as {user.displayName}</p>
            <p>Ready to chat with {character}</p>
          </UserInfo>
        )}
      </ContentSection>
    </Container>
  );
};

export default CharacterSelectorComponent;
