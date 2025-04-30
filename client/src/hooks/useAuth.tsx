import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {}

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Set up state to track if we've already attempted authentication
  const [authCheckComplete, setAuthCheckComplete] = useState(() => {
    return sessionStorage.getItem('auth_check_complete') === 'true';
  });
  
  // Get current user with stopped polling
  const { 
    data: user,
    isLoading,
    error,
    refetch
  } = useQuery({ 
    queryKey: ['/api/me'],
    retry: 0,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnReconnect: false,
    // Custom query function that never throws on 401
    queryFn: async () => {
      try {
        const response = await fetch('/api/me', {
          credentials: 'include'
        });
        
        if (response.status === 401) {
          // Mark auth check as complete to prevent further checks
          sessionStorage.setItem('auth_check_complete', 'true');
          setAuthCheckComplete(true);
          return null;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.log('Authentication check failed, will not retry');
        // Mark auth check as complete to prevent further checks
        sessionStorage.setItem('auth_check_complete', 'true');
        setAuthCheckComplete(true);
        return null;
      }
    },
    // Only run the query once if auth check is not complete
    enabled: !authCheckComplete,
  });
  
  // Mark auth check as complete when we have a result
  useEffect(() => {
    if (user !== undefined || error) {
      sessionStorage.setItem('auth_check_complete', 'true');
      setAuthCheckComplete(true);
    }
  }, [user, error]);
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return await apiRequest("POST", "/api/login", credentials);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    }
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      return await apiRequest("POST", "/api/register", credentials);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      toast({
        title: "Registration successful",
        description: "Your account has been created!",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Username may already be taken",
        variant: "destructive",
      });
    }
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/logout", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      toast({
        title: "Logout successful",
        description: "You have been logged out",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    }
  });
  
  // Login function
  const login = (credentials: LoginCredentials) => {
    loginMutation.mutate(credentials);
  };
  
  // Register function
  const register = (credentials: RegisterCredentials) => {
    registerMutation.mutate(credentials);
  };
  
  // Logout function
  const logout = () => {
    logoutMutation.mutate();
  };
  
  // Re-validate session when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        refetch();
      }
    };
    
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [user, refetch]);
  
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isLogoutLoading: logoutMutation.isPending
  };
}
