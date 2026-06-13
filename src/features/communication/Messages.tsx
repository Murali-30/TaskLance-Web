import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getChats, getMessages, sendMessage, getUser } from '../../lib/db';
import { Input } from '../../components/ui/Input';
import { Search, Phone, Video, MoreVertical, Paperclip, Mic, Send, Image as ImageIcon, MessageCircle, Loader2 } from 'lucide-react';

export default function Messages() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [chats, setChats] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Cache of user profiles
  const [usersCache, setUsersCache] = useState<Record<string, any>>({});

  // Fetch chats
  useEffect(() => {
    if (!user?.id) return;
    const fetchChats = async () => {
      try {
        const c = await getChats(user.id);
        
        // Fetch all partner profiles
        const newUsersCache = { ...usersCache };
        for (const chat of c) {
          const partnerId = chat.participants.find((p: string) => p !== user.id);
          if (partnerId && !newUsersCache[partnerId]) {
            const partnerProfile = await getUser(partnerId);
            if (partnerProfile) {
              newUsersCache[partnerId] = partnerProfile;
            }
          }
        }
        setUsersCache(newUsersCache);
        setChats(c);
        if (c.length > 0 && !activeChatId) setActiveChatId(c[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, [user?.id]);

  // Fetch messages when chat changes
  useEffect(() => {
    if (!activeChatId) return;
    const fetchMsgs = async () => {
      try {
        const m = await getMessages(activeChatId);
        setMessages(m);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMsgs();
  }, [activeChatId]);

  const activeChat = chats.find(c => c.id === activeChatId);
  const otherParticipantId = activeChat?.participants.find((p: string) => p !== user?.id);
  const otherUser = otherParticipantId ? usersCache[otherParticipantId] : null;

  if (loading) {
    return (
      <div className="flex-1 flex justify-center mt-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-8">
        <h2 className="text-2xl font-display font-semibold mb-2">No Messages</h2>
        <p>You don't have any active conversations yet.</p>
      </div>
    );
  }

  const handleSend = async () => {
    if (!messageText.trim() || !activeChatId || !user) return;
    
    const text = messageText;
    setMessageText(''); // Optimistic clear

    try {
      await sendMessage(activeChatId, user.id, text);
      const newMsg = {
        id: `temp-${Date.now()}`,
        senderId: user.id,
        text,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, newMsg]);
    } catch (err) {
      addToast('Failed to send message', 'error');
    }
  };

  const handleAttachment = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        addToast(`Attached: ${file.name}`, 'info');
      }
    };
    input.click();
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-screen w-full bg-background overflow-hidden">
      {/* Chat List (Sidebar) */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-border-color flex flex-col ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border-color">
          <h2 className="text-2xl font-display font-bold mb-4">Messages</h2>
          <Input 
            placeholder="Search messages..." 
            icon={<Search className="w-5 h-5" />}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => {
            const partnerId = chat.participants.find((p: string) => p !== user?.id);
            const partner = partnerId ? usersCache[partnerId] : null;
            const lastMsg = chat.messages && chat.messages.length > 0 
              ? chat.messages[chat.messages.length - 1] 
              : { text: 'New Conversation', timestamp: Date.now() };

            return (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full p-4 flex items-start gap-3 transition-colors text-left border-b border-border-color/50 ${
                  activeChatId === chat.id ? 'bg-primary/5' : 'hover:bg-surface-2'
                }`}
              >
                <div className="relative shrink-0">
                  <img src={partner?.avatar} alt={partner?.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-medium truncate">{partner?.name}</h3>
                    <span className="text-xs text-text-muted shrink-0">
                      {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted truncate">{lastMsg.text}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-surface/30 ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
        {activeChatId ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-border-color flex items-center justify-between px-6 bg-surface">
              <div className="flex items-center gap-3">
                <button 
                  className="md:hidden text-text-muted hover:text-text-primary mr-2"
                  onClick={() => setActiveChatId('')}
                >
                  &larr; Back
                </button>
                <img src={otherUser?.avatar} alt={otherUser?.name} className="w-10 h-10 rounded-full" />
                <div>
                  <h3 className="font-semibold leading-tight">{otherUser?.name}</h3>
                  <p className="text-xs text-success">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-text-muted">
                <button className="hover:text-primary transition-colors"><Phone className="w-5 h-5" /></button>
                <button className="hover:text-primary transition-colors"><Video className="w-5 h-5" /></button>
                <button className="hover:text-primary transition-colors"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id} 
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      isMe 
                        ? 'bg-gradient-primary text-white rounded-tr-sm shadow-md' 
                        : 'bg-surface border border-border-color text-text-primary rounded-tl-sm shadow-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-text-muted'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-surface border-t border-border-color">
              <div className="flex items-end gap-2 max-w-4xl mx-auto">
                <div className="flex gap-1 pb-2">
                  <button onClick={handleAttachment} className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button onClick={handleAttachment} className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-colors hidden sm:block">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 relative">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type a message..."
                    className="w-full bg-surface-2 border border-border-color rounded-2xl px-4 py-3 min-h-[48px] max-h-[120px] resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-sm"
                    rows={1}
                  />
                </div>

                <div className="pb-1">
                  {messageText.trim() ? (
                    <button 
                      onClick={handleSend}
                      className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md"
                    >
                      <Send className="w-4 h-4 ml-1" />
                    </button>
                  ) : (
                    <button 
                      onMouseDown={() => setIsRecording(true)}
                      onMouseUp={() => setIsRecording(false)}
                      onMouseLeave={() => setIsRecording(false)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isRecording 
                          ? 'bg-error text-white scale-110 shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
                          : 'bg-surface-2 text-text-muted hover:text-primary hover:bg-primary/10'
                      }`}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
            <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10" />
            </div>
            <p className="font-medium">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
