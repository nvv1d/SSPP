
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
  background: linear-gradient(135deg, #1d1d42 0%, #121212 100%);
  color: white;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const HeroSection = styled.section`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  background: linear-gradient(to right, #3cf, #f06);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
  color: #bbb;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const AuthMessage = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  max-width: 800px;
  width: 100%;
`;

const AboutSection = styled.section`
  max-width: 800px;
  margin: 3rem auto;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #3cf;
  }
  
  p {
    line-height: 1.6;
    margin-bottom: 1rem;
  }
`;

const AuthMessage = styled.div`
  text-align: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 16px;
  margin: 2rem 0;
  max-width: 500px;
`;

function AppContent() {
  const { currentUser } = useAuth();
  
  return (
    <AppContainer>
      <Header />
      
      <MainContent>
        <HeroSection>
          <Title>Experience Conversational AI</Title>
          <Subtitle>
            Talk naturally with AI characters using your voice. Featuring authentic 
            conversations with emotional intelligence.
          </Subtitle>
        </HeroSection>
        
        <Login />
        
        {currentUser ? (
          <VoiceChatWidget user={currentUser} />
        ) : (
          <AuthMessage>
            <p>Please sign in with your Google account to use the Voice Chat feature.</p>
          </AuthMessage>
        )}
        
        <AboutSection id="about">
          <h2>About This Project</h2>
          <p>
            This is a demonstration of the Sesame Voice AI interface, which provides 
            natural voice conversations with AI characters. The technology enables 
            voice conversations with AI characters that feature emotional intelligence, 
            natural conversational dynamics, and contextual awareness.
          </p>
          <p>
            This web interface is built using React and Flask, connecting to the 
            Sesame AI API through a Python backend. For best results and full 
            functionality, run this application locally with proper microphone access.
          </p>
        </AboutSection>
      </MainContent>
      
      <Footer />
    </AppContainer>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
