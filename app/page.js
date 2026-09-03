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
    <main className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#131b2e] border border-[#1e293b] rounded-3xl p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-500 bg-clip-text text-transparent tracking-wide">
            CHATBACK ❤️
          </h1>
          <p className="text-[11px] text-slate-400 mt-1">Talk to AI modeled after your chat log</p>
        </div>

        {/* STEP 1: Name */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                EX-PARTNER'S NAME
              </label>
              <input 
                type="text" 
                value={exName} 
                onChange={(e) => setExName(e.target.value)} 
                placeholder="e.g. Priya or Rahul" 
                className="w-full bg-[#1a233a] border border-[#2a3754] focus:border-pink-500 rounded-xl px-4 py-3 text-xs outline-none transition text-slate-200 placeholder-slate-500"
              />
            </div>
            <button 
              disabled={!exName.trim()} 
              onClick={() => setStep(2)}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl shadow-lg shadow-pink-600/20 transition text-xs"
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 2: File Upload */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-[#2a3754] hover:border-pink-500 rounded-2xl p-5 text-center transition bg-[#1a233a]/50 cursor-pointer">
              <input 
                type="file" 
                accept=".txt" 
                id="file-upload"
                onChange={handleFileUpload} 
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                <div className="w-10 h-10 bg-pink-500/10 text-pink-400 rounded-full flex items-center justify-center mx-auto text-lg">
                  📁
                </div>
                <div className="text-xs font-semibold text-slate-300">
                  {chatText ? "File Uploaded! ✨" : "Upload WhatsApp Chat (.txt)"}
                </div>
              </label>
            </div>

            <button 
              disabled={!chatText || loading} 
              onClick={runAnalysis}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl shadow-lg shadow-pink-600/20 transition text-xs flex justify-center items-center gap-2"
            >
              {loading ? 'Analyzing...' : 'Analyze Chat History'}
            </button>
          </div>
        )}

        {/* STEP 3: Analysis Card */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-[#1a233a] border border-[#2a3754] rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-[#2a3754] pb-2">
                <span className="text-[11px] text-slate-400">Style</span>
                <span className="text-[11px] font-semibold text-pink-400">{analysis?.style}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#2a3754] pb-2">
                <span className="text-[11px] text-slate-400">Tone</span>
                <span className="text-[11px] font-semibold text-emerald-400">{analysis?.tone}</span>
              </div>
              <p className="text-[11px] text-slate-300 pt-1 leading-relaxed">{analysis?.summary}</p>
            </div>

            <button 
              onClick={() => setStep(4)}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-pink-600/20 transition text-xs"
            >
              Talk to {exName}
            </button>
          </div>
        )}

        {/* STEP 4: Chat Window */}
        {step === 4 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-[#2a3754]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center font-bold text-xs shadow">
                {exName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-xs font-bold">{exName}</h2>
                <p className="text-[9px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
                </p>
              </div>
            </div>

            <div className="h-60 overflow-y-auto space-y-2.5 pr-1">
              {messages.length === 0 && (
                <p className="text-center text-[11px] text-slate-500 mt-20">Send a message to start conversation...</p>
              )}
              {messages.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.sender === 'You' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs ${
                    m.sender === 'You' 
                      ? 'bg-pink-600 text-white rounded-br-none shadow' 
                      : 'bg-[#1a233a] text-slate-200 border border-[#2a3754] rounded-bl-none shadow'
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
                className="flex-1 bg-[#1a233a] border border-[#2a3754] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-pink-500 transition text-slate-200 placeholder-slate-500"
              />
              <button 
                onClick={sendMessage}
                className="bg-pink-600 hover:bg-pink-500 px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow"
              >
                Send
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
