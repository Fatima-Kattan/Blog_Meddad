import Image from "next/image";
import styles from "./page.module.css";
import GradientButton from "../components/shared/btn/GradientButton";
import RegisterForm from '../components/auth/register/RegisterForm';
import { Metadata } from 'next';
import Link from "next/link";
import LogoutButton from "@/components/auth/logout/LogoutButton";
import LeftSidebar from "@/components/sidebar/LeftSidebar";
import RightSidebar from "@/components/sidebar/RightSidebar";
import CreatePost from "@/components/posts/create post/CreatePost";
import PostFeed from "@/components/posts/post-feed/PostFeed";

/* export const metadata: Metadata = {
  title: 'تسجيل حساب جديد',
  description: 'أنشئ حسابك الجديد في منصتنا',
}; */
export default function Home() {
  return (
    <>
      {/* <Header /> */}
      
      <main className={styles.mainContent}>
        {/* الشريط الجانبي الأيسر */}
        <aside className={styles.leftSidebar}>
          <LeftSidebar />
        </aside>
        
        {/* المحتوى الرئيسي */}
        <section className={styles.contentSection}>
          <CreatePost />
          <PostFeed />
        </section>
        
        {/* الشريط الجانبي الأيمن */}
        <aside className={styles.rightSidebar}>
          <RightSidebar />
        </aside>
      </main>
    </>
  );
}
