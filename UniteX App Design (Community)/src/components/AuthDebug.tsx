import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthDebug() {
  const [authState, setAuthState] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          return;
        }
        setAuthState(session);
        
        if (session?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (profileError) {
            console.error('Profile error:', profileError);
          } else {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Auth debug error:', error);
      }
    };
    
    checkAuth();
  }, []);

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed top-0 right-0 bg-black/80 text-white p-2 text-xs max-w-xs z-50">
      <div>Auth: {authState ? '✅' : '❌'}</div>
      <div>Email: {authState?.user?.email || 'None'}</div>
      <div>Profile: {profile?.full_name || 'None'}</div>
      <div>User ID: {authState?.user?.id?.slice(0, 8) || 'None'}</div>
    </div>
  );
}