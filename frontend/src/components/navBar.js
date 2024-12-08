import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';  // Import Link from react-router-dom

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen((prevState) => !prevState);
  };

  return (
    <NavbarContainer>
      <NavbarMenuToggle onClick={toggleMenu} $isOpen={isMenuOpen}>
        <MenuIcon>
          <MenuBar $top $isOpen={isMenuOpen} />
          <MenuBar $middle $isOpen={isMenuOpen} />
          <MenuBar $bottom $isOpen={isMenuOpen} />
        </MenuIcon>
      </NavbarMenuToggle>

      {isMenuOpen && (
        <NavbarMenu>
          <NavbarBrand>
            <NavbarLogo>🍔</NavbarLogo>
            <NavbarTitle>Nuces</NavbarTitle>
          </NavbarBrand>
          <NavbarLinks>
            {/* Replace <a> tags with <Link> for React Router */}
            {[ 'reservation','feedback', 'performance', 'notification', , 'chatbot','payment-management', 'menu'].map((link, index) => (
              <NavbarLink 
                key={link} 
                to={`/${link.toLowerCase()}`}  // Use React Router's "to" prop for navigation
                $delay={index * 0.1}
              >
                <LinkText>{link}</LinkText>
                <LinkUnderline />
              </NavbarLink>
            ))}
          </NavbarLinks>
          <NavbarFooter>
            <FooterText>© 2024 Performance App</FooterText>
          </NavbarFooter>
        </NavbarMenu>
      )}
    </NavbarContainer>
  );
};

const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: flex-end;
  padding: 16px 32px;
  background-color: transparent;
`;

const NavbarMenuToggle = styled.button`
  background: ${props => props.$isOpen ? '#ff4757' : '#1f2631'};
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
  position: fixed;
  top: 16px;
  right: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.1);
  }
`;

const menuSlideAnimation = keyframes`
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const NavbarMenu = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 250px;
  height: 100vh;
  background-color: #1f2631;
  color: #e2e8f0;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  animation: ${menuSlideAnimation} 0.4s ease-out;
  box-shadow: -4px 0 6px rgba(0, 0, 0, 0.1);
  z-index: 50;
`;

const NavbarBrand = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
`;

const NavbarLogo = styled.span`
  font-size: 48px;
  margin-bottom: 12px;
`;

const NavbarTitle = styled.h1`
  font-size: 22px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #ff4757;
`;

const NavbarLinks = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  flex-grow: 1;
`;

const LinkUnderline = styled.span`
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #ff4757;
  transition: width 0.3s ease;
`;

const NavbarLink = styled(Link)`  /* Use Link for navigation */
  color: #e2e8f0;
  text-decoration: none;
  font-size: 18px;
  font-weight: 500;
  position: relative;
  overflow: hidden;
  transition: color 0.3s ease;
  
  &:hover {
    color: #ff4757;
  }

  &:hover ${LinkUnderline} {
    width: 100%;
  }
`;

const LinkText = styled.span`
  display: inline-block;
  transition: transform 0.3s ease;

  ${NavbarLink}:hover & {
    transform: translateX(5px);
  }
`;

const NavbarFooter = styled.div`
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid rgba(226, 232, 240, 0.1);
`;

const FooterText = styled.p`
  font-size: 12px;
  color: rgba(226, 232, 240, 0.6);
`;

const MenuIcon = styled.div`
  width: 24px;
  height: 16px;
  position: relative;
`;

const MenuBar = styled.span`
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #e2e8f0;
  transition: all 0.3s ease;

  ${props => props.$top && `
    top: 0;
    transform: ${props.$isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'};
  `}

  ${props => props.$middle && `
    top: 50%;
    transform: translateY(-50%);
    opacity: ${props.$isOpen ? 0 : 1};
  `}

  ${props => props.$bottom && `
    bottom: 0;
    transform: ${props.$isOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none'};
  `}
`;

export default Navbar;
