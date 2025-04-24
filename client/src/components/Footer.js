
import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  width: 100%;
  padding: 2rem;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const FooterText = styled.p`
  color: #aaa;
  margin-bottom: 1rem;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
`;

const FooterLink = styled.a`
  color: #3cf;
  text-decoration: none;
  transition: color 0.3s ease;
  
  &:hover {
    color: #f06;
  }
`;

function Footer() {
  return (
    <FooterContainer>
      <FooterText>
        This is an unofficial API wrapper and is not affiliated with, maintained, authorized, 
        endorsed, or sponsored by Sesame or any of its affiliates.
      </FooterText>
      <FooterText>
        &copy; {new Date().getFullYear()} Voice Chat AI Demo
      </FooterText>
      <FooterLinks>
        <FooterLink href="https://github.com/ijub/sesame_ai" target="_blank">GitHub</FooterLink>
        <FooterLink href="https://buymeacoffee.com/ijub" target="_blank">Support</FooterLink>
      </FooterLinks>
    </FooterContainer>
  );
}

export default Footer;
