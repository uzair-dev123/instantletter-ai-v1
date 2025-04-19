import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import templates from './data/letterTemplates.json';

export default function App() {
  const categories = [...new Set(templates.map(t => t.category))];
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedSubtype, setSelectedSubtype] = useState('');
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [tone, setTone] = useState('Formal');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const subtypes = templates.filter(t => t.category === selectedCategory).map(t => t.subcategory);
    setSelectedSubtype(subtypes[0]);
  }, [selectedCategory]);

  useEffect(() => {
    const template = templates.find(
      t => t.category === selectedCategory && t.subcategory === selectedSubtype
    );
    const templateFields = template?.fields || [];
    setFields(templateFields);
    const newFormData = {};
    templateFields.forEach(field => {
      newFormData[field.name] = '';
    });
    setFormData(newFormData);
  }, [selectedCategory, selectedSubtype]);

  const generateLetter = async () => {
    setLoading(true);
    try {
      const contentString = fields
        .map(field => `${field.name}: ${formData[field.name] || field.placeholder || ''}`)
        .join('\n');

      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Write a ${tone.toLowerCase()} ${selectedSubtype} letter with the following details:\n${contentString}`,
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

  const downloadAsPDF = () => {
    const doc = new jsPDF();
    doc.text(output, 10, 10);
    doc.save(`${selectedSubtype.replace(/\s+/g, '_')}_letter.pdf`);
  };

  const downloadAsDocx = async () => {
    const doc = new Document({
      sections: [{ children: [new Paragraph({ children: [new TextRun(output)] })] }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${selectedSubtype.replace(/\s+/g, '_')}_letter.docx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">📄 InstantLetter.ai</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select className="border p-2" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <select className="border p-2" value={selectedSubtype} onChange={(e) => setSelectedSubtype(e.target.value)}>
            {templates.filter(t => t.category === selectedCategory).map(t => (
              <option key={t.subcategory}>{t.subcategory}</option>
            ))}
          </select>

          {fields.map((field, idx) => (
            <input
              key={idx}
              className="border p-2 col-span-2"
              placeholder={field.placeholder || field.name}
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            />
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
