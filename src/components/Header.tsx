import React, { useEffect } from 'react';
import { Button } from '../components/ui/button';
import { useAuth, User } from '../context/AuthContext';
import { LogOutIcon, UserIcon } from 'lucide-react';
import Avvvatars from 'avvvatars-react';
import { useIonRouter } from '@ionic/react';

/**
 * Header for the user authenticated pages 
 */
const Header: React.FC = () => {
  const router = useIonRouter();
  
  const { logout, user, isAuthenticated, isLoaded } = useAuth();

  /** 
   * This function is used to handle the logout button onClick event, triggering the context function and the router push
   */
  const handleLogout = () => {
    logout();
    router.push("/login", "forward", "push");
  }

  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      router.push("/login", "forward", "push");
    }
  }, [isLoaded, isAuthenticated, router]);

  // Check if user object and its properties are defined before accessing
  const userEmail = user?.email ?? "example@domain.tld";

  return (
    <section className='flex flex-row items-center gap-3 justify-between w-full'>
      <section className="w-fit h-12 pl-2 pr-6 py-3 bg-white rounded-3xl shadow justify-start items-center gap-3 inline-flex">
        <Avvvatars style='shape' value={userEmail} size={32} />
        <div className="text-black text-sm font-medium mt-[-1px]">{userEmail}</div>
      </section>
      <Button 
        onClick={() => router.push('/profile')} 
        variant="outline" 
        className="flex items-center space-x-2"
      >
        <UserIcon className="h-4 w-4" />
      </Button>
      <Button 
        onClick={handleLogout} 
        variant="outline" 
        className="flex items-center space-x-2"
      >
        <LogOutIcon className="h-4 w-4" />
      </Button>
    </section>
  );
};

export default Header;