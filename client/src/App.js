import React from 'react';
import styled from 'styled-components';
import Header from './components/Header';
import Footer from './components/Footer';
import VoiceChatWidget from './components/VoiceChatWidget';
import Login from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: white;
  color: var(--green1);
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const HeroSection = styled.section`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: var(--green1);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
  color: var(--green2);

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const AuthMessage = styled.div`
  text-align: center;
  padding: 2rem;
  background: var(--green7);
  border: 1px solid var(--green4);
  border-radius: var(--radius2);
  margin: 2rem 0;
  max-width: 500px;
  width: 100%;
`;

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <AppContainer>
      <Header />
      <MainContent>
        <HeroSection>
          <Title>Sesame Voice AI</Title>
          <Subtitle>
            Experience natural voice conversations with our AI characters.
            Get information, have discussions, or just chat with Maya or Miles.
          </Subtitle>
        </HeroSection>

        {currentUser ? (
          <VoiceChatWidget />
        ) : (
          <AuthMessage>
            <h2>Welcome to Sesame Voice AI</h2>
            <p>Sign in to start a voice conversation with our AI companions.</p>
            <Login />
          </AuthMessage>
        )}
      </MainContent>
      <Footer />
    </AppContainer>
  );
}

export default App;
