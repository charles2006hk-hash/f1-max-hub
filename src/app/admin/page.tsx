"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Save, LayoutDashboard, Lock, ArrowLeft } from "lucide-react";

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    youtubeUrl: "",
    newsImage: "",
    newsTitle: "",
    newsDesc: ""
  });

  const login = () => {
    const pwd = prompt("Admin Password:");
    if (pwd === "33") setIsAuth(true);
    else alert("Access Denied");
  };

  useEffect(() => {
    if (!isAuth) return;
    const fetchData = async () => {
      const docSnap = await getDoc(doc(db, "settings", "home_config"));
      if (docSnap.exists()) setFormData(docSnap.data() as any);
    };
    fetchData();
  }, [isAuth]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "settings", "home_config"), formData);
      alert("✅ 網站內容已成功更新！去首頁看看吧！");
    } catch (error) {
      alert("更新失敗，請檢查 Firebase 權限。");
    }
    setLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-bold text-white italic">MAX33 CMS</h1>
        <button onClick={login} className="bg-red-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-500 transition">
          <Lock size={20} /> Login to Control Center
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-blue-500" size={32} />
            <h1 className="text-2xl md:text-3xl font-bold">Control Center</h1>
          </div>
          <a href="/" className="text-slate-400 hover:text-white flex items-center gap-1 text-sm"><ArrowLeft size={16}/> Back to Site</a>
        </div>

        <div className="bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-800 space-y-6">
          <h2 className="text-xl font-bold text-slate-300">Homepage Content Manager</h2>
          
          <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-lg text-sm text-blue-300">
            💡 **關於 AI 更新機制**：目前的 AI 戰報由 Vercel 伺服器每 1 小時自動在背景呼叫更新一次 (ISR Cache)，確保你的 API 免費額度不會因為訪客過多而爆掉。
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">YouTube Video Embed URL</label>
            <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
              value={formData.youtubeUrl} onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})} />
            <p className="text-xs text-slate-500 mt-1">需為 embed 格式，例如: https://www.youtube.com/embed/M-9v9y_L1NE</p>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">News Image URL</label>
            <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
              value={formData.newsImage} onChange={(e) => setFormData({...formData, newsImage: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">News Title</label>
            <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
              value={formData.newsTitle} onChange={(e) => setFormData({...formData, newsTitle: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">News Description</label>
            <textarea className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 outline-none h-24"
              value={formData.newsDesc} onChange={(e) => setFormData({...formData, newsDesc: e.target.value})} />
          </div>

          <button onClick={handleSave} disabled={loading} className="bg-blue-600 w-full py-3 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-blue-500 transition active:scale-95">
            {loading ? "Saving..." : <><Save size={20} /> Publish to Live Site</>}
          </button>
        </div>
      </div>
    </div>
  );
}