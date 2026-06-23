import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiSend, FiImage, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
      // Polling for new messages could be added here
      const interval = setInterval(() => fetchMessages(activeChat.id), 5000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

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
      const res = await api.post('/api/chat/messages', {
        receiverId: activeChat.otherUserId,
        content: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
      fetchConversations(); // Update last message in sidebar
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-32px)] bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 md:mt-4 md:rounded-xl overflow-hidden">
      
      {/* Sidebar */}
      <div className={`w-full md:w-[350px] border-r border-dark-200 dark:border-dark-800 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-dark-200 dark:border-dark-800 flex items-center justify-between">
          <h2 className="text-xl font-bold">{user?.username}</h2>
          <button><FiSend size={20} className="rotate-45" /></button>
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.map((conv) => (
            <div 
              key={conv.id} 
              onClick={() => setActiveChat(conv)}
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors ${activeChat?.id === conv.id ? 'bg-dark-50 dark:bg-dark-800' : ''}`}
            >
              <img 
                src={conv.otherUserProfileImage || `https://ui-avatars.com/api/?name=${conv.otherUsername}&background=random`} 
                alt={conv.otherUsername}
                className="w-14 h-14 rounded-full object-cover"
              />
              <div className="flex-1 overflow-hidden">
                <div className="font-medium text-[15px]">{conv.otherUsername}</div>
                <div className="text-sm text-dark-500 truncate">{conv.lastMessage}</div>
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="p-8 text-center text-dark-500">
              No messages found. Start a conversation from a user's profile.
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-dark-200 dark:border-dark-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveChat(null)}
                  className="md:hidden text-blue-500 mr-2"
                >
                  Back
                </button>
                <Link to={`/profile/${activeChat.otherUsername}`}>
                  <img 
                    src={activeChat.otherUserProfileImage || `https://ui-avatars.com/api/?name=${activeChat.otherUsername}&background=random`} 
                    alt={activeChat.otherUsername}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </Link>
                <Link to={`/profile/${activeChat.otherUsername}`} className="font-semibold text-[15px]">
                  {activeChat.otherUsername}
                </Link>
              </div>
              <button><FiInfo size={24} /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-dark-50/50 dark:bg-dark-950/50">
              {messages.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-[15px] ${isMe ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-dark-100 dark:bg-dark-800 text-dark-900 dark:text-dark-100 rounded-bl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 border border-dark-200 dark:border-dark-700 rounded-full px-4 py-2 focus-within:border-dark-400 dark:focus-within:border-dark-500">
                <button type="button" className="text-dark-500 hover:text-dark-900 dark:hover:text-white"><FiImage size={24} /></button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message..."
                  className="flex-1 bg-transparent outline-none text-[15px]"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()} 
                  className="text-blue-500 font-semibold disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 rounded-full border-2 border-dark-900 dark:border-white flex items-center justify-center mb-4">
              <FiSend size={48} className="rotate-45 ml-2" />
            </div>
            <h2 className="text-2xl font-medium mb-2">Your Messages</h2>
            <p className="text-dark-500 mb-6">Send private photos and messages to a friend or group.</p>
            <button className="btn-primary">Send Message</button>
          </div>
        )}
      </div>

    </div>
  );
}
