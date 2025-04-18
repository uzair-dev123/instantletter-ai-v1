
// File: src/App.jsx

import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import './index.css';

export default function App() {
  const categories = {
    Education: {
      subtypes: ['Admission Letter', 'Recommendation Letter', 'Hostile Student Letter'],
      fields: ['Student Name', 'Institution Name', 'Purpose of Letter']
    },
    Employment: {
      subtypes: ['Job Application', 'Resignation Letter', 'Experience Certificate'],
      fields: ['Employee Name', 'Company Name', 'Job Title']
    },
    Visa: {
      subtypes: ['Sponsor Letter', 'Visa Explanation Letter'],
      fields: ['Applicant Name', 'Embassy/Consulate', 'Visa Type']
    },
    Legal: {
      subtypes: ['Authorization Letter', 'Affidavit'],
      fields: ['Your Name', 'Recipient Name', 'Legal Reason']
    },
    Banking: {
      subtypes: ['Loan Application', 'Bank Statement Request'],
      fields: ['Account Holder Name', 'Bank Name', 'Request Purpose']
    }
  };

  const [category, setCategory] = useState('Education');
  const [letterType, setLetterType] = useState(categories['Education'].subtypes[0]);
  const [tone, setTone] = useState('Formal');
  const [fields, setFields] = useState({});
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFieldChange = (label, value) => {
    setFields(prev => ({ ...prev, [label]: value }));
  };

  const generateLetter = async () => {
    setLoading(true);
    const context = Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join(', ');
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Write a ${tone.toLowerCase()} ${letterType} in the ${category} category. Context: ${context}`,
            },
          ],
        }),
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
    doc.save(`${letterType.replace(/\s+/g, '_')}_letter.pdf`);
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
    saveAs(blob, `${letterType.replace(/\s+/g, '_')}_letter.docx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">📄 InstantLetter.ai</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select className="border p-2" value={category} onChange={(e) => {
            const cat = e.target.value;
            setCategory(cat);
            setLetterType(categories[cat].subtypes[0]);
            setFields({});
          }}>
            {Object.keys(categories).map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <select className="border p-2" value={letterType} onChange={(e) => setLetterType(e.target.value)}>
            {categories[category].subtypes.map((sub) => (
              <option key={sub}>{sub}</option>
            ))}
          </select>

          {categories[category].fields.map(label => (
            <input key={label} className="border p-2 col-span-2" placeholder={label} value={fields[label] || ''} onChange={(e) => handleFieldChange(label, e.target.value)} />
          ))}

          <select className="border p-2 col-span-2" value={tone} onChange={(e) => setTone(e.target.value)}>
            <option>Formal</option>
            <option>Friendly</option>
            <option>Apologetic</option>
            <option>Grateful</option>
            <option>Assertive</option>
          </select>
        </div>

        <button className="mt-6 w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded text-lg font-semibold" onClick={generateLetter} disabled={loading}>
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
