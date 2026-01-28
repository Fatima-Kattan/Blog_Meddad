'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import { useEffect, useState } from 'react';

const ConditionalNavbar = () => {
  const pathname = usePathname();
  
  // صفحات لا نريد فيها النافبار
  const hiddenPaths = [
    '/login', 
    '/register',
    '/search' // ⭐ أضف صفحة البحث هنا
  ];
  
  // تحقق إذا كان المسار يحتوي على /profile/
  const isProfilePage = pathname?.startsWith('/profile/');
  
  // حالة تتبع إذا كانت صفحة البروفايل مفتوحة من الأعلى
  const [hideNavForProfile, setHideNavForProfile] = useState(false);
  
  useEffect(() => {
    if (isProfilePage && typeof window !== 'undefined') {
      // تحقق من localStorage
      const openedFromTop = localStorage.getItem('profileOpenedFromTop') === 'true';
      setHideNavForProfile(openedFromTop);
      
      // نظف localStorage بعد القراءة
      if (openedFromTop) {
        localStorage.removeItem('profileOpenedFromTop');
      }
    } else {
      setHideNavForProfile(false);
    }
  }, [pathname, isProfilePage]);
  
  // قرار إخفاء النافبار
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