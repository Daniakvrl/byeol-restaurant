import React, { createContext, useContext, useState } from 'react';
import { LOCAL_STORAGE_KEYS } from '../constants';
import { getUserRoleFromToken } from '../utils/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN));
    const [role, setRole] = useState(getUserRoleFromToken(token));

    function login(newToken) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, newToken);
        setToken(newToken);
        setRole(getUserRoleFromToken(newToken));
    }

    function logout() {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
        setToken(null);
        setRole(null);
    }

    return (
        <AuthContext.Provider value={{ token, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
