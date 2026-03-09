"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Save, LayoutDashboard, Lock, ArrowLeft, Wand2, Loader2 } from "lucide-react";

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    newsHeadline: "", newsContent: "", newsVideoPrompt: "", newsVideoUrl: "",
    techHeadline: "", techContent: "", techVideoPrompt: "", techVideoUrl: ""
  });

  const login = () => {
    const pwd = prompt("Admin Password:");
    if (pwd === "33") setIsAuth(true); else alert("Access Denied");
  };

  useEffect(() => {
    if (!isAuth) return;
    const fetchData = async () => {
      const docSnap = await getDoc(doc(db, "settings", "home_config"));
      if (docSnap.exists()) setFormData(prev => ({ ...prev, ...docSnap.data() }));
    };
    fetchData();
  }, [isAuth]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "settings", "home_config"), formData);
      alert("✅ 網站內容已成功發佈！去首頁看看吧！");
    } catch (error) { alert("更新失敗，請檢查 Firebase 權限。"); }
    setLoading(false);
  };

  // 🔥 呼叫 AI 幫你寫稿與產生影片 Prompt
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
      alert("✨ AI 已經幫你寫好文案與導演腳本了！請複製 Prompt 去生成影片，然後貼回 Video URL 欄位！");
    } catch (error) { alert("AI 生成失敗"); }
    setAiLoading(false);
  };

  if (!isAuth) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center"><button onClick={login} className="bg-red-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-500"><Lock size={20} /> Login</button></div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3"><LayoutDashboard className="text-blue-500" size={32} /><h1 className="text-3xl font-bold">AI Newsroom Control</h1></div>
          <a href="/" className="text-slate-400 hover:text-white flex items-center gap-1"><ArrowLeft size={16}/> Back to Site</a>
        </div>

        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-8">
          
          <button onClick={generateAIContent} disabled={aiLoading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:opacity-90 transition">
            {aiLoading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />} 
            {aiLoading ? "AI 正在撰寫今日新聞與腳本..." : "🤖 步驟 1：請 AI 自動生成今日新聞與影片 Prompt"}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 新聞區塊設定 */}
            <div className="space-y-4 p-5 bg-slate-950 rounded-xl border border-slate-800">
              <h3 className="font-bold text-red-500 border-b border-slate-800 pb-2">📰 Daily News Section</h3>
              <input type="text" placeholder="Headline" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" value={formData.newsHeadline} onChange={e => setFormData({...formData, newsHeadline: e.target.value})} />
              <textarea placeholder="Content" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm h-20" value={formData.newsContent} onChange={e => setFormData({...formData, newsContent: e.target.value})} />
              <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
                <label className="text-xs text-purple-400 font-bold mb-1 block">🎥 AI Video Prompt (複製去算圖)</label>
                <textarea className="w-full bg-transparent text-purple-200 text-xs h-16 outline-none resize-none" readOnly value={formData.newsVideoPrompt} />
              </div>
              <input type="text" placeholder="貼上算好的 .mp4 影片網址" className="w-full bg-slate-900 border border-blue-500 rounded-lg px-3 py-2 text-sm" value={formData.newsVideoUrl} onChange={e => setFormData({...formData, newsVideoUrl: e.target.value})} />
            </div>

            {/* 技術區塊設定 */}
            <div className="space-y-4 p-5 bg-slate-950 rounded-xl border border-slate-800">
              <h3 className="font-bold text-yellow-500 border-b border-slate-800 pb-2">⚙️ Tech Analysis Section</h3>
              <input type="text" placeholder="Headline" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" value={formData.techHeadline} onChange={e => setFormData({...formData, techHeadline: e.target.value})} />
              <textarea placeholder="Content" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm h-20" value={formData.techContent} onChange={e => setFormData({...formData, techContent: e.target.value})} />
              <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
                <label className="text-xs text-purple-400 font-bold mb-1 block">🎥 AI Video Prompt (複製去算圖)</label>
                <textarea className="w-full bg-transparent text-purple-200 text-xs h-16 outline-none resize-none" readOnly value={formData.techVideoPrompt} />
              </div>
              <input type="text" placeholder="貼上算好的 .mp4 影片網址" className="w-full bg-slate-900 border border-blue-500 rounded-lg px-3 py-2 text-sm" value={formData.techVideoUrl} onChange={e => setFormData({...formData, techVideoUrl: e.target.value})} />
            </div>
          </div>

          <button onClick={handleSave} disabled={loading} className="bg-blue-600 w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-500 transition">
            {loading ? "Saving..." : <><Save size={20} /> 步驟 2：發佈到公開網站 (Publish)</>}
          </button>
        </div>
      </div>
    </div>
  );
}
