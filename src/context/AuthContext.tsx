/**
 * AuthProvider Component
 * 
 * This component provides authentication context to its children components.
 * It manages user authentication state, including login, register, and logout functionalities.
 * This version uses Capacitor Preferences for secure, cross-platform storage of the auth token.
 * 
 * @component
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import { BASE_URL } from '../constants/config';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

export interface User {
    id: number;
    email: string;
    name?: string;
    profilePicture?: string;
    phone?: string;
    address?: string;
    documentId?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isLoaded: boolean;
    loginWithGoogle: () => Promise<boolean>;
    updateProfile: (data: Partial<User>) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is just the key under which we store the auth token
const AUTH_TOKEN_KEY = 'authToken';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadToken = async () => {
            const { value: storedToken } = await Preferences.get({ key: AUTH_TOKEN_KEY });
            if (storedToken) {
                setToken(storedToken);
                await getCurrentUser(storedToken);
            } else {
                setIsLoaded(true);
            }
        };
        loadToken();
    }, []);

    /**
     * Fetches the current user's data using the provided token
     * 
     * @param {string} authToken - The authentication token
     */
    const getCurrentUser = async (authToken: string) => {
        try {
            const response = await axios.get(`${BASE_URL}/users/me`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (response.data) {
                setUser(response.data);
            } else {
                throw new Error('Invalid user data structure');
            }
        } catch (error) {
            console.error("Failed to fetch user data:", error);
            await logout();
        } finally {
            setIsLoaded(true);
        }
    };

    /**
     * Authenticates a user with email and password
     * 
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Promise<boolean>} True if login successful, false otherwise
     */
    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await axios.post(`${BASE_URL}/login`, { email, password });

            const { access_token, token_type } = response.data;

            if (!access_token) {
                return false;
            }

            // Set the token in state
            setToken(access_token);
            // Store the actual token using Capacitor Preferences
            await Preferences.set({ key: AUTH_TOKEN_KEY, value: access_token });

            await getCurrentUser(access_token);

            return true;
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    };

    /**
     * Registers a new user with email and password
     * 
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Promise<boolean>} True if registration successful, false otherwise
     */
    const register = async (email: string, password: string) => {
        try {
            const response = await axios.post(`${BASE_URL}/register`, { email, password });
            if (response.data && response.data.info) {
                setUser(response.data.info);
                return true;
            } else {
                throw new Error('Invalid registration response');
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                console.log("Email already registered");
            } else {
                console.error("Registration error:", error);
            }
            return false;
        }
    };

    /**
     * Logs out the current user and removes the stored token
     */
    const logout = async () => {
        setUser(null);
        setToken(null);
        // Remove the token from Capacitor Preferences
        await Preferences.remove({ key: AUTH_TOKEN_KEY });
    };


    // Initialize Google Auth in useEffect
    useEffect(() => {
        GoogleAuth.initialize({
            clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
            scopes: ['profile', 'email'],
            grantOfflineAccess: true
        });
    }, []);

    /**
    * Handles Google Sign-in
    * @returns {Promise<boolean>} True if login successful, false otherwise
    */
    const loginWithGoogle = async (): Promise<boolean> => {
        try {
            const googleUser = await GoogleAuth.signIn();

            // Get the ID token instead of access token
            const idToken = googleUser.authentication.idToken;

            if (!idToken) {
                console.error("No ID token received from Google");
                return false;
            }

            // Send Google ID token to your backend
            const response = await axios.post(`${BASE_URL}/login/google`, {
                token: idToken
            });

            const { access_token } = response.data;

            if (!access_token) {
                return false;
            }

            // Set and store the token
            setToken(access_token);
            await Preferences.set({ key: AUTH_TOKEN_KEY, value: access_token });

            await getCurrentUser(access_token);

            return true;
        } catch (error) {
            console.error("Google login error:", error);
            return false;
        }
    };

    const updateProfile = async (data: Partial<User>): Promise<User> => {
        try {
            const response = await axios.put(
                `${BASE_URL}/users/profile`,
                data,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const updatedUser = response.data;
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    };

    const value = {
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoaded,
        loginWithGoogle,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


/**
 * Custom hook to use the auth context
 * 
 * @returns {AuthContextType} The auth context value
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};