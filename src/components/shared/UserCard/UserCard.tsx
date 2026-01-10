// components/UserCard.tsx
import Image from "next/image";
import styles from "./UserCard.module.css";
import { MdOutlineCancel } from "react-icons/md";
// تعريف نوع المستخدم
interface User {
  id: number | string;
  name: string;
  image: string;
  bio?: string; // إضافة حقل bio اختياري
}

// تعريف props المكون
interface UserCardProps {
  user: User;
  onClick?: () => void; // إضافة onClick اختياري
}

export default function UserCard({ user, onClick }: UserCardProps) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.avatarWrapper}>
        <Image
          src={user.image}
          alt={user.name}
          width={64}
          height={64}
          className={styles.avatar}
          priority={false}
        />
      </div>
      
      <div className={styles.userInfo}>
        <h3 className={styles.name}>{user.name}</h3>
        {user.bio && (
          <p className={styles.bio}>{user.bio}</p>
        )}
      </div>
      <div>
      <MdOutlineCancel  size={24} />
      </div>
    </div>
  );
}