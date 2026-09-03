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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
            CHATBACK ⚡
          </h1>
          <p className="text-xs text-slate-400 mt-1">AI Twin modeled after your WhatsApp chat</p>
        </div>

        {/* STEP 1: Name */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-pink-400 uppercase tracking-wider mb-2">
                Partner's Name
              </label>
              <input 
                type="text" 
                value={exName} 
                onChange={(e) => setExName(e.target.value)} 
                placeholder="e.g. Priya" 
                className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-2xl px-4 py-3.5 text-sm outline-none transition shadow-inner"
              />
            </div>
            <button 
              disabled={!exName.trim()} 
              onClick={() => setStep(2)}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-40 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-pink-600/20 transition transform active:scale-95"
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 2: File Upload */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="border-2 border-dashed border-slate-700 hover:border-pink-500 rounded-2xl p-6 text-center transition bg-slate-950/50 group cursor-pointer">
              <input 
                type="file" 
                accept=".txt" 
                id="file-upload"
                onChange={handleFileUpload} 
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-3 block">
                <div className="w-14 h-14 bg-pink-500/10 text-pink-400 rounded-2xl flex items-center justify-center mx-auto text-2xl group-hover:scale-110 transition">
                  📁
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-200">
                    {chatText ? "File Uploaded Successfully! ✨" : "Upload WhatsApp Chat (.txt)"}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Export chat without media and upload here</p>
                </div>
              </label>
            </div>

            <button 
              disabled={!chatText || loading} 
              onClick={runAnalysis}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-40 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-pink-600/20 transition flex justify-center items-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Analyzing Vibe...
                </span>
              ) : 'Analyze Personality'}
            </button>
          </div>
        )}

        {/* STEP 3: Analysis Card */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-inner">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                <span className="text-xs text-slate-400">Texting Style</span>
                <span className="text-xs font-bold text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-full">{analysis?.style}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                <span className="text-xs text-slate-400">Vibe / Tone</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">{analysis?.tone}</span>
              </div>
              <p className="text-xs text-slate-300 pt-1 leading-relaxed">
                <span className="text-slate-500 font-medium">Summary: </span>{analysis?.summary}
              </p>
            </div>

            <button 
              onClick={() => setStep(4)}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-pink-600/20 transition transform active:scale-95"
            >
              Start Chatting with {exName} 💬
            </button>
          </div>
        )}

        {/* STEP 4: WhatsApp Style Chat Window */}
        {step === 4 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center font-bold text-sm shadow-md">
                {exName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold tracking-wide">{exName}</h2>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online
                </p>
              </div>
              <button 
                onClick={() => setStep(3)} 
                className="text-[10px] text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg transition"
              >
                Vibe Check
              </button>
            </div>

            {/* Chat Box */}
            <div className="h-72 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {messages.length === 0 && (
                <div className="text-center text-xs text-slate-500 mt-24 bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50">
                  🔒 Messages are AI-generated based on your chat history. Say hi!
                </div>
              )}
              {messages.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.sender === 'You' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-md ${
                    m.sender === 'You' 
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-br-none' 
                      : 'bg-slate-800 text-slate-100 border border-slate-700/60 rounded-bl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex gap-2 pt-2">
              <input 
                type="text"
                value={inputMsg} 
                onChange={(e) => setInputMsg(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Message ${exName}...`} 
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-xs outline-none focus:border-pink-500 transition shadow-inner"
              />
              <button 
                onClick={sendMessage}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 px-5 py-3 rounded-xl text-xs font-semibold transition shadow-md"
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
