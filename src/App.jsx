// File: src/App.jsx

import React, { useState } from 'react';

export default function App() {
  const categories = {
    Education: ['Admission Letter', 'Recommendation Letter', 'Complaint Letter', 'Letter for Hostile Student'],
    Employment: ['Job Application', 'Resignation Letter', 'Experience Certificate'],
    Visa: ['Sponsor Letter', 'Cover Letter'],
    Legal: ['Affidavit', 'No Objection Certificate', 'Authorization Letter'],
    Business: ['Proposal Letter', 'Complaint Letter', 'Thank You Letter'],
    Financial: ['Bank Statement Request', 'Loan Application', 'Salary Certificate']
  };

  const [selectedCategory, setSelectedCategory] = useState('Education');
  const [selectedSubtype, setSelectedSubtype] = useState(categories['Education'][0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 p-10">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-8">
          📝 InstantLetter.ai
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Select Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubtype(categories[e.target.value][0]);
              }}
              className="border p-2 w-full rounded"
            >
              {Object.keys(categories).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Select Letter Type</label>
            <select
              value={selectedSubtype}
              onChange={(e) => setSelectedSubtype(e.target.value)}
              className="border p-2 w-full rounded"
            >
              {categories[selectedCategory].map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 text-center text-gray-600">
          Selected: <strong>{selectedCategory}</strong> → <em>{selectedSubtype}</em>
        </div>
      </div>
    </div>
  );
}
