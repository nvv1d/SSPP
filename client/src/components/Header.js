
import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  width: 100%;
  padding: 1rem 2rem;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  background: linear-gradient(45deg, #f06, #3cf);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
`;

const NavLink = styled.a`
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  
  &:hover {
    color: #3cf;
  }
`;

function Header() {
  return (
    <HeaderContainer>
      <Logo>Sesame Voice AI</Logo>
      <Nav>
        <NavLink href="#">Home</NavLink>
        <NavLink href="https://github.com/ijub/sesame_ai" target="_blank">GitHub</NavLink>
        <NavLink href="#about">About</NavLink>
      </Nav>
    </HeaderContainer>
  );
}

export default Header;
