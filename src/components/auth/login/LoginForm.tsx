'use client';

import React, { useState, useEffect } from 'react';
import InputField from '../../shared/InputField';
import { loginService, LoginData } from '@/services/api/auth/loginService';
import styles from './LoginForm.module.css'; 
import LoadingIcon from '@/components/shared/LoadingIcon/LoadingIcon';

const LoginForm: React.FC = () => {
    const [isClient, setIsClient] = useState(false);
    const [formData, setFormData] = useState<LoginData>({
        login: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (typeof window !== 'undefined') {
            const savedEmail = localStorage.getItem('rememberedEmail');
            if (savedEmail) {
                setFormData(prev => ({ ...prev, login: savedEmail }));
                setRememberMe(true);
            }
        }
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        setErrorMessage('');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRememberMe(e.target.checked);
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.login.trim()) {
            newErrors.login = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.login)) {
            newErrors.login = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await loginService.login(formData);

            if (response.success) {
                setSuccessMessage('Login successful!');

                if (rememberMe && isClient) {
                    localStorage.setItem('rememberedEmail', formData.login);
                } else if (isClient) {
                    localStorage.removeItem('rememberedEmail');
                }
                // Save token and user
                if (isClient) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }

                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            }
        } catch (error: any) {
            const errorMsg = error.message || 'An error occurred during login';
            setErrorMessage(errorMsg);

            if (errorMsg.toLowerCase().includes('incorrect') || 
                errorMsg.toLowerCase().includes('invalid')) {
                setErrors(prev => ({ 
                    ...prev, 
                    login: 'Incorrect email or password',
                    password: 'Incorrect email or password'
                }));
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isClient) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.titleContainer}>
                        <div className={styles.icon}>🔐</div>
                        <div className={styles.title}>
                            <span className={styles.titleText}>Welcome Back</span>
                            <span className={styles.subtitle}>Sign in to your account</span>
                        </div>
                    </div>
                    <div className={styles.loadingContainer}>
                        <LoadingIcon 
                            size={40}
                            message="Loading login form..."
                            position="absolute"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container} suppressHydrationWarning>
            <div className={styles.card}>
                <div className={styles.titleContainer}>
                    <div className={styles.icon}>🔐</div>
                    <div className={styles.title}>
                        <span className={styles.titleText}>Welcome Back</span>
                        <span className={styles.subtitle}>Sign in to your account</span>
                    </div>
                </div>

                {successMessage && (
                    <div className={styles.successMessage}>
                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className={styles.errorMessageGlobal}>
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <InputField
                        label="Email Address"
                        name="login"
                        type="email"
                        value={formData.login}
                        onChange={handleChange}
                        placeholder="example@email.com"
                        required={true}
                        error={errors.login}
                    />

                    <div className={styles.formGroup}>
                        <div className={styles.passwordContainer}>
                            <InputField
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required={true}
                                error={errors.password}
                                label="Password"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className={styles.passwordToggle}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>
                        {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
                    </div>

                    <div className={styles.rememberForgot}>
                        <div className={styles.rememberMe}>
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={handleRememberMeChange}
                                className={styles.rememberCheckbox}
                            />
                            <label htmlFor="rememberMe" className={styles.rememberLabel}>
                                Remember me
                            </label>
                        </div>
                        <a href="/forgot-password" className={styles.forgotPassword}>
                            Forgot password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={styles.button}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <div className={styles.divider}>
                        <span>Or</span>
                    </div>

                    <p className={styles.registerLink}>
                        Don't have an account?{' '}
                        <a href="/register" className={styles.registerLinkText}>
                            Create account
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;