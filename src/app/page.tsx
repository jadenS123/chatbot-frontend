'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

// This defines the structure for a single message object
type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
};

// A type to define the current stage of the conversation
type ConversationStage = 'greeting' | 'chatting';

// We define the default greeting message as a constant
const GREETING_MESSAGE: Message = {
  id: 1,
  text: "Hello and welcome! I’m Jaden’s AI assistant, here to help you learn about him. To make our conversation a bit more personal, could you please tell me your name?",
  sender: 'bot'
};


export default function Home() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- START: PERSISTENCE LOGIC ---

  // 1. LOAD conversationStage from localStorage on initial render
  const [conversationStage, setConversationStage] = useState<ConversationStage>(() => {
    if (typeof window !== 'undefined') {
      const savedStage = localStorage.getItem('conversation_stage') as ConversationStage | null;
      return savedStage || 'greeting';
    }
    return 'greeting';
  });

  // 2. LOAD messages from localStorage on initial render
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('chat_history');
      // If messages are found, parse them. Otherwise, return the default greeting.
      return savedMessages ? JSON.parse(savedMessages) : [GREETING_MESSAGE];
    }
    return [GREETING_MESSAGE];
  });

  // 3. SAVE conversationStage to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('conversation_stage', conversationStage);
  }, [conversationStage]);

  // 4. SAVE messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages]);

  // --- END: PERSISTENCE LOGIC ---


  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    const currentInput = input;
    setInput('');

    if (conversationStage === 'greeting') {
      const refusalKeywords = ['no', 'nah', 'skip', 'n/a', 'anon', 'anonymous', 'i prefer not to say', 'i\'d rather not'];
      const isRefusal = refusalKeywords.includes(currentInput.trim().toLowerCase());

      if (isRefusal) {
        const followupMessage: Message = {
          id: Date.now() + 1,
          text: "Okay, no problem. What would you like to know about Jaden?",
          sender: 'bot',
        };
        setMessages(prevMessages => [...prevMessages, followupMessage]);
        setConversationStage('chatting');
      } else {
        const visitorName = currentInput;
        const welcomeReply: Message = {
          id: Date.now() + 1,
          text: `It’s great to meet you, ${visitorName}! What would you like to know about Jaden?`,
          sender: 'bot',
        };
        setMessages(prevMessages => [...prevMessages, welcomeReply]);
        setConversationStage('chatting');
      }

    } else { // 'chatting' stage
      setIsLoading(true);

      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      try {
        const fetchPromise = fetch('https://chatbot-backend-production-cbeb.up.railway.app/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: currentInput }),
        });

        const [response] = await Promise.all([fetchPromise, delay(1000)]);

        if (!response.ok) { throw new Error('Network response was not ok'); }

        const data = await response.json();
        const botMessage: Message = {
          id: Date.now() + 1,
          text: data.reply,
          sender: 'bot',
        };
        setMessages(prevMessages => [...prevMessages, botMessage]);

      } catch (error) {
        console.error("Failed to fetch response:", error);
        const errorMessage: Message = {
          id: Date.now() + 1,
          text: "Sorry, I’m having trouble connecting. Please try again.",
          sender: 'bot',
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4">
      <div className="w-full max-w-2xl flex flex-col h-[90vh] border rounded-lg shadow-lg bg-white">
        
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
            <Image src="/Headshot.jpg" alt="Chatbot headshot" width={48} height={48} className="object-cover w-full h-full" />
          </div>
          <div className="flex-grow">
            <h2 className="font-bold text-lg text-gray-800">Jaden’s AI Assistant</h2>
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
        </div>

        <div className="flex-grow p-4 overflow-y-auto">
          {messages.map(message => (
            <div key={message.id} className={`flex items-start ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              {message.sender === 'bot' && (
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                  <Image src="/Headshot.jpg" alt="Chatbot headshot" width={40} height={40} className="object-cover w-full h-full" />
                </div>
              )}
              <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start justify-start mb-4">
               <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                  <Image src="/Headshot.jpg" alt="Chatbot headshot" width={40} height={40} className="object-cover w-full h-full" />
                </div>
              <div className="bg-gray-200 text-gray-800 rounded-2xl px-4 py-2 flex items-center">
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 flex items-center border-t border-gray-200">
          <input
            type="text"
            className="flex-grow px-4 py-2 border rounded-full text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={conversationStage === 'greeting' ? "Please enter your name..." : "Ask me anything..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="ml-4 px-6 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}