import React, { useState, useEffect, useRef } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon,
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentStatus, setAgentStatus] = useState('online'); // online, away, offline
  const [agentInfo, setAgentInfo] = useState({
    name: 'Sarah',
    avatar: '/images/agent-avatar.jpg',
    status: 'online'
  });
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: 'agent',
          content: `Hi there! I'm ${agentInfo.name}, your personal shopping assistant. How can I help you today?`,
          timestamp: new Date(),
          agent: agentInfo
        }
      ]);
    }
  }, [isOpen, messages.length, agentInfo]);

  // Simulate agent typing
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        setIsTyping(false);
        // Add agent response
        const responses = [
          "I'm looking into that for you right now!",
          "That's a great question. Let me check our inventory.",
          "I can definitely help you with that!",
          "Thanks for reaching out. I'll get back to you shortly.",
          "I understand your concern. Let me assist you with that."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'agent',
          content: randomResponse,
          timestamp: new Date(),
          agent: agentInfo
        }]);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isTyping, agentInfo]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickResponse = (response) => {
    setInputMessage(response);
    handleSendMessage();
  };

  const quickResponses = [
    "I need help with my order",
    "What's your return policy?",
    "Do you have this in stock?",
    "I want to track my package"
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition-all duration-200 hover:scale-110"
        aria-label="Open live chat"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-orange-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={agentInfo.avatar}
                    alt={agentInfo.name}
                    className="w-10 h-10 rounded-full border-2 border-white"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/40x40/FF6600/FFFFFF?text=S';
                    }}
                  />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    agentStatus === 'online' ? 'bg-green-400' :
                    agentStatus === 'away' ? 'bg-yellow-400' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div>
                  <h3 className="font-semibold">{agentInfo.name}</h3>
                  <p className="text-sm opacity-90">
                    {agentStatus === 'online' ? 'Online' :
                     agentStatus === 'away' ? 'Away' : 'Offline'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-orange-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Responses */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Quick responses:</p>
              <div className="flex flex-wrap gap-2">
                {quickResponses.map((response, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickResponse(response)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                  >
                    {response}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Response time: ~2 min</span>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                  <PhoneIcon className="w-3 h-3" />
                  Call
                </button>
                <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                  <EnvelopeIcon className="w-3 h-3" />
                  Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveChat;
