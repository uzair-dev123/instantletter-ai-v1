// File: src/App.jsx

import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export default function App() {
  const [name, setName] = useState('');
  const [to, setTo] = useState('');
  const [type, setType] = useState('Sick Leave');
  const [detail, setDetail] = useState('');
  const [tone, setTone] = useState('Formal');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'Leave Letters',
    'Job Letters',
    'School Letters',
    'Visa Letters',
    'Complaint Letters'
  ];

  const subtypes = {
    'Leave Letters': ['Sick Leave', 'Casual Leave', 'Maternity Leave'],
    'Job Letters': ['Job Application', 'Resignation', 'Experience Request'],
    'School Letters': ['Fee Concession', 'TC Request', 'Result Inquiry'],
    'Visa Letters': ['Cover Letter', 'Sponsor Letter'],
    'Complaint Letters': ['Product Complaint', 'Service Issue']
  };

  const [selectedCategory, setSelectedCategory] = useState('Leave Letters');
  const [selectedSubtype, setSelectedSubtype] = useState('Sick Leave');

  const generateLetter = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Write a ${tone.toLowerCase()} ${selectedSubtype} letter from ${name} to ${to}. Context: ${detail}`,
            },
          ],
        }),
      });
      const data = await res.json();
      setOutput(data.reply || 'No response received');
    } catch (err) {
      setOutput('Error generating letter.');
    }
    setLoading(false);
  };

  const downloadAsText = () => {
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${selectedSubtype.replace(/\s+/g, '_')}_letter.txt`);
  };

  const downloadAsPDF = () => {
    const doc = new jsPDF();
    doc.text(output, 10, 10);
    doc.save(`${selectedSubtype.replace(/\s+/g, '_')}_letter.pdf`);
  };

  const downloadAsDocx = async () => {
    const doc = new Document({
      sections: [
        {
          children: [new Paragraph({ children: [new TextRun(output)] })],
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${selectedSubtype.replace(/\s+/g, '_')}_letter.docx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-8">📄 InstantLetter.ai</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select className="border p-2" value={selectedCategory} onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedSubtype(subtypes[e.target.value][0]);
          }}>
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <select className="border p-2" value={selectedSubtype} onChange={(e) => setSelectedSubtype(e.target.value)}>
            {subtypes[selectedCategory].map((sub) => (
              <option key={sub}>{sub}</option>
            ))}
          </select>

          <input className="border p-2 col-span-2" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="border p-2 col-span-2" placeholder="Recipient Name" value={to} onChange={(e) => setTo(e.target.value)} />
          <textarea className="border p-2 col-span-2" placeholder="Details..." rows="4" value={detail} onChange={(e) => setDetail(e.target.value)} />
          <select className="border p-2 col-span-2" value={tone} onChange={(e) => setTone(e.target.value)}>
            <option>Formal</option>
            <option>Friendly</option>
            <option>Apologetic</option>
            <option>Grateful</option>
            <option>Assertive</option>
          </select>
        </div>

        <button className="mt-6 w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg text-lg font-semibold" onClick={generateLetter} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Letter'}
        </button>

        {output && (
          <div className="mt-6 p-4 bg-white border border-blue-300 rounded-lg shadow-md">
            <textarea
              className="w-full border-none resize-none outline-none text-sm text-gray-700 whitespace-pre-wrap min-h-[300px]"
              value={output}
              onChange={(e) => setOutput(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-3 flex-wrap">
              <button onClick={downloadAsText} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm">.TXT</button>
              <button onClick={downloadAsPDF} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded text-sm">.PDF</button>
              <button onClick={downloadAsDocx} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded text-sm">.DOCX</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
