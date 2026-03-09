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
    
    const fetchData = async () => {
      const docSnap = await getDoc(doc(db, "settings", "home_config"));
      if (docSnap.exists()) setFormData(prev => ({ ...prev, ...docSnap.data() }));
    };
    fetchData();

    // 🔥 修復：拿掉 orderBy 避免 Firebase 索引錯誤，改用 JS 本地排序
    const q = query(collection(db, "max_gallery"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const photos = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        time: d.data().createdAt?.toMillis() || 0
      }));
      // 本地端依時間排序 (最新的在前面)
      photos.sort((a, b) => b.time - a.time);
      setVaultPhotos(photos);
    });

    return () => unsubscribe();
  }, [isAuth]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (formData.standingsData) JSON.parse(formData.standingsData);
      if (formData.racesData) JSON.parse(formData.racesData);
      await setDoc(doc(db, "settings", "home_config"), formData);
      alert("✅ 發佈成功！");
    } catch (error) { alert("⚠️ JSON 格式有誤！"); }
    setLoading(false);
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
    } catch (error) {}
    setF1Loading(false);
  };

  const updatePhotoStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "max_gallery", id), { status });
  };
  
  const deletePhoto = async (id: string) => {
    if (confirm("確定要永久刪除這張照片嗎？")) await deleteDoc(doc(db, "max_gallery", id));
  };

  // 🔥 智慧壓縮引擎：保證圖檔 < 150KB
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
          // 150KB 的 Base64 約為 200,000 字元。若超過則持續調降品質
          while (dataUrl.length > 200000 && quality > 0.1) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }
          resolve(dataUrl);
        };
      };
    });
  };

  // 🔥 管理員批量上傳
  const handleAdminBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setUploadingVault(true);
    
    for (const file of files) {
      const compressedData = await compressImage(file);
      await addDoc(collection(db, "max_gallery"), {
        imageUrl: compressedData,
        status: "approved", // 管理員上傳直接顯示
        submittedBy: "👑 Admin Jason",
        likes: 0, // 初始化評分
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
          
          {/* ...區塊 1 & 區塊 2 (省略以維持版面，請使用你原本代碼中的 區塊1 與 區塊2) ... */}
          <div className="border border-slate-800 rounded-xl p-6 bg-slate-950 space-y-6">
             <h2 className="text-xl font-bold flex items-center gap-2 text-red-500"><Database size={24}/> 1 & 2. Data Centers</h2>
             <button onClick={generateF1Data} disabled={f1Loading} className="w-full bg-red-600/20 text-red-500 border border-red-600/50 py-3 rounded-lg font-bold flex items-center justify-center gap-2"><Database size={20}/> 從 F1 官網同步 2026 最新數據</button>
             <div className="grid grid-cols-2 gap-4">
               <textarea className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs h-32 font-mono text-green-400" value={formData.standingsData} onChange={e => setFormData({...formData, standingsData: e.target.value})} placeholder='Standings JSON'/>
               <textarea className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs h-32 font-mono text-green-400" value={formData.racesData} onChange={e => setFormData({...formData, racesData: e.target.value})} placeholder='Races JSON'/>
             </div>
          </div>

          {/* 🔥 全新區塊 3：The Vault Curation (相片審查 & 批量上傳) */}
          <div className="border border-slate-800 rounded-xl p-6 bg-slate-950 space-y-6 relative">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2 text-orange-500"><Camera size={24}/> 3. The Vault Curation (粉絲相片審查)</h2>
              
              {/* 🔥 管理員專屬：批量上傳按鈕 */}
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
                  
                  {/* 狀態標籤與按讚數 */}
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
