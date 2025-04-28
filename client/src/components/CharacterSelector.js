
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const Container = styled.div`
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
  position: relative;
  overflow: hidden;

  &:hover {
    background-color: ${props => props.active ? 'var(--green6)' : 'var(--green7)'};
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: ${props => props.active ? '100%' : '0'};
    height: 3px;
    background-color: var(--green1);
    transition: width 0.3s ease;
  }
`;

const SignInSection = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
`;

const GoogleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: var(--radius2);
  font-weight: 500;
  color: #444;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  
  &:hover {
    background-color: #f8f8f8;
    box-shadow: 0 2px 5px rgba(0,0,0,0.15);
  }
  
  img {
    margin-right: 10px;
    width: 18px;
    height: 18px;
  }
`;

const AnimatedAvatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: var(--green6);
  margin: 20px 0;
  background-image: ${props => `url('/characters/${props.character.toLowerCase()}.png')`};
  background-size: cover;
  background-position: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  
  ${props => props.active && `
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  `}
`;

const CharacterSelectorComponent = () => {
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
      
      <SignInSection>
        <AnimatedAvatar character={character} active={true} />
        
        {!user ? (
          <GoogleButton onClick={handleGoogleSignIn}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" />
            Sign in with Google
          </GoogleButton>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p>Signed in as {user.displayName}</p>
            <p>Ready to chat with {character}</p>
          </div>
        )}
      </SignInSection>
    </Container>
  );
};

export default CharacterSelectorComponent;
