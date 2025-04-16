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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white px-4 py-10 text-gray-800 font-sans">
      <div className="max-w-3xl mx-auto rounded-xl shadow-xl border border-gray-200 bg-white p-8">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-blue-700 tracking-tight">InstantLetter.ai</h1>

        <div className="flex justify-center mb-6 gap-3">
          <button onClick={() => setTab('form')} className={`px-5 py-2 text-sm font-medium rounded-full transition duration-200 ${tab === 'form' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 hover:bg-blue-100'}`}>📝 Form</button>
          <button onClick={() => setTab('chat')} className={`px-5 py-2 text-sm font-medium rounded-full transition duration-200 ${tab === 'chat' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 hover:bg-blue-100'}`}>💬 Chat</button>
        </div>

        {tab === 'form' ? (
          <div className="space-y-4">
            <div className="grid gap-3">
              <input className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300" name="name" placeholder="Your Name" value={formData.name} onChange={handleInputChange} />
              <input className="w-full border border-gray-300 p-3 rounded-md" name="recipient" placeholder="Recipient" value={formData.recipient} onChange={handleInputChange} />
              <input className="w-full border border-gray-300 p-3 rounded-md" name="subject" placeholder="Subject" value={formData.subject} onChange={handleInputChange} />
              <textarea className="w-full border border-gray-300 p-3 rounded-md" name="message" placeholder="Message" rows={4} value={formData.message} onChange={handleInputChange} />
              <select className="w-full border border-gray-300 p-3 rounded-md" name="tone" value={formData.tone} onChange={handleInputChange}>
                <option>Formal</option>
                <option>Friendly</option>
                <option>Apologetic</option>
                <option>Grateful</option>
                <option>Assertive</option>
              </select>
              <button onClick={generateLetter} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition duration-150">Generate Letter</button>
            </div>

            {letterOutput && (
              <div className="mt-6 p-5 bg-blue-50 border border-blue-100 rounded-lg whitespace-pre-wrap text-sm text-gray-700">
                {letterOutput}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-64 overflow-y-auto border border-gray-200 bg-gray-50 p-4 rounded-md">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block px-4 py-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-700'}`}>
                    {msg.content}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="flex-1 border border-gray-300 p-3 rounded-md" placeholder="Type your request..." value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()} />
              <button onClick={handleChatSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-md">Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
