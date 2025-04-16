
// instantletter_webapp main structure

// This is a complete React + Vite + Tailwind CSS based app that you can upload to Hostinger, Vercel, or Netlify.
// It includes a professional homepage, form generator tab, AI chatbot tab, letter preview, and downloadable results.

// Project Start - Main React Component (App.jsx)
import React, { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';

function App() {
  const [tab, setTab] = useState('form');
  const [formData, setFormData] = useState({
    name: '', recipient: '', category: '', letterType: '', reason: '', dateRange: '', tone: 'Formal', additionalNotes: ''
  });
  const [letterOutput, setLetterOutput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const generateLetter = () => {
    const { name, recipient, category, letterType, reason, dateRange, tone, additionalNotes } = formData;
    const letter = `
${new Date().toLocaleDateString()}

${recipient}

Subject: ${reason}

Dear ${recipient},

I am writing to you regarding ${reason}. My name is ${name}, and this letter falls under the ${category} category as a ${letterType}.

The important dates relevant to this request are: ${dateRange}.

${additionalNotes}

Thank you for your attention to this matter.

Sincerely,
${name}`;
    setLetterOutput(letter);
  };

  const downloadTextFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
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
      const assistantReply = { role: 'assistant', content: data.reply || 'Sorry, no reply received.' };
      setChatMessages([...updatedMessages, assistantReply]);
    } catch (err) {
      const errorReply = { role: 'assistant', content: '⚠️ Error reaching AI. Please try again later.' };
      setChatMessages([...updatedMessages, errorReply]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white text-gray-800 font-sans px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <SparklesIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-center text-blue-700 tracking-tight">InstantLetter.ai</h1>
        </div>

        <div className="flex justify-center mb-6 rounded-lg bg-white shadow-inner p-2 space-x-2">
          <button onClick={() => setTab('form')} className={\`px-4 py-2 rounded-lg transition text-sm font-medium \${tab === 'form' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}\`}>
            📝 Form Generator
          </button>
          <button onClick={() => setTab('chat')} className={\`px-4 py-2 rounded-lg transition text-sm font-medium \${tab === 'chat' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}\`}>
            💬 Chat Assistant
          </button>
        </div>

        {tab === 'form' ? (
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">📄 Fill in your letter details</h2>
            <form className="grid gap-4">
              {['name', 'recipient', 'category', 'letterType', 'reason', 'dateRange'].map((field) => (
                <input key={field} name={field} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} value={formData[field]} onChange={handleInputChange} className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200" />
              ))}
              <select name="tone" value={formData.tone} onChange={handleInputChange} className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200">
                {['Formal', 'Friendly', 'Apologetic', 'Assertive', 'Humble'].map((tone) => <option key={tone}>{tone}</option>)}
              </select>
              <textarea name="additionalNotes" placeholder="Additional Notes (Optional)" value={formData.additionalNotes} onChange={handleInputChange} className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm resize-none focus:ring-2 focus:ring-blue-200"></textarea>
              <button type="button" onClick={generateLetter} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition">✨ Generate Letter</button>
            </form>

            {letterOutput && (
              <div className="mt-6 p-5 bg-gray-50 border rounded-xl shadow-inner">
                <h3 className="text-lg font-semibold mb-2">📄 Letter Preview:</h3>
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 bg-white p-3 rounded-lg border overflow-auto max-h-72">{letterOutput}</pre>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => downloadTextFile(letterOutput, 'letter.txt', 'text/plain')} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">Download .TXT</button>
                  <button onClick={() => downloadTextFile(letterOutput, 'letter.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">Download .DOCX</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">💬 Chat with our AI Assistant</h2>
            <div className="h-64 overflow-y-auto bg-gray-50 border rounded-xl p-4 mb-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={\`mb-2 \${msg.role === 'user' ? 'text-right' : 'text-left'}\`}>
                  <span className={\`\${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-200'} inline-block px-4 py-2 rounded-lg max-w-xs text-sm shadow\`}>{msg.content}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()} placeholder="Type your request..." className="flex-1 border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200" />
              <button onClick={handleChatSubmit} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
