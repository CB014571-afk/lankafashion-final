// Custom hook for authentication
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { handleAuthError, getRedirectPath } from '../utils/authUtils';

export const useAuthentication = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const performLogin = async (loginData) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await API.post("/users/login", loginData);
      const { token, user } = res.data;
      
      login(token, user.role, user);
      
      const redirectPath = getRedirectPath(user.role);
      navigate(redirectPath);
      
      return { success: true, user };
    } catch (err) {
      const errorMessage = handleAuthError(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const performRegister = async (registerData) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await API.post("/users/register", registerData);
      setSuccess('Registration successful! Please login.');
      
      return { success: true };
    } catch (err) {
      const errorMessage = handleAuthError(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return {
    loading,
    error,
    success,
    performLogin,
    performRegister,
    clearMessages
  };
};