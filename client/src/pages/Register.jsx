import React, { useState } from "react";
import { useAuthentication } from "../hooks/useAuthentication";
import { INITIAL_REGISTER_DATA, USER_ROLES } from "../constants/authConstants";
import { validateRegisterForm } from "../utils/authUtils";
import {
  AuthContainer,
  AuthHeading,
  AuthInput,
  AuthButton,
  ErrorMessage,
  SuccessMessage,
  AuthLink,
  AuthDivider,
  RoleSelector
} from "../components/auth/AuthComponents";

export default function Register() {
  const [formData, setFormData] = useState(INITIAL_REGISTER_DATA);
  const [formErrors, setFormErrors] = useState({});
  
  const { loading, error, success, performRegister, clearMessages } = useAuthentication();

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

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setFormData(prev => ({ ...prev, role }));
    
    // Clear role-specific errors
    if (formErrors.role || formErrors.shopName) {
      setFormErrors(prev => ({ 
        ...prev, 
        role: '', 
        shopName: '' 
      }));
    }
    
    if (error || success) {
      clearMessages();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateRegisterForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    const result = await performRegister(formData);
    if (result.success) {
      setFormData(INITIAL_REGISTER_DATA);
      setFormErrors({});
    }
  };

  const isSeller = formData.role === USER_ROLES.SELLER;

  return (
    <AuthContainer>
      <AuthHeading>Register</AuthHeading>
      
      <form onSubmit={handleSubmit} autoComplete="off">
        <ErrorMessage message={error} />
        <SuccessMessage message={success} />
        
        <AuthInput
          type="text"
          value={formData.name}
          onChange={handleInputChange('name')}
          placeholder="Full Name"
          error={formErrors.name}
          autoComplete="off"
          required
        />
        
        <AuthInput
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          placeholder="Email"
          error={formErrors.email}
          autoComplete="new-email"
          required
        />
        
        <AuthInput
          type="password"
          value={formData.password}
          onChange={handleInputChange('password')}
          placeholder="Password (min. 6 characters)"
          error={formErrors.password}
          autoComplete="new-password"
          required
        />
        
        <RoleSelector
          value={formData.role}
          onChange={handleRoleChange}
          error={formErrors.role}
        />
        
        {isSeller && (
          <>
            <AuthInput
              type="text"
              value={formData.shopName}
              onChange={handleInputChange('shopName')}
              placeholder="Shop Name"
              error={formErrors.shopName}
              required
            />
            
            <AuthInput
              type="text"
              value={formData.description}
              onChange={handleInputChange('description')}
              placeholder="Shop Description (optional)"
            />
          </>
        )}
        
        <AuthButton type="submit" loading={loading}>
          Register
        </AuthButton>
      </form>

      <AuthDivider>or</AuthDivider>
      
      <AuthLink to="/login">
        Already have an account? Login here
      </AuthLink>
    </AuthContainer>
  );
}