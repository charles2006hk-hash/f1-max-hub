"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Save, LayoutDashboard, Lock, ArrowLeft, Wand2, Loader2, Database } from "lucide-react";

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [f1Loading, setF1Loading] = useState(false);
  
  const [formData, setFormData] = useState({
    newsHeadline: "", newsContent: "", newsVideoPrompt: "", newsVideoUrl: "",
    techHeadline: "", techContent: "", techVideoPrompt: "", techVideoUrl: "",
    standingsData: "", racesData: "" // 🔥 新增這兩個欄位儲存 JSON 字串
  });

  const login = () => {
    const pwd = prompt("Admin Password:");
    if (pwd === "33") setIsAuth(true); else alert("Access Denied");
  };

  useEffect(() => {
    if (!isAuth) return;
    const fetchData = async () => {
      const docSnap = await getDoc(doc(db, "settings", "home_config"));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData(prev => ({ ...prev, ...data }));
      }
    };
    fetchData();
  }, [isAuth]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // 驗證 JSON 格式是否正確
      if (formData.standingsData) JSON.parse(formData.standingsData);
      if (formData.racesData) JSON.parse(formData.racesData);
      
      await setDoc(doc(db, "settings", "home_config"), formData);
      alert("✅ 網站內容與即時數據已成功發佈！去首頁看看吧！");
    } catch (error) { 
      alert("⚠️ 發佈失敗！請檢查你手動修改的 JSON 格式是否缺少了引號或括號。"); 
    }
    setLoading(false);
  };

  const generateAIContent = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai', { method: 'POST' });
      const data = await res.json();
      setFormData(prev => ({
        ...prev,
        newsHeadline: data.news.headline, newsContent: data.news.content, newsVideoPrompt: data.news.videoPrompt,
        techHeadline: data.tech.headline, techContent: data.tech.content, techVideoPrompt: data.tech.videoPrompt
      }));
    } catch (error) { alert("AI 新聞生成失敗"); }
    setAiLoading(false);
  };

  // 🔥 呼叫 AI 抓取最新 F1 數據
  const generateF1Data = async () => {
    setF1Loading(true);
    try {
      const res = await fetch('/api/ai-f1', { method: 'POST' });
      const data = await res.json();
      setFormData(prev => ({
        ...prev,
        standingsData: JSON.stringify(data.standings, null, 2),
        racesData: JSON.stringify(data.races, null, 2)
      }));
      alert("✨ AI 已經獲取最新 F1 數據！請在下方文字框確認分數是否正確，你可以手動修改數字，確認無誤後按下發佈！");
    } catch (error) { alert("AI 數據抓取失敗"); }
    setF1Loading(false);
  };

  if (!isAuth) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center"><button onClick={login} className="bg-red-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-500"><Lock size={20} /> Login</button></div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 font-sans pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3"><LayoutDashboard className="text-blue-500" size={32} /><h1 className="text-3xl font-bold">Admin Control Center</h1></div>
          <a href="/" className="text-slate-400 hover:text-white flex items-center gap-1"><ArrowLeft size={16}/> Back to Site</a>
        </div>

        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-8">
          
          {/* 區塊 1：新聞與影片 */}
          <div className="border border-slate-800 rounded-xl p-6 bg-slate-950 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-blue-400"><Wand2 size={24}/> 1. News & Tech Broadcast</h2>
            <button onClick={generateAIContent} disabled={aiLoading} className="w-full bg-blue-600/20 text-blue-400 border border-blue-600/50 py-3 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-blue-600/40 transition">
              {aiLoading ? <Loader2 className="animate-spin" size={20} /> : "🤖 請 AI 寫今日新聞與腳本"}
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3"><label className="text-xs text-slate-500 font-bold">News Headline</label><input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" value={formData.newsHeadline} onChange={e => setFormData({...formData, newsHeadline: e.target.value})} /></div>
              <div className="space-y-3"><label className="text-xs text-slate-500 font-bold">Tech Headline</label><input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" value={formData.techHeadline} onChange={e => setFormData({...formData, techHeadline: e.target.value})} /></div>
              <div className="space-y-3"><label className="text-xs text-slate-500 font-bold">News Content</label><textarea className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm h-20" value={formData.newsContent} onChange={e => setFormData({...formData, newsContent: e.target.value})} /></div>
              <div className="space-y-3"><label className="text-xs text-slate-500 font-bold">Tech Content</label><textarea className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm h-20" value={formData.techContent} onChange={e => setFormData({...formData, techContent: e.target.value})} /></div>
              <div className="space-y-3"><label className="text-xs text-slate-500 font-bold">News Video URL</label><input type="text" className="w-full bg-slate-900 border border-blue-500 rounded-lg px-3 py-2 text-sm" value={formData.newsVideoUrl} onChange={e => setFormData({...formData, newsVideoUrl: e.target.value})} /></div>
              <div className="space-y-3"><label className="text-xs text-slate-500 font-bold">Tech Video URL</label><input type="text" className="w-full bg-slate-900 border border-blue-500 rounded-lg px-3 py-2 text-sm" value={formData.techVideoUrl} onChange={e => setFormData({...formData, techVideoUrl: e.target.value})} /></div>
            </div>
          </div>

          {/* 🔥 區塊 2：Live Data Center 控制 */}
          <div className="border border-slate-800 rounded-xl p-6 bg-slate-950 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-red-500"><Database size={24}/> 2. Live Data Center (Standings & Races)</h2>
            <button onClick={generateF1Data} disabled={f1Loading} className="w-full bg-red-600/20 text-red-500 border border-red-600/50 py-3 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-red-600/40 transition">
              {f1Loading ? <Loader2 className="animate-spin" size={20} /> : "📊 請 AI 抓取最新 F1 賽事資料"}
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs text-slate-500 font-bold">Driver Standings (JSON)</label>
                <textarea className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs h-48 font-mono text-green-400" value={formData.standingsData} onChange={e => setFormData({...formData, standingsData: e.target.value})} placeholder='[ { "pos": 1, "driver": "VER", "team": "Red Bull", "pts": 26, "trend": "up" } ]' />
                <p className="text-[10px] text-slate-500">你可以手動修改 pts 分數，修改完按發佈即刻生效。</p>
              </div>
              <div className="space-y-3">
                <label className="text-xs text-slate-500 font-bold">Upcoming Races (JSON)</label>
                <textarea className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs h-48 font-mono text-green-400" value={formData.racesData} onChange={e => setFormData({...formData, racesData: e.target.value})} placeholder='[ { "date": "MAR 22", "name": "Saudi Arabian GP", "status": "UPCOMING" } ]' />
              </div>
            </div>
          </div>

          <button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-green-600 to-emerald-600 w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:opacity-90 transition text-lg shadow-lg">
            {loading ? "Saving..." : <><Save size={24} /> 步驟 3：強制更新並發佈到首頁 (Publish)</>}
          </button>
        </div>
      </div>
    </div>
  );
}
