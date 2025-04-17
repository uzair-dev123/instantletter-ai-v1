// File: src/App.jsx

import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

const fieldMap = {
  "Admission Request / Letter of Intent": ["Your Name", "University Name", "Program Name", "Motivation Statement"],
  "Job Application": ["Your Name", "Company Name", "Job Title", "Brief Skills Summary"],
  "Visa Cover Letter": ["Applicant Name", "Destination Country", "Purpose of Visit", "Travel Dates"],
  "Hostile Student Warning Letter": ["Student Name", "Issue Description", "Incident Date", "Requested Action"],
  "Resignation Letter": ["Your Name", "Company Name", "Position", "Last Working Day"],
  "Invitation Letter": ["Guest Name", "Event/Purpose", "Location", "Date/Time"],
};

export default function App() {
  const categories = {
    Education: [
      "Admission Request / Letter of Intent",
      "Recommendation Request",
      "Transcript Request",
      "Fee Waiver / Financial Aid Request",
      "Internship / Apprenticeship Request",
      "Leave of Absence from School",
      "Transfer Request",
      "Hostile Student Warning Letter",
      "Disciplinary Action Notice",
      "Appeal Against Disciplinary Action",
      "Request for Counseling Support"
    ],
    "Job & Employment": [
      "Job Application",
      "Resignation Letter",
      "Reference Letter Request",
      "Experience Certificate Request",
      "Salary Certificate",
      "Promotion Request",
      "Remote Work Request",
      "Absence / Apology Letter"
    ],
    "Immigration & Visa": [
      "Invitation Letter for Visa",
      "Sponsorship Letter",
      "Visa Cover Letter",
      "Affidavit of Support",
      "Proof of Accommodation",
      "Travel Itinerary Letter",
      "Visa Extension Request"
    ],
    "Business & Corporate": [
      "Client Proposal Letter",
      "Vendor Introduction Letter",
      "Meeting Request",
      "Quotation Request",
      "Price Negotiation Letter",
      "Payment Reminder",
      "Business Apology",
      "Request for Collaboration"
    ],
    "Complaint & Dispute": [
      "Bank Complaint",
      "Product Return / Refund",
      "Utility Company Complaint",
      "Insurance Claim",
      "Government Service Complaint",
      "Landlord/Tenant Dispute",
      "Customer Service Escalation"
    ],
    "Legal & Official": [
      "Cease and Desist Letter",
      "Authorization Letter",
      "Power of Attorney (Simple)",
      "Breach of Contract Notice",
      "Legal Info Request",
      "Witness Statement Request"
    ],
    "Personal & Social": [
      "Thank You Letter",
      "Apology Letter",
      "Invitation Letter",
      "Congratulations",
      "Condolences",
      "Neighbor Complaint",
      "Donation Request"
    ]
  };

  const tones = ["Formal", "Friendly", "Apologetic", "Grateful", "Assertive"];

  const [selectedCategory, setSelectedCategory] = useState(Object.keys(categories)[0]);
  const [selectedSubtype, setSelectedSubtype] = useState(categories[Object.keys(categories)[0]][0]);
  const [tone, setTone] = useState("Formal");
  const [inputs, setInputs] = useState({});
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (label, value) => {
    setInputs(prev => ({ ...prev, [label]: value }));
  };

  const generateLetter = async () => {
    setLoading(true);
    const context = Object.entries(inputs).map(([k, v]) => `${k}: ${v}`).join(', ');
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Write a ${tone.toLowerCase()} ${selectedSubtype} letter. Details: ${context}`,
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
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">📄 InstantLetter.ai</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <select className="border p-2" value={selectedCategory} onChange={(e) => {
            const category = e.target.value;
            setSelectedCategory(category);
            setSelectedSubtype(categories[category][0]);
            setInputs({});
          }}>
            {Object.keys(categories).map(cat => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <select className="border p-2" value={selectedSubtype} onChange={(e) => {
            setSelectedSubtype(e.target.value);
            setInputs({});
          }}>
            {categories[selectedCategory].map(sub => (
              <option key={sub}>{sub}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {fieldMap[selectedSubtype]?.map((field) => (
            <input
              key={field}
              className="border p-2"
              placeholder={field}
              value={inputs[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
            />
          ))}
          <select className="border p-2 col-span-2" value={tone} onChange={(e) => setTone(e.target.value)}>
            {tones.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <button className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg text-lg font-semibold" onClick={generateLetter} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Letter'}
        </button>

        {output && (
          <div className="mt-6 bg-gray-50 border border-blue-300 rounded p-4">
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
