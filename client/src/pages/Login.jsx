import React, { useState } from "react";
import { useAuthentication } from "../hooks/useAuthentication";
import { INITIAL_LOGIN_DATA } from "../constants/authConstants";
import { validateLoginForm } from "../utils/authUtils";
import {
  AuthContainer,
  AuthHeading,
  AuthInput,
  AuthButton,
  ErrorMessage,
  SuccessMessage,
  AuthLink,
  AuthDivider
} from "../components/auth/AuthComponents";

export default function Login() {
  const [formData, setFormData] = useState(INITIAL_LOGIN_DATA);
  const [formErrors, setFormErrors] = useState({});
  
  const { loading, error, success, performLogin, clearMessages } = useAuthentication();

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear global messages when user starts typing
    if (error || success) {
      clearMessages();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    const result = await performLogin(formData);
    if (result.success) {
      setFormData(INITIAL_LOGIN_DATA);
      setFormErrors({});
    }
  };

  return (
    <AuthContainer>
      <AuthHeading>Login</AuthHeading>
      
      <form onSubmit={handleSubmit} autoComplete="off">
        <ErrorMessage message={error} />
        <SuccessMessage message={success} />
        
        <AuthInput
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          placeholder="Email"
          error={formErrors.email}
          autoComplete="off"
          required
        />
        
        <AuthInput
          type="password"
          value={formData.password}
          onChange={handleInputChange('password')}
          placeholder="Password"
          error={formErrors.password}
          autoComplete="off"
          required
        />
        
        <AuthButton type="submit" loading={loading}>
          Login
        </AuthButton>
      </form>

      <AuthDivider>or</AuthDivider>
      
      <AuthLink to="/register">
        Don't have an account? Register here
      </AuthLink>
      
      <AuthLink to="/forgot-password">
        Forgot your password?
      </AuthLink>
    </AuthContainer>
  );
}