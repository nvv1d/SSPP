
import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: var(--green7);
  padding: var(--s24) var(--s28);
  border-top: 1px solid var(--green5);
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
`;

const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--s24);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--s16);
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

const FooterTitle = styled.h3`
  color: var(--green1);
  font-size: 1rem;
  margin-bottom: var(--s16);
  font-weight: 600;
`;

const FooterLink = styled.a`
  color: var(--green2);
  text-decoration: none;
  margin-bottom: var(--s8);
  font-size: 0.9rem;
  
  &:hover {
    color: var(--green1);
  }
`;

const BottomSection = styled.div`
  display: flex;
  justify-content: space-between;
  border-top: 1px solid var(--green5);
  padding-top: var(--s16);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--s16);
  }
`;

const Copyright = styled.p`
  color: var(--green3);
  font-size: 0.8rem;
  margin: 0;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: var(--s16);
`;

const SocialIcon = styled.a`
  color: var(--green2);
  
  &:hover {
    color: var(--green1);
  }
`;

const currentYear = new Date().getFullYear();

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <TopSection>
          <Column>
            <FooterTitle>About</FooterTitle>
            <FooterLink href="#">Our Technology</FooterLink>
            <FooterLink href="#">Research</FooterLink>
            <FooterLink href="#">Team</FooterLink>
          </Column>
          
          <Column>
            <FooterTitle>Resources</FooterTitle>
            <FooterLink href="#">Documentation</FooterLink>
            <FooterLink href="#">API</FooterLink>
            <FooterLink href="#">Blog</FooterLink>
          </Column>
          
          <Column>
            <FooterTitle>Connect</FooterTitle>
            <FooterLink href="#">Contact</FooterLink>
            <FooterLink href="#">Careers</FooterLink>
            <FooterLink href="#">Support</FooterLink>
          </Column>
        </TopSection>
        
        <BottomSection>
          <Copyright>© {currentYear} Sesame AI. All rights reserved.</Copyright>
          <SocialLinks>
            <SocialIcon href="#">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            </SocialIcon>
            <SocialIcon href="#">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </SocialIcon>
          </SocialLinks>
        </BottomSection>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
