import Image from "next/image";
import styles from "./page.module.css";
import GradientButton from "../components/shared/btn/GradientButton";
import RegisterForm from '../components/auth/register/RegisterForm';
import { Metadata } from 'next';
import Link from "next/link";
import LogoutButton from "@/components/auth/logout/LogoutButton";

/* export const metadata: Metadata = {
  title: 'تسجيل حساب جديد',
  description: 'أنشئ حسابك الجديد في منصتنا',
}; */
export default function Home() {
  return (
    <>
      <main style={{ padding: "2rem" }}>
        <h1>Welcome to My App 🚀</h1>
        <p>Choose the page you want to go to:</p>
        <nav style={{ display: "flex", gap: "1rem" }}>
          <LogoutButton/>
          <Link href="/register">Register</Link>
          <Link href="/login">Login</Link>
          <Link href="/following">following</Link>
        </nav>
      </main>
    </>
  );
}
