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
        style: data.style || "Playful & Direct",
        tone: data.tone || "Casual",
        summary: data.summary || "Parsed your chat history successfully."
      });
      setStep(3);
    } catch (err) {
      setAnalysis({ style: "Casual", tone: "Friendly", summary: "Ready to simulate chat." });
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
      const botReply = data.reply || data.message || "No response";
      setMessages((prev) => [...prev, { sender: exName, text: botReply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: exName, text: "Connection error." }]);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 selection:bg-pink-500 selection:text-white">
      <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400">
            CHATBACK ⚡
          </h1>
          <p className="text-xs text-zinc-400 mt-1">AI Twin based on your WhatsApp chat</p>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Ex-Partner's Name
              </label>
              <input 
                type="text" 
                value={exName} 
                onChange={(e) => setExName(e.target.value)} 
                placeholder="Enter name (e.g. Priya)" 
                className="w-full bg-black border border-zinc-700 focus:border-pink-500 rounded-2xl px-4 py-3.5 text-sm outline-none transition text-zinc-100 placeholder-zinc-600"
              />
            </div>
            <button 
              disabled={!exName.trim()} 
              onClick={() => setStep(2)}
              className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3.5 rounded-2xl transition disabled:opacity-30 text-sm shadow-lg"
            >
              Next Step →
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="border border-zinc-700 hover:border-pink-500 rounded-2xl p-6 text-center transition bg-black/40 cursor-pointer group">
              <input 
                type="file" 
                accept=".txt" 
                id="file-upload"
                onChange={handleFileUpload} 
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                <div className="w-12 h-12 bg-zinc-800 text-pink-400 rounded-xl flex items-center justify-center mx-auto text-xl group-hover:scale-105 transition">
                  📁
                </div>
                <div className="text-xs font-medium text-zinc-200">
                  {chatText ? "Chat File Loaded! ✅" : "Upload WhatsApp .txt File"}
                </div>
              </label>
            </div>

            <button 
              disabled={!chatText || loading} 
              onClick={runAnalysis}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-2xl transition disabled:opacity-30 text-sm flex justify-center items-center gap-2 shadow-lg"
            >
              {loading ? 'Analyzing Vibe...' : 'Extract Vibe & Personality'}
            </button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-xs text-zinc-400">Style</span>
                <span className="text-xs font-bold text-pink-400">{analysis?.style}</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-xs text-zinc-400">Tone</span>
                <span className="text-xs font-bold text-cyan-400">{analysis?.tone}</span>
              </div>
              <p className="text-xs text-zinc-300 pt-1 leading-relaxed">{analysis?.summary}</p>
            </div>

            <button 
              onClick={() => setStep(4)}
              className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3.5 rounded-2xl transition text-sm shadow-lg"
            >
              Start Chatting 💬
            </button>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center font-bold text-sm">
                {exName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-xs font-bold">{exName}</h2>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
                </p>
              </div>
            </div>

            <div className="h-64 overflow-y-auto space-y-2.5 pr-1">
              {messages.length === 0 && (
                <div className="text-center text-xs text-zinc-500 mt-20 p-3 bg-black/30 rounded-xl border border-zinc-800">
                  Say hi to start the conversation!
                </div>
              )}
              {messages.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.sender === 'You' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.sender === 'You' 
                      ? 'bg-white text-black rounded-br-none font-medium' 
                      : 'bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-bl-none'
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
                placeholder={`Message ${exName}...`} 
                className="flex-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-xs outline-none focus:border-pink-500 transition text-zinc-100 placeholder-zinc-600"
              />
              <button 
                onClick={sendMessage}
                className="bg-white hover:bg-zinc-200 text-black px-4 py-3 rounded-xl text-xs font-bold transition shadow"
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
