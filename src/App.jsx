import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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

async function getWeather(apiKey, location) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
  try {
    const response = await axios.get(apiUrl);
    const data = response.data;
    return `The current weather in ${data.name} is ${data.weather[0].description} with a temperature of ${data.main.temp}°C.`;
  } catch (error) {
    return `Unable to fetch weather data for ${location}. Please check the location and try again.`;
  }
}

function App() {
  const geminiApiKey = import.meta.env.VITE_API_GEMINI_KEY;
  const weatherApiKey = import.meta.env.VITE_API_WEATHER_KEY;
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const chatRef = useRef(null); // Create a ref to the chat container
  const inputRef = useRef(null); // Create a ref to the input field

  async function handleSend() {
    if (prompt.trim() === '') return; // Check if prompt is empty

    let result;
    if (prompt.toLowerCase().includes('weather')) {
      const location = prompt.split('in')[1].trim();
      result = await getWeather(weatherApiKey, location);
    } else {
      result = await getChatResponseFromGemini(geminiApiKey, prompt);
    }

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

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleSend();
        e.preventDefault(); // Prevent the default action
      }
    };

    if (inputRef.current) {
      inputRef.current.addEventListener('keypress', handleKeyPress);
    }

    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener('keypress', handleKeyPress);
      }
    };
  }, [prompt]);

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
            ref={inputRef} // Attach the ref to the input field
          />
          <button type="button" onClick={handleSend}>Send</button>
        </div>
      </div>
    </>
  );
}

export default App;
