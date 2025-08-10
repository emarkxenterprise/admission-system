import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const { user, hasRole } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      let endpoint = '/settings';
      if (hasRole('admin') || hasRole('super-admin')) {
        endpoint = '/admin/settings';
      }
      
      const response = await api.get(endpoint);
      const settingsData = response.data.data || response.data;
      setSettings(settingsData);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSettings({});
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const response = await api.put('/admin/settings', newSettings);
      const updatedSettings = response.data.data || response.data;
      setSettings(updatedSettings);
      return { success: true, data: updatedSettings };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, error };
    }
  };

  const value = {
    settings,
    loading,
    updateSettings,
    refreshSettings: fetchSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}; 