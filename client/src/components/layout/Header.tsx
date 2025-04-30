import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Menu } from "lucide-react";

interface HeaderProps {
  user: any;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/logout', {});
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };
  
  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  return (
    <header className="bg-neutral-950 border-b border-neutral-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <span className="material-icons text-accent mr-2">rocket_launch</span>
              <h1 className="text-2xl font-bold font-montserrat text-white">
                Rocket <span className="text-accent">Casino</span>
              </h1>
            </div>
          </Link>
        </div>
        
        {user && (
          <div className="flex items-center">
            <div className="bg-neutral-900 rounded-full py-1 px-4 flex items-center border border-neutral-700">
              <span className="material-icons text-accent mr-1 text-sm">account_balance</span>
              <span className="text-accent font-medium font-montserrat">
                {formatNumber(user.balance)}
              </span>
              <span className="text-xs text-neutral-400 ml-1">chips</span>
            </div>
            
            <div className="ml-3 hidden md:flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-montserrat font-medium">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <span className="ml-2 font-medium text-white">{user.username}</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-3">
                  <Menu className="h-5 w-5 text-neutral-400 hover:text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <span className="w-full cursor-pointer">Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/leaderboard">
                    <span className="w-full cursor-pointer">Leaderboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
