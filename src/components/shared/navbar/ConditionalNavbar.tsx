// src/components/shared/navbar/ConditionalNavbar.tsx
'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import { useEffect } from 'react';

const ConditionalNavbar = () => {
  const pathname = usePathname();
  
  // صفحات لا نريد فيها النافبار
  const hiddenPaths = ['/login', '/register'];
  const hasNavbar = !hiddenPaths.includes(pathname || '');
  
  // أضف/شيل كلاس من الـ body حسب وجود النافبار
  useEffect(() => {
    if (hasNavbar) {
      document.body.classList.add('with-navbar');
      document.body.classList.remove('without-navbar');
    } else {
      document.body.classList.add('without-navbar');
      document.body.classList.remove('with-navbar');
    }
    
    // تنظيف عند unmount
    return () => {
      document.body.classList.remove('with-navbar', 'without-navbar');
    };
  }, [hasNavbar]);
  
  // إذا كان المسار ضمن hiddenPaths، لا نعرض النافبار
  if (!hasNavbar) {
    return null;
  }
  
  return <Navbar />;
};

export default ConditionalNavbar;