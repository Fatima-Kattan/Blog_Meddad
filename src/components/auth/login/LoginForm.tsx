'use client';

import React, { useState, useEffect } from 'react';
import InputField from '../../shared/InputField';
import { loginService, LoginData } from '@/services/api/auth/loginService';
import './LoginForm.css';

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
        // تحميل بيانات التذكر إن وجدت
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

        // مسح الخطأ عند التعديل
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        setErrorMessage(''); // مسح رسالة الخطأ العامة
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

                // حفظ بيانات التذكر إذا كان محددًا
                if (rememberMe && isClient) {
                    localStorage.setItem('rememberedEmail', formData.login);
                } else if (isClient) {
                    localStorage.removeItem('rememberedEmail');
                }

                // حفظ التوكن والمستخدم
                if (isClient) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }

                // إعادة التوجيه إلى الصفحة الرئيسية بعد 1.5 ثانية
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            }
        } catch (error: any) {
            const errorMsg = error.message || 'An error occurred during login';
            setErrorMessage(errorMsg);

            // معالجة أخطاء محددة
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
            <div className="login-container">
                <div className="login-card">
                    <div className="login-title-container">
                        <div className="login-icon">🔐</div>
                        <div className="login-title">
                            <span className="login-title-text">Welcome Back</span>
                            <span className="login-subtitle">Sign in to your account</span>
                        </div>
                    </div>
                    <div className="loading-text">
                        Loading login form...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container" suppressHydrationWarning>
            <div className="login-card">
                <div className="login-title-container">
                    <div className="login-icon">🔐</div>
                    <div className="login-title">
                        <span className="login-title-text">Welcome Back</span>
                        <span className="login-subtitle">Sign in to your account</span>
                    </div>
                </div>

                {successMessage && (
                    <div className="success-message">
                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className="error-message-global">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    {/* استخدام InputField بدلاً من input مباشرة */}
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

                    {/* للحقل password سنضيف container خاص لإضافة زر show/hide */}
                    <div className="form-group">
                        <div className="password-container">
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
                                className="password-toggle"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>

                    <div className="remember-forgot">
                        <div className="remember-me">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={handleRememberMeChange}
                                className="remember-checkbox"
                            />
                            <label htmlFor="rememberMe" className="remember-label">
                                Remember me
                            </label>
                        </div>
                        <a href="/forgot-password" className="forgot-password">
                            Forgot password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="login-button"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <div className="divider">
                        <span>Or</span>
                    </div>

                    <p className="register-link">
                        Don't have an account?{' '}
                        <a href="/register" className="register-link-text">
                            Create account
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;