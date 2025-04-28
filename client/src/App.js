import React from 'react';
import styled from 'styled-components';
import CharacterSelectorComponent from './components/CharacterSelector';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  padding: 20px;
`;

function App() {
  return (
    <AppContainer>
      <CharacterSelectorComponent />
    </AppContainer>
  );
}

export default App;
