'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import type { JSX } from 'react';


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
  text: "Hello and welcome! I’m Jaden. To make our conversation a bit more personal, could you please tell me your name?",
  sender: 'bot'
};

// Helper function to render links in messages
const renderMessageWithLinks = (text: string) => {
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)|(https?:\/\/[^\s]+)/g;
  const parts = text.split(linkRegex);
  const elements: (string | JSX.Element)[] = [];
  let i = 0;
  while (i < parts.length) {
    if (parts[i]) {
      elements.push(parts[i]);
    }
    const linkText = parts[i + 1];
    const markdownUrl = parts[i + 2];
    const rawUrl = parts[i + 3];

    if (markdownUrl) {
      elements.push(
        <a key={i} href={markdownUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">
          {linkText}
        </a>
      );
    } else if (rawUrl) {
      elements.push(
        <a key={i} href={rawUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">
          Click here to view/download
        </a>
      );
    }
    i += 4;
  }
  return elements;
};


export default function Home() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [conversationStage, setConversationStage] = useState<ConversationStage>('greeting');
  const [messages, setMessages] = useState<Message[]>([GREETING_MESSAGE]);
  
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleRestart = () => {
    setMessages([GREETING_MESSAGE]);
    setConversationStage('greeting');
    setInput('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };
    
    // Add user message to state immediately for a responsive UI
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    const currentInput = input;
    setInput('');

    if (conversationStage === 'greeting') {
      const refusalKeywords = ['no', 'nah', 'skip', 'n/a', 'anon', 'anonymous', 'i prefer not to say', 'i\'d rather not'];
      const isRefusal = refusalKeywords.includes(currentInput.trim().toLowerCase());

      let botReplyText = '';
      if (isRefusal) {
        botReplyText = "Okay, no problem. What can I tell you about my work and experience?";
      } else {
        const visitorName = currentInput;
        botReplyText = `It’s great to meet you, ${visitorName}! What would you like to know about me?`;
      }

      const followupMessage: Message = {
        id: Date.now() + 1,
        text: botReplyText,
        sender: 'bot',
      };
      setMessages(prevMessages => [...prevMessages, followupMessage]);
      setConversationStage('chatting');

    } else { // 'chatting' stage
      setIsLoading(true);

      // --- START: CRITICAL CHANGE FOR CONVERSATION HISTORY ---
      // Prepare the history for the backend API.
      // The backend expects a specific format: { role: 'user'|'model', parts: [{ text: '...' }] }
      const apiHistory = updatedMessages.slice(0, -1).map(msg => ({ // Exclude the user's latest message
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));
      // --- END: CRITICAL CHANGE ---

      try {
        const response = await fetch('https://chatbot-backend-production-cbeb.up.railway.app/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Send both the new message AND the history
          body: JSON.stringify({ 
            history: apiHistory, 
            message: currentInput 
          }),
        });

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
          
          <button 
            onClick={handleRestart} 
            className="ml-auto p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Restart conversation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>

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
                <p className="text-sm">{renderMessageWithLinks(message.text)}</p>
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
