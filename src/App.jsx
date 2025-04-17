import React, { useState } from 'react';

export default function App() {
  const categories = {
    Education: ['Admission Letter', 'Recommendation Letter', 'Complaint Letter'],
    Employment: ['Job Application', 'Resignation Letter', 'Experience Certificate'],
    Visa: ['Sponsor Letter', 'Cover Letter']
  };

  const [selectedCategory, setSelectedCategory] = useState('Education');
  const [selectedSubtype, setSelectedSubtype] = useState(categories['Education'][0]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-4 text-center">Test Dropdown UI</h1>

        <div className="grid grid-cols-1 gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubtype(categories[e.target.value][0]);
            }}
            className="border p-2 rounded"
          >
            {Object.keys(categories).map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedSubtype}
            onChange={(e) => setSelectedSubtype(e.target.value)}
            className="border p-2 rounded"
          >
            {categories[selectedCategory].map((sub) => (
              <option key={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
