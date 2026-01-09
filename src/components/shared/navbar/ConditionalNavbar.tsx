// src/components/shared/navbar/ConditionalNavbar.tsx
'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

const ConditionalNavbar = () => {
  const pathname = usePathname();
  
  // صفحات لا نريد فيها النافبار
  const hiddenPaths = ['/login', '/register'];
  
  // إذا كان المسار ضمن hiddenPaths، لا نعرض النافبار
  if (hiddenPaths.includes(pathname)) {
    return null;
  }
  
  return <Navbar />;
};

export default ConditionalNavbar;