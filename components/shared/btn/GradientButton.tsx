import React from 'react';
import Link from 'next/link';
import styles from './GradientButton.module.css';

interface GradientButtonProps {
    // النص الذي يظهر على الزر
    text: string;

    // الرابط الذي ينتقل إليه الزر
    href: string;

    // (اختياري) نوع الزر - رابط أو زر عادي
    type?: 'link' | 'button';

    // (اختياري) أيقونة قبل النص
    icon?: React.ReactNode;

    // (اختياري) أيقونة بعد النص
    iconAfter?: React.ReactNode;

    // (اختياري) حجم الزر
    size?: 'small' | 'medium' | 'large';

    // (اختياري) خط متحرك عند التمرير
    animated?: boolean;

    // (اختياري) تأثير توهج
    glow?: boolean;

    // (اختياري) فتح الرابط في تبويب جديد
    target?: '_blank' | '_self';

    // (اختياري) فئة CSS إضافية
    className?: string;

    // (اختياري) حدث الضغط (إذا كان type="button")
    onClick?: () => void;

    // (اختياري) CSS مخصص
    style?: React.CSSProperties;
}

const GradientButton: React.FC<GradientButtonProps> = ({
    text,
    href,
    type = 'link',
    icon,
    iconAfter,
    size = 'medium',
    animated = false,
    glow = false,
    target = '_self',
    className = '',
    onClick,
    style,
}) => {
    // تجميع فئات CSS
    const buttonClasses = [
        styles.gradientButton,
        styles[size], // حجم الزر
        animated ? styles.animated : '',
        glow ? styles.glow : '',
        className
    ].filter(Boolean).join(' ');

    // المحتوى الداخلي للزر
    const buttonContent = (
        <>
            {icon && <span className={styles.icon}>{icon}</span>}
            <span>{text}</span>
            {iconAfter && <span className={styles.iconAfter}>{iconAfter}</span>}
        </>
    );

    // إذا كان زر عادي
    if (type === 'button') {
        return (
            <div className={styles.buttonContainer}>
                <button
                    onClick={onClick}
                    className={buttonClasses}
                    style={style}
                >
                    {buttonContent}
                </button>
            </div>
        );
    }

    // إذا كان رابط
    return (
        <div className={styles.buttonContainer}>
            <Link
                href={href}
                target={target}
                className={buttonClasses}
                style={style}
            >
                {buttonContent}
            </Link>
        </div>
    );
};

export default GradientButton;