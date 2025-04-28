import React from 'react';
import { GoogleLogin } from 'react-google-login';
import styled from 'styled-components';


const CharacterSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  /* Add Sesame's color scheme and styles here */
  background-color: #f0f0f0; /* Example color */
`;

const CharacterButton = styled.button`
  background-color: #4CAF50; /* Example color */
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #3e8e41;
  }
`;


const CharacterSelector = () => {
  return (
    <CharacterSelectorContainer>
      <h1>Select Your Character</h1>
      <CharacterButton>Character 1</CharacterButton>
      <CharacterButton>Character 2</CharacterButton>
      <CharacterButton>Character 3</CharacterButton>
      <GoogleLogin
        clientId="YOUR_GOOGLE_CLIENT_ID" // Replace with your Google Client ID
        buttonText="Sign in with Google"
        onSuccess={responseGoogle}
        onFailure={responseGoogle}
        cookiePolicy={'single_host_origin'}
      />
    </CharacterSelectorContainer>
  );
};

const responseGoogle = (response) => {
  console.log(response);
}


function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <CharacterSelector />
    </div>
  );
}

export default App;
