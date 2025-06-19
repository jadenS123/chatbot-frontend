'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

// This defines the structure for a single message object
type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
};

export default function Home() {
  // Holds the array of all messages in the chat
  const [messages, setMessages] = useState<Message[]>([]);
  // Holds the text the user is currently typing in the input box
  const [input, setInput] = useState('');
  // A state to track if we are waiting for the bot's response
  const [isLoading, setIsLoading] = useState(false);

  // A ref to an empty div at the bottom of the chat that we can scroll to
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // This "effect" runs every single time the `messages` array changes.
  // Its job is to smoothly scroll the chat to the bottom.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // This function handles the logic when the user clicks "Send"
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
    setIsLoading(true);

    // This helper function creates a delay for a specified time in milliseconds
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      const fetchPromise = fetch('https://chatbot-backend-production-cbeb.up.railway.app/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentInput }),
      });

      // By waiting for both, we guarantee the loading indicator shows for at least 1 second.
      const [response] = await Promise.all([fetchPromise, delay(1000)]);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

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
        text: "Sorry, I'm having trouble connecting. Please try again.",
        sender: 'bot',
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl flex flex-col h-[90vh] border rounded-lg shadow-lg bg-white">
        
        <div className="flex-grow p-4 overflow-y-auto">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex items-start ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              } mb-4`}
            >
              {/* === IMPROVED HEADSHOT STYLING (Messages) === */}
              {message.sender === 'bot' && (
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                  <Image
                    src="/Headshot.jpg" // Using the correct filename with capitalization
                    alt="Chatbot headshot"
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start justify-start mb-4">
               {/* === IMPROVED HEADSHOT STYLING (Typing Indicator) === */}
               <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                  <Image
                    src="/Headshot.jpg" // Using the correct filename with capitalization
                    alt="Chatbot headshot"
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
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

        <div className="border-t border-gray-200"></div>

        <form onSubmit={handleSendMessage} className="p-4 flex items-center">
          <input
            type="text"
            className="flex-grow px-4 py-2 border rounded-full text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask me anything..."
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