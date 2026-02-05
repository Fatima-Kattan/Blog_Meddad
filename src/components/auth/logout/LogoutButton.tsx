// components/auth/logout/LogoutButton.tsx
'use client';

import React, { useState } from 'react';
import { logoutService, LogoutResponse } from '@/services/api/auth/logoutService'
import { useRouter } from 'next/navigation';
import './LogoutButton.css';

interface LogoutButtonProps {
    className?: string;
    showIcon?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
    className = '',
    showIcon = true,
    variant = 'danger'
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const router = useRouter();

    const handleLogout = async () => {
        if (!confirm('Are you sure you want to logout?')) {
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response: LogoutResponse = await logoutService.logout();

            if (response.success) {
                // Redirect to the login page
                router.push('/login');

                // Reload the page to ensure all data is removed
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } else {
                setError(response.message || 'Logout failed');
            }
        } catch (error: any) {
            setError(error.message || 'An error occurred during logout');

            setTimeout(() => {
                router.push('/login');
                window.location.reload();
            }, 1000);
        } finally {
            setIsLoading(false);
        }
    };

    const getButtonClass = () => {
        const baseClass = 'logout-button';
        const variantClass = `logout-button-${variant}`;
        return `${baseClass} ${variantClass} ${className}`;
    };

    return (
        <div className="logout-container">
            <button
                onClick={handleLogout}
                disabled={isLoading}
                className={getButtonClass()}
                aria-label="Logout"
            >
                {isLoading ? (
                    <>
                        <span className="logout-loader"></span>
                        Logging out...
                    </>
                ) : (
                    <>
                        Logout
                    </>
                )}
            </button>
            {error && <div className="logout-error">{error}</div>}
        </div>
    );
};

export default LogoutButton;