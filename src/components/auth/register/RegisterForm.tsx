'use client';

import React, { useState, useEffect } from 'react';
import { authService, RegisterData } from '@/services/api/authService';
import InputField from '../../shared/InputField';
import SelectField from '../../shared/SelectField';
import DatePickerField from '../../shared/DatePickerField';
import FileUploadField from '../../shared/FileUploadField';
import './RegisterForm.css';

const RegisterForm: React.FC = () => {
    const [isClient, setIsClient] = useState(false);
    const [formData, setFormData] = useState<RegisterData>({
        full_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone_number: '',
        bio: '',
        birth_date: '',
        gender: 'male',
        image: null,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [today, setToday] = useState('');

    useEffect(() => {
        setIsClient(true);
        setToday(new Date().toISOString().split('T')[0]);
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (file: File | null) => {
        setFormData(prev => ({
            ...prev,
            image: file
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.full_name.trim()) {
            newErrors.full_name = 'Full name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.password_confirmation) {
            newErrors.password_confirmation = 'Password confirmation is required';
        } else if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'Passwords do not match';
        }

        if (!formData.phone_number.trim()) {
            newErrors.phone_number = 'Phone number is required';
        }

        if (!formData.birth_date) {
            newErrors.birth_date = 'Birth date is required';
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
            const response = await authService.register(formData);

            if (response.success) {
                setSuccessMessage('Registration successful!');
                setFormData({
                    full_name: '',
                    email: '',
                    password: '',
                    password_confirmation: '',
                    phone_number: '',
                    bio: '',
                    birth_date: '',
                    gender: 'male',
                    image: null,
                });

                if (isClient) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }

                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'An error occurred during registration');

            if (error.message.includes('email')) {
                setErrors(prev => ({ ...prev, email: 'This email is already in use' }));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
    ];

    if (!isClient) {
        return (
            <div className="register-container">
                <div className="register-card">
                    <h1 className="register-title">Create New Account</h1>
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        Loading form...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="register-container" suppressHydrationWarning>
            <div className="register-card">
                <h1 className="register-title"> Create New Account</h1>

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

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-grid">
                        <InputField
                            label="Full Name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                            error={errors.full_name}
                        />

                        <InputField
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@email.com"
                            required
                            error={errors.email}
                        />

                        <InputField
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            error={errors.password}
                        />

                        <InputField
                            label="Confirm Password"
                            name="password_confirmation"
                            type="password"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            placeholder="Re-enter your password"
                            required
                            error={errors.password_confirmation}
                        />

                        <InputField
                            label="Phone Number"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            placeholder="+1 234 567 8900"
                            required
                            error={errors.phone_number}
                        />

                        <DatePickerField
                            label="Birth Date"
                            name="birth_date"
                            value={formData.birth_date}
                            onChange={handleChange}
                            required
                            max={today}
                            error={errors.birth_date}
                        />

                        <SelectField
                            label="Gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            options={genderOptions}
                            required
                            error={errors.gender}
                        />

                        <div className="textarea-group">
                            <label htmlFor="bio" className="textarea-label">
                                About You (Optional)
                            </label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell us about yourself..."
                                className="textarea-field"
                                rows={4}
                            />
                        </div>

                        <FileUploadField
                            label="Profile Picture (Optional)"
                            name="image"
                            onChange={handleImageChange}
                            error={errors.image}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="register-button"
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>

                    <p className="login-link">
                        Already have an account?{' '}
                        <a href="/login" className="login-link-text">
                            Login
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;