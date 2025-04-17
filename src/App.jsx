import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export default function App() {
  const categories = {
    Education: ['Admission Letter', 'Recommendation Letter', 'Hostile Behavior Letter'],
    Employment: ['Job Application', 'Resignation Letter', 'Experience Letter'],
    Government: ['Visa Letter', 'Name Change Letter'],
    Banking: ['Loan Application', 'Bank Statement Request'],
    Personal: ['Apology Letter', 'Invitation Letter']
  };

  const [selectedCategory, setSelectedCategory] = useState('Education');
  const [selectedSubtype, setSelectedSubtype] = useState(categories['Education'][0]);
  const [name, setName] = useState('');
  const [to, setTo] = useState('');
  const [detail, setDetail] = useState('');
  const [tone, setTone] = useState('Formal');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

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
    } catch {
      setOutput('Error generating letter.');
    }
    setLoading(false);
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">InstantLetter.ai</h1>

        <div className="grid grid-cols-1 gap-4">
          <select className="border p-2" value={selectedCategory} onChange={(e) => {
            const category = e.target.value;
            setSelectedCategory(category);
            setSelectedSubtype(categories[category][0]);
          }}>
            {Object.keys(categories).map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <select className="border p-2" value={selectedSubtype} onChange={(e) => setSelectedSubtype(e.target.value)}>
            {categories[selectedCategory].map((sub) => (
              <option key={sub}>{sub}</option>
            ))}
          </select>

          <input className="border p-2" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="border p-2" placeholder="Recipient Name" value={to} onChange={(e) => setTo(e.target.value)} />
          <textarea className="border p-2" placeholder="Details..." rows="4" value={detail} onChange={(e) => setDetail(e.target.value)} />
          <select className="border p-2" value={tone} onChange={(e) => setTone(e.target.value)}>
            <option>Formal</option>
            <option>Friendly</option>
            <option>Apologetic</option>
            <option>Grateful</option>
            <option>Assertive</option>
          </select>

          <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded" onClick={generateLetter} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Letter'}
          </button>

          {output && (
            <div className="mt-4">
              <textarea
                className="w-full border p-2 text-sm text-gray-700 rounded resize-none min-h-[250px]"
                value={output}
                onChange={(e) => setOutput(e.target.value)}
              />
              <div className="flex gap-2 justify-end mt-2">
                <button onClick={downloadAsPDF} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm">.PDF</button>
                <button onClick={downloadAsDocx} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm">.DOCX</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
