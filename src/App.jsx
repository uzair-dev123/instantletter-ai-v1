""// instantletter_webapp updated version with form & chat assistant

import React, { useState } from 'react';

function App() {
  const [tab, setTab] = useState('form');
  const [formData, setFormData] = useState({
    name: '',
    recipient: '',
    subject: '',
    message: '',
    tone: 'Formal',
  });
  const [letterOutput, setLetterOutput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const generateLetter = async () => {
    const prompt = `Write a ${formData.tone} letter to ${formData.recipient} about "${formData.subject}". Message: ${formData.message}`;
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await res.json();
      setLetterOutput(data.reply || 'No response from AI');
    } catch (err) {
      setLetterOutput('❌ Error generating letter.');
    }
  };

  const handleChatSubmit = async () => {
    if (!userInput.trim()) return;
    const newMessage = { role: 'user', content: userInput };
    const updatedMessages = [...chatMessages, newMessage];
    setChatMessages(updatedMessages);
    setUserInput('');

    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();
      const reply = { role: 'assistant', content: data.reply || 'No reply' };
      setChatMessages([...updatedMessages, reply]);
    } catch {
      setChatMessages([...updatedMessages, { role: 'assistant', content: '❌ Error contacting AI.' }]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 text-gray-800">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">InstantLetter.ai</h1>

        <div className="flex justify-center mb-4 gap-2">
          <button onClick={() => setTab('form')} className={`px-4 py-2 rounded ${tab === 'form' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>📝 Form</button>
          <button onClick={() => setTab('chat')} className={`px-4 py-2 rounded ${tab === 'chat' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>💬 Chat</button>
        </div>

        {tab === 'form' ? (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-3">Fill the details</h2>
            <input className="w-full border p-2 mb-2" name="name" placeholder="Your Name" value={formData.name} onChange={handleInputChange} />
            <input className="w-full border p-2 mb-2" name="recipient" placeholder="Recipient" value={formData.recipient} onChange={handleInputChange} />
            <input className="w-full border p-2 mb-2" name="subject" placeholder="Subject" value={formData.subject} onChange={handleInputChange} />
            <textarea className="w-full border p-2 mb-2" name="message" placeholder="Message" rows={4} value={formData.message} onChange={handleInputChange} />
            <select className="w-full border p-2 mb-4" name="tone" value={formData.tone} onChange={handleInputChange}>
              <option>Formal</option>
              <option>Friendly</option>
              <option>Apologetic</option>
              <option>Grateful</option>
              <option>Assertive</option>
            </select>
            <button onClick={generateLetter} className="bg-blue-600 text-white px-4 py-2 rounded">Generate</button>
            {letterOutput && (
              <div className="mt-4 border p-4 bg-gray-100 rounded whitespace-pre-wrap">{letterOutput}</div>
            )}
          </div>
        ) : (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-3">Chat with AI</h2>
            <div className="h-64 overflow-y-auto border p-3 mb-3 bg-gray-50 rounded">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block px-3 py-2 rounded ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-200'}`}>
                    {msg.content}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="flex-1 border p-2 rounded" placeholder="Type a message..." value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()} />
              <button onClick={handleChatSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
""
