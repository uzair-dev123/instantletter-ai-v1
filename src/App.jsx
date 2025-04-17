import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export default function App() {
  const [name, setName] = useState('');
  const [to, setTo] = useState('');
  const [type, setType] = useState('');
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
              content: `Write a ${tone.toLowerCase()} ${type} letter from ${name} to ${to}. Context: ${detail}`,
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
    saveAs(blob, `${type.replace(/\s+/g, '_')}_letter.txt`);
  };

  const downloadAsPDF = () => {
    const doc = new jsPDF();
    doc.text(output, 10, 10);
    doc.save(`${type.replace(/\s+/g, '_')}_letter.pdf`);
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
    saveAs(blob, `${type.replace(/\s+/g, '_')}_letter.docx`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-700">InstantLetter.ai</h1>

        <div className="space-y-3">
          <input className="w-full border p-2" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full border p-2" placeholder="Recipient Name" value={to} onChange={(e) => setTo(e.target.value)} />
          <input className="w-full border p-2" placeholder="Letter Type (e.g. sick leave)" value={type} onChange={(e) => setType(e.target.value)} />
          <textarea className="w-full border p-2" placeholder="Details..." rows="3" value={detail} onChange={(e) => setDetail(e.target.value)} />
          <select className="w-full border p-2" value={tone} onChange={(e) => setTone(e.target.value)}>
            <option>Formal</option>
            <option>Friendly</option>
            <option>Apologetic</option>
            <option>Grateful</option>
            <option>Assertive</option>
          </select>
          <button className="w-full bg-blue-600 text-white py-2 rounded" onClick={generateLetter} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Letter'}
          </button>
        </div>

        {output && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <textarea
              className="w-full border-none bg-transparent resize-none outline-none text-sm text-gray-800 whitespace-pre-wrap min-h-[300px]"
              value={output}
              onChange={(e) => setOutput(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2 flex-wrap">
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
