
import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const HeaderContainer = styled.header`
  background-color: white;
  padding: var(--s20) var(--s28);
  border-bottom: 1px solid var(--green5);
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.div`
  font-weight: 800;
  font-size: 1.5rem;
  color: var(--green1);
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 10px;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
`;

const UserName = styled.span`
  margin-right: 1rem;
  font-weight: 500;
  color: var(--green2);
`;

const Header = () => {
  const { currentUser } = useAuth();
  
  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 21 24" width="21" height="24">
            <path fill="currentColor" d="M20.556 11.936V23.87c-2.16 0-4.184-.582-5.93-1.598a11.94 11.94 0 0 1-5.93-10.337V0c2.16 0 4.184.582 5.93 1.598a11.94 11.94 0 0 1 5.93 10.338M2.926.798A5.7 5.7 0 0 0 0 0v5.968a5.99 5.99 0 0 0 2.925 5.169c.86.509 1.86.798 2.925.798V5.969A5.99 5.99 0 0 0 2.925.798"></path>
          </svg>
          Sesame
        </Logo>
        <UserSection>
          {currentUser && (
            <UserName>{currentUser.displayName}</UserName>
          )}
        </UserSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
