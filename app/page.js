'use client';
import { useState } from 'react';

export default function Home() {
  const [step, setStep] = useState(1);
  const [exName, setExName] = useState('');
  const [chatText, setChatText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => setChatText(evt.target.result);
      reader.readAsText(file);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatText, exName })
      });
      const data = await res.json();
      setAnalysis({
        style: data.style || "Casual & Direct",
        tone: data.tone || "Neutral",
        summary: data.summary || "Chat log parsed successfully."
      });
      setStep(3);
    } catch (err) {
      console.error(err);
      setAnalysis({ style: "Casual", tone: "Friendly", summary: "Proceeding with chat simulation." });
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMsg.trim()) return;
    const userMsg = inputMsg;
    setInputMsg('');
    setMessages((prev) => [...prev, { sender: 'You', text: userMsg }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, exName, chatText })
      });
      const data = await res.json();
      const botReply = data.reply || data.message || "No response received";
      setMessages((prev) => [...prev, { sender: exName, text: botReply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: exName, text: "Error getting response." }]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            CHATBACK ❤️
          </h1>
          <p className="text-xs text-slate-400 mt-1">Talk to AI modeled after your chat log</p>
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Ex-partner's Name
              </label>
              <input 
                type="text" 
                value={exName} 
                onChange={(e) => setExName(e.target.value)} 
                placeholder="e.g. Priya or Rahul" 
                className="w-full bg-slate-800 border border-slate-700 focus:border-pink-500 rounded-xl px-4 py-3 text-sm outline-none transition"
              />
            </div>
            <button 
              disabled={!exName.trim()} 
              onClick={() => setStep(2)}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-40 text-white font-medium py-3 rounded-xl shadow-lg transition"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="border-2 border-dashed border-slate-700 hover:border-pink-500 rounded-2xl p-6 text-center transition bg-slate-800/40">
              <input 
                type="file" 
                accept=".txt" 
                id="file-upload"
                onChange={handleFileUpload} 
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                <div className="w-12 h-12 bg-pink-500/10 text-pink-400 rounded-full flex items-center justify-center mx-auto text-xl">
                  📁
                </div>
                <div className="text-sm font-medium text-slate-300">
                  {chatText ? "File Uploaded Successfully!" : "Upload WhatsApp Export (.txt)"}
                </div>
              </label>
            </div>

            <button 
              disabled={!chatText || loading} 
              onClick={runAnalysis}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-40 text-white font-medium py-3 rounded-xl shadow-lg transition flex justify-center items-center gap-2"
            >
              {loading ? 'Analyzing Chat...' : 'Analyze Chat History'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="text-xs text-slate-400">Style</span>
                <span className="text-xs font-semibold text-pink-400">{analysis?.style}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="text-xs text-slate-400">Tone</span>
                <span className="text-xs font-semibold text-emerald-400">{analysis?.tone}</span>
              </div>
              <p className="text-xs text-slate-300 pt-1">{analysis?.summary}</p>
            </div>

            <button 
              onClick={() => setStep(4)}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-medium py-3 rounded-xl shadow-lg transition"
            >
              Talk to {exName}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center font-bold text-xs">
                {exName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-sm font-semibold">{exName}</h2>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
                </p>
              </div>
            </div>

            <div className="h-64 overflow-y-auto space-y-3 pr-1">
              {messages.length === 0 && (
                <p className="text-center text-xs text-slate-500 mt-20">Send a message to start conversation...</p>
              )}
              {messages.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.sender === 'You' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-xs ${
                    m.sender === 'You' 
                      ? 'bg-pink-600 text-white rounded-br-none' 
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input 
                type="text"
                value={inputMsg} 
                onChange={(e) => setInputMsg(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Type message to ${exName}...`} 
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs outline-none focus:border-pink-500 transition"
              />
              <button 
                onClick={sendMessage}
                className="bg-pink-600 hover:bg-pink-500 px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                Send
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
