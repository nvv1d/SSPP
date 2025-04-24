
import React from 'react';
import styled from 'styled-components';
import { signInWithGoogle, signOutUser } from '../firebase';
import { useAuth } from '../context/AuthContext';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2rem 0;
`;

const AuthButton = styled.button`
  background: linear-gradient(45deg, #3cf, #f06);
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const UserInfo = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #3cf;
`;

const UserName = styled.span`
  font-weight: 600;
  color: white;
`;

function Login() {
  const { currentUser } = useAuth();
  
  const handleSignIn = async () => {
    await signInWithGoogle();
  };
  
  const handleSignOut = async () => {
    await signOutUser();
  };
  
  return (
    <LoginContainer>
      {currentUser ? (
        <>
          <UserInfo>
            <Avatar src={currentUser.photoURL} alt={currentUser.displayName} />
            <UserName>{currentUser.displayName}</UserName>
          </UserInfo>
          <AuthButton onClick={handleSignOut} style={{ marginTop: '1rem' }}>
            Sign Out
          </AuthButton>
        </>
      ) : (
        <AuthButton onClick={handleSignIn}>
          Sign in with Google
        </AuthButton>
      )}
    </LoginContainer>
  );
}

export default Login;
