import { useState, useEffect, useRef } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function getChatResponseFromGemini(apiKey, prompt) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

function App() {
  const apiKey = import.meta.env.VITE_API_GEMINI_KEY;
  console.log('API Key:', apiKey); // Remove this after verifying the API key
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const chatRef = useRef(null); // Create a ref to the chat container

  async function handleSend() {
    const result = await getChatResponseFromGemini(apiKey, prompt);
    setResponse(result);
    setChatHistory((prevHistory) => [
      ...prevHistory,
      { user: prompt, bot: result },
    ]);
    setPrompt(''); // Clear the input field
  }

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight; // Scroll to the bottom
    }
  }, [chatHistory]);

  return (
    <>
      <h1 className="heading">AI Chatbot</h1>
      <div className="chatbot_container">
        <div className="chatbot_response" ref={chatRef}>
          <p>Hi, how can I help you?</p>
          {chatHistory.map((chat, index) => (
            <div key={index}>
              <p className="user_msg"><strong>You:</strong> {chat.user}</p>
              <p className="bot_msg"><strong>Chatbot:</strong> {chat.bot}</p>
            </div>
          ))}
        </div>
        <div className="chatbot_input">
          <input
            type="text"
            name="input"
            placeholder="Enter your question"
            className="input"
            value={prompt}  // Set the input value to the prompt state
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button type="button" onClick={handleSend}>Send</button>
        </div>
      </div>
    </>
  );
}

export default App;
