// useAuth.js — separate hook file to satisfy Vite Fast Refresh rules
// (AuthContext.jsx cannot export both a component and a hook in the same file)
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const useAuth = () => useContext(AuthContext);
