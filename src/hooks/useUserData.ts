// hooks/useUserData.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ⭐⭐ تعريف نوع المستخدم ⭐⭐
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

// ⭐⭐ دالة مساعدة لمعالجة الصورة ⭐⭐
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

    // ⭐⭐ معالجة الصورة بذكاء ⭐⭐
    if (user.image && user.image !== 'null' && user.image.trim() !== '') {
        imageUrl = user.image;
        
        // تحويل المسار النسبي إلى مطلق
        if (imageUrl.startsWith('/')) {
            imageUrl = `http://localhost:8000${imageUrl}`;
        } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            imageUrl = `http://localhost:8000/uploads/${imageUrl}`;
        }
    } else {
        // إنشاء صورة من الحروف الأولى
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

// ⭐⭐ دالة مساعدة للتحقق من الصلاحية ⭐⭐
const validateToken = (token: string): boolean => {
    if (!token) return false;
    
    try {
        // يمكنك إضافة المزيد من التحقق هنا
        return token.length > 10;
    } catch {
        return false;
    }
};

// ⭐⭐ الهوك الرئيسي المحسن ⭐⭐
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

    // ⭐⭐ دالة للحصول على المستخدم من localStorage ⭐⭐
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

    // ⭐⭐ دالة مساعدة لتعيين بيانات المستخدم ⭐⭐
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

    // ⭐⭐ دالة محسنة لجلب البيانات من API ⭐⭐
    const fetchUserFromAPI = useCallback(async (signal?: AbortSignal): Promise<User | null> => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token || !validateToken(token)) {
                console.log('No valid token found');
                return null;
            }

            // ⭐⭐ استخدام AbortController لمنع التجميد ⭐⭐
            const controller = new AbortController();
            abortControllerRef.current = controller;
            
            const timeoutId = setTimeout(() => {
                controller.abort();
                /* console.log('API request timed out'); */
            }, 5000);

            const response = await fetch('http://localhost:8000/api/v1/user', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                signal: signal || controller.signal
            });

            clearTimeout(timeoutId);

            // ⭐⭐ التعديل هنا: لا ترمي خطأ عند 404 ⭐⭐
            if (response.ok) {
                const data = await response.json();
                
                // ⭐⭐ معالجة الاستجابة بمرونة ⭐⭐
                let user: User;
                
                if (data.data && data.data.user) {
                    user = data.data.user;
                } else if (data.user) {
                    user = data.user;
                } else {
                    user = data;
                }
                
                if (user && user.id) {
                    // ⭐⭐ حفظ في localStorage للاستخدام السريع ⭐⭐
                    localStorage.setItem('user', JSON.stringify(user));
                    return user;
                }
            } else {
                // ⭐⭐ فقط سجل الخطأ بدون رميه ⭐⭐
                console.log(`API returned ${response.status}, using cached data`);
                return null;
            }
            
            return null;
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                /* console.log('API request was aborted'); */
            } else {
                console.log('Error fetching user from API:', error);
            }
            return null;
        } finally {
            abortControllerRef.current = null;
        }
    }, []);

    // ⭐⭐ دالة محسنة لجلب البيانات (Local + API) ⭐⭐
    const fetchData = useCallback(async (useLocalCache: boolean = true): Promise<void> => {
        // ⭐⭐ إلغاء أي طلب سابق ⭐⭐
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        setIsLoading(true);
        setError(null);

        try {
            // ⭐⭐ المرحلة 1: استخدام البيانات المحلية (فوري) ⭐⭐
            if (useLocalCache && useCache) {
                const storedUser = getStoredUser();
                if (storedUser) {
                    setUserDataInternal(storedUser);
                    
                    // ⭐⭐ إذا كان هناك token، نعتبر المستخدم مسجل دخول ⭐⭐
                    const token = localStorage.getItem('token');
                    setIsAuthenticated(!!token && validateToken(token));
                }
            }

            // ⭐⭐ المرحلة 2: جلب البيانات من API (إذا طلبنا ذلك) ⭐⭐
            if (fetchFromAPI) {
                setIsRefreshing(true);
                
                try {
                    const apiUser = await fetchUserFromAPI();
                    
                    if (apiUser) {
                        setUserDataInternal(apiUser);
                    }
                    // ⭐⭐ لا تفعل أي شيء إذا فشل API ⭐⭐
                } catch (apiError) {
                    // ⭐⭐ لا تسجل حتى خطأ ⭐⭐
                    // console.error('API fetch failed:', apiError);
                } finally {
                    setIsRefreshing(false);
                }
            }
        } catch (error) {
            console.error('Error in fetchData:', error);
            setError(error instanceof Error ? error.message : 'Unknown error');
            
            // ⭐⭐ استخدم صورة افتراضية عند الخطأ ⭐⭐
            setUserImage('https://ui-avatars.com/api/?name=User&background=8b5cf6&color=fff&size=100');
            setUserName('User');
        } finally {
            setIsLoading(false);
        }
    }, [fetchFromAPI, getStoredUser, setUserDataInternal, useCache, fetchUserFromAPI]);

    // ⭐⭐ التحميل الأولي ⭐⭐
    useEffect(() => {
        fetchData(true);

        // ⭐⭐ التحديث التلقائي (اختياري) ⭐⭐
        if (autoRefresh && refreshInterval > 0) {
            refreshTimeoutRef.current = setInterval(() => {
                if (isAuthenticated) {
                    fetchData(false); // تحديث من API فقط
                }
            }, refreshInterval);
        }

        // ⭐⭐ تنظيف ⭐⭐
        return () => {
            if (refreshTimeoutRef.current) {
                clearInterval(refreshTimeoutRef.current);
            }
            
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [autoRefresh, refreshInterval, isAuthenticated, fetchData]);

    // ⭐⭐ دالة محسنة للحصول على الصورة ⭐⭐
    const getUserImage = useCallback((size: 'small' | 'large' = 'small'): string => {
        // ⭐⭐ إذا كانت لدينا صورة محسوبة، استخدمها ⭐⭐
        if (userImage) {
            return userImage;
        }
        
        // ⭐⭐ حاول الحصول من localStorage أولاً (أسرع) ⭐⭐
        const storedUser = getStoredUser();
        if (storedUser) {
            const { image } = processUserImage(storedUser);
            return image;
        }
        
        // ⭐⭐ أخيراً، أنشئ صورة من الاسم ⭐⭐
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

    // ⭐⭐ دالة محسنة لتحديث البيانات ⭐⭐
    const refreshData = useCallback(async (force: boolean = false): Promise<void> => {
        if (force) {
            // ⭐⭐ تحديث قسري من API ⭐⭐
            await fetchData(false);
        } else {
            // ⭐⭐ تحديث ذكي: محلي أولاً، ثم API في الخلفية ⭐⭐
            
            // 1. تحديث فوري من localStorage
            const storedUser = getStoredUser();
            if (storedUser) {
                setUserDataInternal(storedUser);
            }
            
            // 2. تحديث من API في الخلفية (غير متزامن)
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

    // ⭐⭐ دالة تسجيل الخروج ⭐⭐
    const logout = useCallback((): void => {
        // ⭐⭐ تنظيف localStorage ⭐⭐
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // ⭐⭐ تنظيف state ⭐⭐
        setUserData(null);
        setUserImage('');
        setUserName('');
        setIsAuthenticated(false);
        setError(null);
        
        // ⭐⭐ إلغاء أي طلبات معلقة ⭐⭐
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // ⭐⭐ إلغاء التحديث التلقائي ⭐⭐
        if (refreshTimeoutRef.current) {
            clearInterval(refreshTimeoutRef.current);
            refreshTimeoutRef.current = null;
        }
    }, []);

    // ⭐⭐ دالة تحديث بيانات المستخدم ⭐⭐
    const updateUserData = useCallback((newData: User): void => {
        const { image, name, user: processedUser } = processUserImage(newData);
        
        // ⭐⭐ تحديث state ⭐⭐
        setUserData(processedUser);
        setUserImage(image);
        setUserName(name);
        
        // ⭐⭐ تحديث localStorage ⭐⭐
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

// ⭐⭐ دالة مساعدة للاستخدام السريع (اختياري) ⭐⭐
export const useQuickUserData = (): {
    userImage: string;
    userName: string;
    isAuthenticated: boolean;
} => {
    const { getUserImage, userName, isAuthenticated } = useUserData({
        fetchFromAPI: false, // ⭐⭐ لا تجلب من API ⭐⭐
        useCache: true       // ⭐⭐ استخدم الـ cache فقط ⭐⭐
    });

    return {
        userImage: getUserImage('small'),
        userName,
        isAuthenticated
    };
};