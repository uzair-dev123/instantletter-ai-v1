// File: src/App.jsx

import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import letterTemplates from './data/letterTemplates.json';

export default function App() {
  const [category, setCategory] = useState('');
  const [subtype, setSubtype] = useState('');
  const [fields, setFields] = useState({});
  const [formData, setFormData] = useState({});
  const [tone, setTone] = useState('Formal');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const defaultCategory = Object.keys(letterTemplates)[0];
    const defaultSubtype = Object.keys(letterTemplates[defaultCategory])[0];
    setCategory(defaultCategory);
    setSubtype(defaultSubtype);
    setFields(letterTemplates[defaultCategory][defaultSubtype].fields);
    setFormData({});
  }, []);

  const handleCategoryChange = (newCategory) => {
    const firstSubtype = Object.keys(letterTemplates[newCategory])[0];
    setCategory(newCategory);
    setSubtype(firstSubtype);
    setFields(letterTemplates[newCategory][firstSubtype].fields);
    setFormData({});
  };

  const handleSubtypeChange = (newSubtype) => {
    setSubtype(newSubtype);
    setFields(letterTemplates[category][newSubtype].fields);
    setFormData({});
  };

  const buildPrompt = () => {
    const entries = Object.entries(fields).map(([key, fallback]) => {
      const value = formData[key] || fallback || '';
      return `${key}: ${value}`;
    });

    return `Write a ${tone.toLowerCase()} ${subtype} under the ${category} category. Use this information:\n\n${entries.join('\n')}\n\nPlease write a professional letter without using placeholders.`;
  };

  const generateLetter = async () => {
    setLoading(true);
    const prompt = buildPrompt();
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await res.json();
      setOutput(data?.reply ?? 'No response received');
    } catch (err) {
      setOutput('Error generating letter.');
    }
    setLoading(false);
  };

  const downloadAsPDF = () => {
    const doc = new jsPDF();
    doc.text(output, 10, 10);
    doc.save(`${subtype.replace(/\s+/g, '_')}_letter.pdf`);
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
    saveAs(blob, `${subtype.replace(/\s+/g, '_')}_letter.docx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">📄 InstantLetter.ai</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <select className="border p-2" value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
            {Object.keys(letterTemplates).map((cat) => <option key={cat}>{cat}</option>)}
          </select>
          <select className="border p-2" value={subtype} onChange={(e) => handleSubtypeChange(e.target.value)}>
            {Object.keys(letterTemplates[category] || {}).map((sub) => <option key={sub}>{sub}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4">
          {Object.keys(fields).map((field) => (
            <input
              key={field}
              className="border p-2 rounded"
              placeholder={field}
              value={formData[field] || ''}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            />
          ))}
        </div>

        <select className="border p-2 mb-4 w-full" value={tone} onChange={(e) => setTone(e.target.value)}>
          <option>Formal</option>
          <option>Friendly</option>
          <option>Apologetic</option>
          <option>Grateful</option>
          <option>Assertive</option>
        </select>

        <button className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded text-lg font-semibold" onClick={generateLetter} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Letter'}
        </button>

        {output && (
          <div className="mt-6 bg-gray-50 p-4 border rounded shadow">
            <textarea className="w-full border-none text-sm text-gray-800 resize-none min-h-[300px]" value={output} onChange={(e) => setOutput(e.target.value)} />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={downloadAsPDF} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm">.PDF</button>
              <button onClick={downloadAsDocx} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm">.DOCX</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
