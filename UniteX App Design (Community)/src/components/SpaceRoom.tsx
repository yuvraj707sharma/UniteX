import { useState, useEffect } from 'react';
import { ArrowLeft, Mic, MicOff, Hand, Users, Crown, Settings } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

interface SpaceRoomProps {
  space: any;
  onLeave: () => void;
}

export default function VartalaapRoom({ space, onLeave }: SpaceRoomProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    fetchMembers();
    getCurrentUser();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('vartalaap-room')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'space_members', filter: `space_id=eq.${space.id}` },
        () => fetchMembers()
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'spaces', filter: `id=eq.${space.id}` },
        () => fetchMembers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [space.id]);

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        setCurrentUser(profile);
        setIsHost(space.created_by === user.id);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('space_members')
        .select(`
          *,
          profiles(id, full_name, username, avatar_url)
        `)
        .eq('space_id', space.id);
      
      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const toggleMute = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('space_members')
          .update({ is_muted: !isMuted })
          .eq('space_id', space.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      }
      setIsMuted(!isMuted);
      toast.success(isMuted ? 'Microphone on' : 'Microphone off');
    } catch (error) {
      console.error('Error toggling mute:', error);
      toast.error('Failed to toggle microphone');
    }
  };

  const toggleHandRaise = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('space_members')
          .update({ hand_raised: !handRaised })
          .eq('space_id', space.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      }
      setHandRaised(!handRaised);
      toast.success(handRaised ? 'Hand lowered' : 'Hand raised');
    } catch (error) {
      console.error('Error toggling hand raise:', error);
      toast.error('Failed to toggle hand raise');
    }
  };

  const allowToSpeak = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('space_members')
        .update({ 
          voice_role: 'speaker',
          can_speak: true, 
          hand_raised: false 
        })
        .eq('id', memberId);

      if (error) throw error;

      toast.success('User can now speak in Vartalaap');
    } catch (error) {
      console.error('Error allowing user to speak:', error);
      toast.error('Failed to allow user to speak');
    }
  };

  const handleLeave = async () => {
    try {
      // Remove user from space_members
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('space_members')
          .delete()
          .eq('space_id', space.id)
          .eq('user_id', user.id);
        
        // Update listener count
        await supabase
          .from('spaces')
          .update({ listener_count: Math.max(0, (space.listener_count || 1) - 1) })
          .eq('id', space.id);
      }
    } catch (error) {
      console.error('Error leaving vartalaap:', error);
    }
    
    toast.success('Left Vartalaap');
    onLeave();
  };

  const speakingMembers = members.filter(m => m.role === 'admin' || m.can_speak);
  const listeningMembers = members.filter(m => m.role !== 'admin' && !m.can_speak);

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={handleLeave}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-foreground text-lg">🎙️ {space.name}</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-muted-foreground text-sm">{members.length} in Vartalaap</span>
            </div>
          </div>
          {isHost && (
            <button className="p-2 dark:hover:bg-zinc-800 light:hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Space Content */}
      <div className="p-4 pb-32">
        {/* Space Info */}
        <div className="mb-6 text-center">
          <div className="text-4xl mb-2">🗣️</div>
          <p className="text-muted-foreground text-sm">{space.description}</p>
          {space.topic && (
            <Badge className="mt-2 dark:bg-zinc-800 light:bg-gray-200 dark:text-zinc-300 light:text-gray-700">
              {space.topic}
            </Badge>
          )}
          {isHost && (
            <div className="mt-3 flex items-center justify-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-yellow-500 font-medium">You are the Host</span>
            </div>
          )}
        </div>

        {/* Speaking Members */}
        {speakingMembers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-foreground mb-3 flex items-center gap-2">
              <Mic className="w-4 h-4" />
              🎤 Speaking ({speakingMembers.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {speakingMembers.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="dark:bg-zinc-900 light:bg-gray-50 rounded-xl p-3 border dark:border-zinc-800 light:border-gray-200"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-2">
                      <Avatar className={`w-12 h-12 ${member.voice_role === 'host' ? 'ring-2 ring-yellow-500' : ''}`}>
                        <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black">
                          {member.profiles?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {member.voice_role === 'host' && (
                        <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className={`w-3 h-3 rounded-full absolute -bottom-1 -right-1 border-2 dark:border-zinc-900 light:border-gray-50 ${
                        member.is_muted ? 'bg-red-500' : 'bg-green-500 animate-pulse'
                      }`} />
                    </div>
                    <div className="text-center">
                      <span className="text-foreground text-sm font-medium">
                        {member.profiles?.full_name || 'Unknown'}
                      </span>
                      {member.voice_role === 'host' && (
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Crown className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-yellow-500 font-medium">HOST</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Listening Members */}
        {listeningMembers.length > 0 && (
          <div>
            <h3 className="text-foreground mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              👂 Listening ({listeningMembers.length})
            </h3>
            <div className="space-y-2">
              {listeningMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 dark:bg-zinc-900 light:bg-gray-50 rounded-lg"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black text-xs">
                      {member.profiles?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-foreground text-sm">
                      {member.profiles?.full_name || 'Unknown'}
                    </span>
                    {member.voice_role === 'host' && (
                      <div className="flex items-center gap-1">
                        <Crown className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-yellow-500 font-medium">HOST</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {member.hand_raised && (
                      <>
                        <div className="animate-bounce">
                          <Hand className="w-5 h-5 text-yellow-500" />
                        </div>
                        {isHost && (
                          <button
                            onClick={() => allowToSpeak(member.id)}
                            className="text-xs px-3 py-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                          >
                            ✓ Allow
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto dark:bg-black/90 light:bg-white/90 backdrop-blur-xl border-t dark:border-zinc-800 light:border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={handleLeave}
            variant="outline"
            className="text-red-500 border-red-500 hover:bg-red-500/10"
          >
            Leave
          </Button>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleHandRaise}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                handRaised
                  ? 'bg-yellow-500 text-white animate-bounce shadow-lg'
                  : 'dark:bg-zinc-800 light:bg-gray-200 dark:text-zinc-300 light:text-gray-700 hover:scale-105'
              }`}
            >
              <Hand className={`w-5 h-5 ${handRaised ? 'animate-pulse' : ''}`} />
            </button>

            <button
              onClick={toggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                isMuted
                  ? 'bg-red-500 text-white'
                  : 'dark:bg-green-500 light:bg-green-600 text-white'
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>

          <div className="w-16" /> {/* Spacer for balance */}
        </div>
      </div>
    </div>
  );
}