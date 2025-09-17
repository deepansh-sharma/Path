import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { showToast } from '../components/ui/Toast';

// Auth action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial auth state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
      };
    
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: { user, token },
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Login function
  const login = async (credentials, userType = 'lab') => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...credentials,
          userType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: data.user,
          token: data.token,
        },
      });

      showToast.success('Login Successful', `Welcome back, ${data.user.name}!`);
      
      return { success: true, user: data.user };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message,
      });

      showToast.error('Login Failed', error.message);
      
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    
    showToast.info('Logged Out', 'You have been successfully logged out.');
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role);
  };

  // Get user permissions based on role
  const getPermissions = () => {
    const rolePermissions = {
      'super-admin': [
        'manage-labs',
        'manage-subscriptions',
        'view-global-analytics',
        'manage-users',
      ],
      'lab-admin': [
        'manage-lab-staff',
        'manage-patients',
        'manage-samples',
        'manage-reports',
        'manage-invoices',
        'view-lab-analytics',
        'configure-lab',
      ],
      'technician': [
        'manage-samples',
        'create-reports',
        'view-patients',
      ],
      'receptionist': [
        'manage-patients',
        'schedule-appointments',
        'view-invoices',
      ],
      'finance': [
        'manage-invoices',
        'view-payments',
        'generate-financial-reports',
      ],
    };

    return rolePermissions[state.user?.role] || [];
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    const permissions = getPermissions();
    return permissions.includes(permission);
  };

  const value = {
    ...state,
    login,
    logout,
    clearError,
    hasRole,
    hasAnyRole,
    hasPermission,
    getPermissions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// HOC for protecting routes
export const withAuth = (Component, requiredRoles = []) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, hasAnyRole } = useAuth();
    
    if (!isAuthenticated || (requiredRoles.length > 0 && !hasAnyRole(requiredRoles))) {
      return <div>Access denied</div>;
    }
    
    return <Component {...props} />;
  };
};

export { AuthContext };
export default AuthContext;