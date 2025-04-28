
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
  background: var(--green1);
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius2);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: var(--green2);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const UserInfo = styled.div`
  background: var(--green7);
  border: 1px solid var(--green4);
  padding: 1rem;
  border-radius: var(--radius2);
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--green3);
`;

const UserName = styled.span`
  font-weight: 600;
  color: var(--green1);
`;

const Login = () => {
  const { currentUser } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <LoginContainer>
      {currentUser ? (
        <>
          <UserInfo>
            {currentUser.photoURL && <Avatar src={currentUser.photoURL} alt={currentUser.displayName} />}
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
};

export default Login;
