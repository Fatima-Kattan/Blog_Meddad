// hooks/useUserData.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface User {
    id: number;
    full_name: string;
    email: string;
    phone_number: string;
    bio: string | null;
    birth_date: string;
    gender: string;
    image: string | null;
    created_at: string;
    updated_at: string;
}

interface ProcessedUserData {
    image: string;
    name: string;
    user: User | null;
}

interface UserDataOptions {
    fetchFromAPI?: boolean;
    autoRefresh?: boolean;
    refreshInterval?: number;
    useCache?: boolean;
}

interface UseUserDataReturn {
    userData: User | null;
    userImage: string;
    userImageLarge: string;
    userName: string;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    isRefreshing: boolean;
    getUserImage: (size?: 'small' | 'large') => string;
    refreshData: (force?: boolean) => Promise<void>;
    logout: () => void;
    updateUserData: (newData: User) => void;
    getStoredUser: () => User | null;
    fetchData: () => Promise<void>;
}

const processUserImage = (user: User | null): ProcessedUserData => {
    if (!user) {
        return {
            image: 'https://ui-avatars.com/api/?name=User&background=8b5cf6&color=fff&size=100',
            name: 'User',
            user: null
        };
    }

    let imageUrl: string = '';
    const name = user.full_name || user.email || 'User';

    if (user.image && user.image !== 'null' && user.image.trim() !== '') {
        imageUrl = user.image;
        
        if (imageUrl.startsWith('/')) {
            imageUrl = `http://localhost:8000${imageUrl}`;
        } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            imageUrl = `http://localhost:8000/uploads/${imageUrl}`;
        }
    } else {
        const initials = name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        
        imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=8b5cf6&color=fff&bold=true&size=100`;
    }

    return { image: imageUrl, name, user };
};

const validateToken = (token: string): boolean => {
    if (!token) return false;
    
    try {
        return token.length > 10;
    } catch {
        return false;
    }
};

export const useUserData = (options: UserDataOptions = {}): UseUserDataReturn => {
    const {
        fetchFromAPI = true,
        autoRefresh = false,
        refreshInterval = 30000,
        useCache = true
    } = options;

    const [userData, setUserData] = useState<User | null>(null);
    const [userImage, setUserImage] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const getStoredUser = useCallback((): User | null => {
        if (typeof window === 'undefined') return null;
        
        try {
            const storedUserStr = localStorage.getItem('user');
            if (!storedUserStr) return null;
            
            return JSON.parse(storedUserStr) as User;
        } catch (error) {
            console.error('Error reading stored user:', error);
            return null;
        }
    }, []);

    const setUserDataInternal = useCallback((user: User | null) => {
        if (user) {
            const { image, name, user: processedUser } = processUserImage(user);
            setUserData(processedUser);
            setUserImage(image);
            setUserName(name);
            setIsAuthenticated(true);
        } else {
            setUserData(null);
            setUserImage('');
            setUserName('');
            setIsAuthenticated(false);
        }
    }, []);

    const fetchUserFromAPI = useCallback(async (signal?: AbortSignal): Promise<User | null> => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token || !validateToken(token)) {
                return null;
            }

            const controller = new AbortController();
            abortControllerRef.current = controller;
            
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, 5000);

            const response = await fetch('http://localhost:8000/api/v1/user', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                signal: signal || controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                
                let user: User;
                
                if (data.data && data.data.user) {
                    user = data.data.user;
                } else if (data.user) {
                    user = data.user;
                } else {
                    user = data;
                }
                
                if (user && user.id) {
                    localStorage.setItem('user', JSON.stringify(user));
                    return user;
                }
            } else {
                return null;
            }
            
            return null;
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
            } else {
                console.log('Error fetching user from API:', error);
            }
            return null;
        } finally {
            abortControllerRef.current = null;
        }
    }, []);

    const fetchData = useCallback(async (useLocalCache: boolean = true): Promise<void> => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        setIsLoading(true);
        setError(null);

        try {
            if (useLocalCache && useCache) {
                const storedUser = getStoredUser();
                if (storedUser) {
                    setUserDataInternal(storedUser);
                    
                    const token = localStorage.getItem('token');
                    setIsAuthenticated(!!token && validateToken(token));
                }
            }

            if (fetchFromAPI) {
                setIsRefreshing(true);
                
                try {
                    const apiUser = await fetchUserFromAPI();
                    
                    if (apiUser) {
                        setUserDataInternal(apiUser);
                    }
                } catch (apiError) {
                } finally {
                    setIsRefreshing(false);
                }
            }
        } catch (error) {
            console.error('Error in fetchData:', error);
            setError(error instanceof Error ? error.message : 'Unknown error');
            
            setUserImage('https://ui-avatars.com/api/?name=User&background=8b5cf6&color=fff&size=100');
            setUserName('User');
        } finally {
            setIsLoading(false);
        }
    }, [fetchFromAPI, getStoredUser, setUserDataInternal, useCache, fetchUserFromAPI]);

    useEffect(() => {
        fetchData(true);

        if (autoRefresh && refreshInterval > 0) {
            refreshTimeoutRef.current = setInterval(() => {
                if (isAuthenticated) {
                    fetchData(false);
                }
            }, refreshInterval);
        }

        return () => {
            if (refreshTimeoutRef.current) {
                clearInterval(refreshTimeoutRef.current);
            }
            
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [autoRefresh, refreshInterval, isAuthenticated, fetchData]);

    const getUserImage = useCallback((size: 'small' | 'large' = 'small'): string => {
        if (userImage) {
            return userImage;
        }
        
        const storedUser = getStoredUser();
        if (storedUser) {
            const { image } = processUserImage(storedUser);
            return image;
        }
        
        const nameToUse = userName || 'User';
        const initials = nameToUse
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        
        const sizeValue = size === 'large' ? '200' : '100';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=8b5cf6&color=fff&bold=true&size=${sizeValue}`;
    }, [userImage, userName, getStoredUser]);

    const refreshData = useCallback(async (force: boolean = false): Promise<void> => {
        if (force) {
            await fetchData(false);
        } else {
            const storedUser = getStoredUser();
            if (storedUser) {
                setUserDataInternal(storedUser);
            }
            
            setTimeout(async () => {
                try {
                    setIsRefreshing(true);
                    const apiUser = await fetchUserFromAPI();
                    if (apiUser) {
                        setUserDataInternal(apiUser);
                    }
                } catch (error) {
                    console.log('Background refresh failed:', error);
                } finally {
                    setIsRefreshing(false);
                }
            }, 0);
        }
    }, [fetchData, getStoredUser, setUserDataInternal, fetchUserFromAPI]);

    const logout = useCallback((): void => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        setUserData(null);
        setUserImage('');
        setUserName('');
        setIsAuthenticated(false);
        setError(null);
        
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        if (refreshTimeoutRef.current) {
            clearInterval(refreshTimeoutRef.current);
            refreshTimeoutRef.current = null;
        }
    }, []);

    const updateUserData = useCallback((newData: User): void => {
        const { image, name, user: processedUser } = processUserImage(newData);
        
        setUserData(processedUser);
        setUserImage(image);
        setUserName(name);
        
        localStorage.setItem('user', JSON.stringify(newData));
    }, []);

    return {
        userData,
        userImage: getUserImage('small'),
        userImageLarge: getUserImage('large'),
        userName,
        isLoading,
        isAuthenticated,
        error,
        isRefreshing,
        getUserImage,
        refreshData,
        logout,
        updateUserData,
        getStoredUser,
        fetchData
    };
};

export const useQuickUserData = (): {
    userImage: string;
    userName: string;
    isAuthenticated: boolean;
} => {
    const { getUserImage, userName, isAuthenticated } = useUserData({
        fetchFromAPI: false,
        useCache: true
    });

    return {
        userImage: getUserImage('small'),
        userName,
        isAuthenticated
    };
};