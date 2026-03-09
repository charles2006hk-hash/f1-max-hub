"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, query, orderBy, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { Save, LayoutDashboard, Lock, ArrowLeft, Wand2, Loader2, Database, Camera, Trash2 } from "lucide-react";

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [f1Loading, setF1Loading] = useState(false);
  
  // 🔥 儲存從 Firebase 抓取出來的 Vault 待審核照片
  const [vaultPhotos, setVaultPhotos] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    newsHeadline: "", newsContent: "", newsVideoPrompt: "", newsVideoUrl: "",
    techHeadline: "", techContent: "", techVideoPrompt: "", techVideoUrl: "",
    standingsData: "", racesData: "" 
  });

  const login = () => {
    const pwd = prompt("Admin Password:");
    if (pwd === "33") setIsAuth(true); else alert("Access Denied");
  };

  useEffect(() => {
    if (!isAuth) return;
    
    // 讀取首頁設定
    const fetchData = async () => {
      const docSnap = await getDoc(doc(db, "settings", "home_config"));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData(prev => ({ ...prev, ...data }));
      }
    };
    fetchData();

    // 🔥 監聽 max_gallery 獲取粉絲投稿的照片
    const q = query(collection(db, "max_gallery"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setVaultPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsubscribe();
  }, [isAuth]);

  const handleSave = async () => {
    setLoading(true);
    try {
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

  // 🔥 更新與刪除照片的邏輯
  const updatePhotoStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "max_gallery", id), { status });
  };
  
  const deletePhoto = async (id: string) => {
    if (confirm("確定要永久刪除這張照片嗎？")) {
      await deleteDoc(doc(db, "max_gallery", id));
    }
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

          {/* 區塊 2：Live Data Center 控制 */}
          <div className="border border-slate-800 rounded-xl p-6 bg-slate-950 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-red-500"><Database size={24}/> 2. Live Data Center (Standings & Races)</h2>
            <button onClick={generateF1Data} disabled={f1Loading} className="w-full bg-red-600/20 text-red-500 border border-red-600/50 py-3 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-red-600/40 transition">
              {f1Loading ? <Loader2 className="animate-spin" size={20} /> : <><Database size={20}/> 從 F1 官網同步 2026 最新數據</>}
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

          {/* 🔥 全新區塊 3：The Vault Curation (相片審查) */}
          <div className="border border-slate-800 rounded-xl p-6 bg-slate-950 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-orange-500"><Camera size={24}/> 3. The Vault Curation (粉絲相片審查)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto custom-scrollbar p-2">
              {vaultPhotos.length === 0 ? (
                <p className="text-slate-500 col-span-full text-center py-10">尚無粉絲投稿照片</p>
              ) : vaultPhotos.map(photo => (
                <div key={photo.id} className={`relative group rounded-lg overflow-hidden border-2 ${photo.status === 'approved' ? 'border-green-500' : 'border-yellow-500/50'}`}>
                  <img src={photo.imageUrl} alt="vault" className="w-full h-32 object-cover bg-black" />
                  <div className="absolute top-0 left-0 bg-black/70 text-[10px] px-2 py-1 text-white">{photo.submittedBy}</div>
                  
                  {/* 狀態標籤 */}
                  <div className="absolute top-0 right-0 bg-black/70 text-[10px] px-2 py-1 font-bold">
                    {photo.status === 'approved' ? <span className="text-green-400">Approved</span> : <span className="text-yellow-400">Pending</span>}
                  </div>

                  {/* 操作按鈕 */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 flex justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.status === 'pending' ? (
                      <button onClick={() => updatePhotoStatus(photo.id, 'approved')} className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs py-1 rounded">Approve</button>
                    ) : (
                      <button onClick={() => updatePhotoStatus(photo.id, 'pending')} className="flex-1 bg-slate-600 hover:bg-slate-500 text-white text-xs py-1 rounded">Hide</button>
                    )}
                    <button onClick={() => deletePhoto(photo.id)} className="bg-red-600 hover:bg-red-500 text-white px-2 rounded"><Trash2 size={12}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-green-600 to-emerald-600 w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:opacity-90 transition text-lg shadow-lg">
            {loading ? "Saving..." : <><Save size={24} /> 步驟 4：強制更新並發佈到首頁 (Publish)</>}
          </button>
        </div>
      </div>
    </div>
  );
}
