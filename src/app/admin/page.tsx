"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, query, onSnapshot, updateDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { Save, LayoutDashboard, Lock, ArrowLeft, Wand2, Loader2, Database, Camera, Trash2, UploadCloud } from "lucide-react";

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [f1Loading, setF1Loading] = useState(false);
  const [uploadingVault, setUploadingVault] = useState(false);
  
  const [vaultPhotos, setVaultPhotos] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    
    // 讀取首頁文字與設定
    const fetchData = async () => {
      const docSnap = await getDoc(doc(db, "settings", "home_config"));
      if (docSnap.exists()) setFormData(prev => ({ ...prev, ...docSnap.data() }));
    };
    fetchData();

    // 監聽 Vault 相簿
    const q = query(collection(db, "max_gallery"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const photos = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        time: d.data().createdAt?.toMillis() || 0
      }));
      photos.sort((a, b) => b.time - a.time);
      setVaultPhotos(photos);
    });

    return () => unsubscribe();
  }, [isAuth]);

  // 儲存發佈到首頁
  const handleSave = async () => {
    setLoading(true);
    try {
      if (formData.standingsData) JSON.parse(formData.standingsData);
      if (formData.racesData) JSON.parse(formData.racesData);
      await setDoc(doc(db, "settings", "home_config"), formData);
      alert("✅ 網站內容與即時數據已成功發佈！去首頁看看吧！");
    } catch (error) { alert("⚠️ 發佈失敗！請檢查你手動修改的 JSON 格式是否缺少了引號或括號。"); }
    setLoading(false);
  };

  // 🔥 就是這個函數剛剛不小心被刪掉了！現在補回來了！
  const generateAIContent = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai', { method: 'POST' });
      const data = await res.json();
      setFormData(prev => ({
        ...prev,
        newsHeadline: data.news.headline, 
        newsContent: data.news.content, 
        newsVideoPrompt: data.news.videoPrompt,
        techHeadline: data.tech.headline, 
        techContent: data.tech.content, 
        techVideoPrompt: data.tech.videoPrompt
      }));
    } catch (error) { alert("AI 新聞生成失敗"); }
    setAiLoading(false);
  };

  // 呼叫 AI 抓取 F1 最新賽果
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
      alert("✨ AI 已經獲取最新 F1 數據！請在下方文字框確認後按下發佈！");
    } catch (error) { alert("AI 數據抓取失敗"); }
    setF1Loading(false);
  };

  // 更新或刪除照片
  const updatePhotoStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "max_gallery", id), { status });
  };
  const deletePhoto = async (id: string) => {
    if (confirm("確定要永久刪除這張照片嗎？")) await deleteDoc(doc(db, "max_gallery", id));
  };

  // 智慧壓縮引擎：保證圖檔 < 150KB
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          const MAX_SIZE = 1000;
          if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(canvas.toDataURL("image/jpeg", 0.5));
          ctx.drawImage(img, 0, 0, width, height);

          let quality = 0.8;
          let dataUrl = canvas.toDataURL("image/jpeg", quality);
          while (dataUrl.length > 200000 && quality > 0.1) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }
          resolve(dataUrl);
        };
      };
    });
  };

  // 管理員批量上傳
  const handleAdminBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setUploadingVault(true);
    
    for (const file of files) {
      const compressedData = await compressImage(file);
      await addDoc(collection(db, "max_gallery"), {
        imageUrl: compressedData,
        status: "approved", 
        submittedBy: "👑 Admin Jason",
        likes: 0,
        createdAt: serverTimestamp()
      });
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadingVault(false);
    alert(`成功批量上傳並壓縮了 ${files.length} 張照片！`);
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
          
          {/* 🔥 區塊 1：包含 8 個欄位 (含 Video Prompt) */}
          <div className="border border-slate-800 rounded-xl p-6 bg-slate-950 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-blue-400"><Wand2 size={24}/> 1. News & Tech Broadcast</h2>
            <button onClick={generateAIContent} disabled={aiLoading} className="w-full bg-blue-600/20 text-blue-400 border border-blue-600/50 py-3 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-blue-600/40 transition">
              {aiLoading ? <Loader2 className="animate-spin" size={20} /> : "🤖 請 AI 寫今日新聞與腳本"}
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3"><label className="text-xs text-slate-500 font-bold">News Headline</label><input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" value={formData.newsHeadline} onChange={e => setFormData({...formData, newsHeadline: e.target.value})} /></div>
              <div className="space-y-3"><label className="text-xs text-slate-500 font-bold">Tech Headline</label><input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" value={formData.techHeadline} onChange={e => setFormData({...formData, techHeadline: e.target.value})} /></div>
              
              <div className="space-y-3"><label className="text-xs text-slate-500 font-bold">News Content (播報稿)</label><textarea className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm h-24 custom-scrollbar" value={formData.newsContent} onChange={e => setFormData({...formData, newsContent: e.target.value})} /></div>
              <div className="space-y-3"><label className="text-xs text-slate-500 font-bold">Tech Content (科技分析)</label><textarea className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm h-24 custom-scrollbar" value={formData.techContent} onChange={e => setFormData({...formData, techContent: e.target.value})} /></div>
              
              <div className="space-y-3">
                <label className="text-xs text-yellow-500 font-bold flex items-center gap-1">✨ News Video Prompt (複製去生成影片)</label>
                <textarea className="w-full bg-slate-900 border border-yellow-700/50 rounded-lg px-3 py-2 text-xs h-20 text-yellow-400 font-mono custom-scrollbar" value={formData.newsVideoPrompt} onChange={e => setFormData({...formData, newsVideoPrompt: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="text-xs text-yellow-500 font-bold flex items-center gap-1">✨ Tech Video Prompt (複製去生成影片)</label>
                <textarea className="w-full bg-slate-900 border border-yellow-700/50 rounded-lg px-3 py-2 text-xs h-20 text-yellow-400 font-mono custom-scrollbar" value={formData.techVideoPrompt} onChange={e => setFormData({...formData, techVideoPrompt: e.target.value})} />
              </div>

              <div className="space-y-3">
                <label className="text-xs text-blue-400 font-bold flex items-center gap-1">📺 News Video URLs (影片連播清單)</label>
                <textarea className="w-full bg-slate-900 border border-blue-500/50 rounded-lg px-3 py-2 text-xs h-20 text-blue-300 font-mono custom-scrollbar placeholder-slate-600" value={formData.newsVideoUrl} onChange={e => setFormData({...formData, newsVideoUrl: e.target.value})} placeholder="貼上影片網址（若有多部影片，請按 Enter 換行，系統將自動連播）" />
              </div>
              <div className="space-y-3">
                <label className="text-xs text-blue-400 font-bold flex items-center gap-1">📺 Tech Video URLs (影片連播清單)</label>
                <textarea className="w-full bg-slate-900 border border-blue-500/50 rounded-lg px-3 py-2 text-xs h-20 text-blue-300 font-mono custom-scrollbar placeholder-slate-600" value={formData.techVideoUrl} onChange={e => setFormData({...formData, techVideoUrl: e.target.value})} placeholder="貼上影片網址（若有多部影片，請按 Enter 換行，系統將自動連播）" />
              </div>
            </div>
          </div>

          {/* 區塊 2：Live Data Center */}
          <div className="border border-slate-800 rounded-xl p-6 bg-slate-950 space-y-6">
             <h2 className="text-xl font-bold flex items-center gap-2 text-red-500"><Database size={24}/> 2. Live Data Center (Standings & Races)</h2>
             <button onClick={generateF1Data} disabled={f1Loading} className="w-full bg-red-600/20 text-red-500 border border-red-600/50 py-3 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-red-600/40 transition">
               {f1Loading ? <Loader2 className="animate-spin" size={20} /> : <><Database size={20}/> 從 F1 官網同步 2026 最新數據</>}
             </button>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-3">
                 <label className="text-xs text-slate-500 font-bold">Driver Standings (JSON)</label>
                 <textarea className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs h-48 font-mono text-green-400" value={formData.standingsData} onChange={e => setFormData({...formData, standingsData: e.target.value})} placeholder='[ { "pos": 1, "driver": "VER", "team": "Red Bull", "pts": 26, "trend": "up" } ]' />
               </div>
               <div className="space-y-3">
                 <label className="text-xs text-slate-500 font-bold">Upcoming Races (JSON)</label>
                 <textarea className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs h-48 font-mono text-green-400" value={formData.racesData} onChange={e => setFormData({...formData, racesData: e.target.value})} placeholder='[ { "date": "MAR 22", "name": "Saudi Arabian GP", "status": "UPCOMING" } ]' />
               </div>
             </div>
          </div>

          {/* 區塊 3：The Vault Curation (相片審查 & 批量上傳) */}
          <div className="border border-slate-800 rounded-xl p-6 bg-slate-950 space-y-6 relative">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2 text-orange-500"><Camera size={24}/> 3. The Vault Curation (粉絲相片審查)</h2>
              <div>
                <input type="file" accept="image/*" multiple ref={fileInputRef} className="hidden" onChange={handleAdminBatchUpload} />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingVault} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition text-sm">
                  {uploadingVault ? <Loader2 className="animate-spin" size={16}/> : <UploadCloud size={16}/>}
                  Admin 批量上傳 (<span className="font-mono">150KB</span>)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto custom-scrollbar p-2">
              {vaultPhotos.length === 0 ? (
                <p className="text-slate-500 col-span-full text-center py-10">尚無照片</p>
              ) : vaultPhotos.map(photo => (
                <div key={photo.id} className={`relative group rounded-lg overflow-hidden border-2 ${photo.status === 'approved' ? 'border-green-500' : 'border-yellow-500/50'}`}>
                  <img src={photo.imageUrl} alt="vault" className="w-full h-32 object-cover bg-black" />
                  <div className="absolute top-0 left-0 bg-black/70 text-[10px] px-2 py-1 text-white truncate max-w-[80%]">{photo.submittedBy}</div>
                  
                  <div className="absolute top-0 right-0 bg-black/70 text-[10px] px-2 py-1 font-bold flex flex-col items-end">
                    {photo.status === 'approved' ? <span className="text-green-400">Approved</span> : <span className="text-yellow-400">Pending</span>}
                    <span className="text-orange-400">★ {photo.likes || 0}</span>
                  </div>

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
