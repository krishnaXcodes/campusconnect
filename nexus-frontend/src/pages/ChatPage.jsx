import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiSend, FiImage, FiInfo, FiMessageSquare, FiSearch, FiChevronLeft, FiMoreVertical, FiSmile, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AvatarInitials from '../components/AvatarInitials';

export default function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeChat) {
      if (activeChat.id === 'new') {
        setMessages([]);
        return;
      }
      fetchMessages(activeChat.id);
      const interval = setInterval(() => fetchMessages(activeChat.id), 5000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  useEffect(() => {
    if (location.state?.newChat && conversations.length > 0) {
      const p = location.state.newChat;
      const existing = conversations.find(c => c.otherUserId === p.id);
      if (existing) {
        setActiveChat(existing);
      } else {
        setActiveChat({
          id: 'new',
          otherUserId: p.id,
          otherUsername: p.username,
          otherUserProfileImage: p.profileImage
        });
      }
      window.history.replaceState({}, document.title)
    } else if (location.state?.newChat && conversations.length === 0) {
       const p = location.state.newChat;
       setActiveChat({
          id: 'new',
          otherUserId: p.id,
          otherUsername: p.username,
          otherUserProfileImage: p.profileImage
        });
    }
  }, [location.state, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/api/chat/conversations');
      setConversations(res.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await api.get(`/api/chat/messages/${conversationId}?size=100`);
      setMessages(res.data.content);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      if (editingMessageId) {
        const res = await api.put(`/api/chat/messages/${editingMessageId}`, {
          content: newMessage
        });
        setMessages(messages.map(m => m.id === editingMessageId ? res.data : m));
        setEditingMessageId(null);
        setNewMessage('');
      } else {
        const res = await api.post('/api/chat/messages', {
          receiverId: activeChat.otherUserId,
          content: newMessage
        });
        setMessages([...messages, res.data]);
        setNewMessage('');
        if (activeChat.id === 'new') {
          fetchConversations();
          setActiveChat(prev => ({ ...prev, id: res.data.conversationId || 'new' }));
        } else {
          fetchConversations();
        }
      }
    } catch (error) {
      toast.error(editingMessageId ? 'Failed to edit message' : 'Failed to send message');
    }
  };

  const handleEditClick = (msg) => {
    setEditingMessageId(msg.id);
    setNewMessage(msg.content);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setNewMessage('');
  };

  const handleDeleteMessage = async (msgId) => {
    if (window.confirm('Are you sure you want to unsend this message?')) {
      try {
        await api.delete(`/api/chat/messages/${msgId}`);
        setMessages(messages.filter(m => m.id !== msgId));
        toast.success('Message unsent');
      } catch (error) {
        toast.error('Failed to unsend message');
      }
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.otherUsername.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-32px)] p-2 md:p-6 gap-6 max-w-7xl mx-auto w-full animate-fade-in-up">
      
      {/* Sidebar - Conversions List */}
      <div className={`w-full md:w-[380px] flex-shrink-0 flex flex-col clay-card rounded-2xl overflow-hidden ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-5 border-b border-white/5 bg-dark-900/40 backdrop-blur-md relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-aurora-cyan to-aurora-purple">Messages</h2>
            <Link to="/students" className="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center hover:bg-dark-700 transition-colors text-white">
              <FiMessageSquare size={16} />
            </Link>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-800/80 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-aurora-cyan transition-colors"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="overflow-y-auto flex-1 p-3 space-y-2 relative custom-scrollbar">
          {filteredConversations.map((conv) => (
            <div 
              key={conv.id} 
              onClick={() => setActiveChat(conv)}
              className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200 group ${activeChat?.id === conv.id ? 'bg-gradient-to-r from-aurora-cyan/10 to-aurora-blue/10 border border-aurora-cyan/20' : 'hover:bg-dark-800/60 border border-transparent'}`}
            >
              <div className="relative">
                {conv.otherUserProfileImage ? (
                  <img src={conv.otherUserProfileImage} alt={conv.otherUsername} className="w-12 h-12 rounded-full object-cover border-2 border-dark-900 shadow-md" />
                ) : (
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-dark-900 shadow-md">
                     <AvatarInitials name={conv.otherUsername} size="100%" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-900"></div>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-semibold text-[15px] truncate ${activeChat?.id === conv.id ? 'text-white' : 'text-dark-100 group-hover:text-white'}`}>{conv.otherUsername}</span>
                </div>
                <div className={`text-sm truncate ${activeChat?.id === conv.id ? 'text-aurora-cyan' : 'text-dark-400'}`}>
                  {conv.lastMessage || 'Start a conversation'}
                </div>
              </div>
            </div>
          ))}

          {conversations.length === 0 && !searchQuery && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-dark-900 relative">
              <div className="w-24 h-24 mb-6 rounded-full bg-aurora-cyan/10 flex items-center justify-center shadow-[0_0_40px_rgba(0,255,255,0.1)]">
                <FiMessageSquare className="text-4xl text-aurora-cyan" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">CampusConnect Messaging</h2>
              <p className="text-dark-300 text-sm">No conversations yet.</p>
              <Link to="/students" className="text-aurora-cyan text-sm mt-2 font-medium hover:underline">Find people to chat with</Link>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 h-full clay-card rounded-2xl overflow-hidden flex flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            {/* Active Chat Header */}
            <div className="p-4 border-b border-white/5 bg-dark-900/60 backdrop-blur-md flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveChat(null)}
                  className="md:hidden w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center text-white"
                >
                  <FiChevronLeft size={20} />
                </button>
                <Link to={`/profile/${activeChat.otherUsername}`} className="flex items-center gap-3 group">
                  {activeChat.otherUserProfileImage ? (
                    <img src={activeChat.otherUserProfileImage} alt={activeChat.otherUsername} className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-aurora-cyan transition-colors" />
                  ) : (
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 group-hover:border-aurora-cyan transition-colors">
                      <AvatarInitials name={activeChat.otherUsername} size="100%" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-white text-[15px] group-hover:text-aurora-cyan transition-colors">{activeChat.otherUsername}</h3>
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse"></span> Online
                    </span>
                  </div>
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 rounded-full hover:bg-dark-800 flex items-center justify-center text-dark-300 hover:text-white transition-colors">
                  <FiInfo size={20} />
                </button>
                <button className="w-10 h-10 rounded-full hover:bg-dark-800 flex items-center justify-center text-dark-300 hover:text-white transition-colors">
                  <FiMoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 bg-dark-950/30 custom-scrollbar relative">
              {/* Background Decoration */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-aurora-purple/5 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto mt-auto">
                <div className="text-center text-xs text-dark-500 font-medium bg-dark-800/50 py-1 px-3 rounded-full mx-auto w-max mb-4 backdrop-blur-sm border border-white/5">
                  This is the start of your conversation
                </div>
                
                {messages.map((msg, idx) => {
                  const isMe = msg.senderId === user.id;
                  const showAvatar = !isMe && (idx === messages.length - 1 || messages[idx + 1]?.senderId === user.id);
                  
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2 items-end`}>
                      {!isMe && (
                        <div className="w-8 shrink-0 flex justify-center">
                          {showAvatar && (
                            activeChat.otherUserProfileImage ? 
                              <img src={activeChat.otherUserProfileImage} className="w-8 h-8 rounded-full object-cover shadow-sm" alt="" /> :
                              <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm"><AvatarInitials name={activeChat.otherUsername} size="100%" /></div>
                          )}
                        </div>
                      )}
                      
                      <div className={`max-w-[75%] md:max-w-[65%] px-5 py-3 text-[15px] shadow-sm relative group ${isMe ? 'bg-gradient-to-br from-aurora-blue to-aurora-cyan text-white rounded-2xl rounded-br-sm' : 'bg-dark-800 border border-white/5 text-dark-100 rounded-2xl rounded-bl-sm'}`}>
                        {msg.content}
                        {msg.isEdited && <span className="text-[10px] opacity-70 ml-2">(edited)</span>}
                        <span className={`absolute bottom-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${isMe ? '-left-16 text-dark-400' : '-right-16 text-dark-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        {isMe && (
                          <div className="absolute top-1/2 -translate-y-1/2 -left-16 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditClick(msg)} className="p-1.5 text-dark-400 hover:text-aurora-cyan rounded-full hover:bg-dark-800 transition-colors" title="Edit">
                              <FiEdit2 size={12} />
                            </button>
                            <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 text-dark-400 hover:text-red-400 rounded-full hover:bg-dark-800 transition-colors" title="Unsend">
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-dark-900/60 backdrop-blur-md border-t border-white/5 flex flex-col gap-2">
              {editingMessageId && (
                <div className="max-w-4xl mx-auto w-full flex items-center justify-between bg-dark-800/50 px-4 py-2 rounded-xl border border-aurora-cyan/20">
                  <span className="text-sm text-aurora-cyan font-medium flex items-center gap-2">
                    <FiEdit2 size={14} /> Editing message...
                  </span>
                  <button onClick={cancelEdit} className="text-dark-400 hover:text-white transition-colors">
                    <FiX size={16} />
                  </button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto w-full flex items-end gap-3">
                <div className="flex-1 bg-dark-800 border border-white/10 rounded-3xl flex items-end px-2 py-2 focus-within:border-aurora-cyan transition-colors shadow-inner">
                  <button type="button" className="p-2.5 text-dark-400 hover:text-aurora-cyan transition-colors shrink-0">
                    <FiSmile size={20} />
                  </button>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent outline-none text-white placeholder-dark-500 py-2.5 px-2 max-h-32 resize-none custom-scrollbar text-[15px]"
                    rows="1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <button type="button" className="p-2.5 text-dark-400 hover:text-aurora-cyan transition-colors shrink-0">
                    <FiImage size={20} />
                  </button>
                </div>
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()} 
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all shadow-lg ${newMessage.trim() ? 'bg-gradient-to-r from-aurora-blue to-aurora-cyan text-white hover:scale-105' : 'bg-dark-800 text-dark-500 cursor-not-allowed'}`}
                >
                  <FiSend size={20} className="ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-dark-950/30 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>
            
            <div className="relative z-10 flex flex-col items-center max-w-sm">
              <div className="w-24 h-24 mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-aurora-purple via-aurora-cyan to-aurora-blue rounded-full opacity-20 blur-xl animate-pulse"></div>
                <div className="w-full h-full bg-dark-800 rounded-full border border-white/10 flex items-center justify-center shadow-2xl relative z-10">
                  <FiMessageSquare size={40} className="text-aurora-cyan" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-aurora-blue rounded-full border-4 border-dark-900 flex items-center justify-center z-20 shadow-lg">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
              </div>
              
              <h2 className="text-3xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-dark-300">
                CampusConnect Messaging
              </h2>
              <p className="text-dark-400 mb-8 leading-relaxed">
                Connect with peers, collaborate on projects, and build your campus network in real-time.
              </p>
              
              <Link to="/students" className="btn-aurora px-8 py-3 rounded-full font-bold shadow-lg shadow-aurora-cyan/20 hover:shadow-aurora-cyan/40 transition-all flex items-center gap-2">
                <FiSearch size={18} />
                Find Students
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
