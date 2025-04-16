import React, { useState } from 'react'

export default function App() {
  const [name, setName] = useState('')
  const [to, setTo] = useState('')
  const [type, setType] = useState('')
  const [detail, setDetail] = useState('')
  const [tone, setTone] = useState('Formal')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const generateLetter = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Write a ${tone.toLowerCase()} ${type} letter from ${name} to ${to}. Context: ${detail}`
          }]
        })
      })
      const data = await res.json()
      setOutput(data.reply || 'No response received')
    } catch (err) {
      setOutput('Error generating letter.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-700">InstantLetter.ai</h1>

        <div className="space-y-3">
          <input className="w-full border p-2" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />
          <input className="w-full border p-2" placeholder="Recipient Name" value={to} onChange={e => setTo(e.target.value)} />
          <input className="w-full border p-2" placeholder="Letter Type (e.g. sick leave)" value={type} onChange={e => setType(e.target.value)} />
          <textarea className="w-full border p-2" placeholder="Details..." rows="3" value={detail} onChange={e => setDetail(e.target.value)} />
          <select className="w-full border p-2" value={tone} onChange={e => setTone(e.target.value)}>
            <option>Formal</option>
            <option>Friendly</option>
          </select>
          <button className="w-full bg-blue-600 text-white py-2 rounded" onClick={generateLetter} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Letter'}
          </button>
        </div>

        {output && (
          <div className="mt-6 p-4 bg-gray-50 border rounded whitespace-pre-wrap">
            {output}
          </div>
        )}
      </div>
    </div>
  )
}