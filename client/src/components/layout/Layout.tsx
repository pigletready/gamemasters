import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [location, setLocation] = useLocation();
  const [isLoginPage] = useRoute("/login");
  const [isRegisterPage] = useRoute("/register");
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/me'],
    retry: false,
    refetchOnWindowFocus: false,
  });
  
  // If not on login/register page and not logged in, redirect to login
  React.useEffect(() => {
    if (!isLoginPage && !isRegisterPage && !isLoading && !user) {
      // For demo purposes, we'll use the existing user
      // In a real app, we'd redirect to login
      // setLocation("/login");
    }
  }, [user, isLoading, isLoginPage, isRegisterPage, setLocation]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-950">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 bg-[radial-gradient(circle_at_10%_20%,rgba(98,0,234,0.05)_0%,rgba(98,0,234,0)_20%),radial-gradient(circle_at_90%_80%,rgba(98,0,234,0.07)_0%,rgba(98,0,234,0)_25%)]">
      <Header user={user} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
