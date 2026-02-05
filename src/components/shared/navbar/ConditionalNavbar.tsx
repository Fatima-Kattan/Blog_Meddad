'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import { useEffect, useState } from 'react';

const ConditionalNavbar = () => {
  const pathname = usePathname();
  
  const hiddenPaths = [
    '/login', 
    '/register',
    '/search'
  ];
  
  const isProfilePage = pathname?.startsWith('/profile/');
  
  const [hideNavForProfile, setHideNavForProfile] = useState(false);
  
  useEffect(() => {
    if (isProfilePage && typeof window !== 'undefined') {
      const openedFromTop = localStorage.getItem('profileOpenedFromTop') === 'true';
      setHideNavForProfile(openedFromTop);
      
      if (openedFromTop) {
        localStorage.removeItem('profileOpenedFromTop');
      }
    } else {
      setHideNavForProfile(false);
    }
  }, [pathname, isProfilePage]);
  
  const shouldHideNavbar = 
    hiddenPaths.includes(pathname || '') || 
    (isProfilePage && hideNavForProfile);
  
  useEffect(() => {
    if (shouldHideNavbar) {
      document.body.classList.add('without-navbar');
      document.body.classList.remove('with-navbar');
    } else {
      document.body.classList.add('with-navbar');
      document.body.classList.remove('without-navbar');
    }
    
    return () => {
      document.body.classList.remove('with-navbar', 'without-navbar');
    };
  }, [shouldHideNavbar]);
  
  if (shouldHideNavbar) {
    return null;
  }
  
  return <Navbar />;
};

export default ConditionalNavbar;