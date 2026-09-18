import React, { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { NavigationProvider } from '@/context/NavigationContext';
import { MainLayout } from '@/components/MainLayout';
import { testConnection } from './firebase';

export default function App() {
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <AuthProvider>
      <NavigationProvider>
        <MainLayout />
      </NavigationProvider>
    </AuthProvider>
  );
}
