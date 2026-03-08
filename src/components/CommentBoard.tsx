"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Trash2, ShieldCheck, Send, Reply, Loader2, ImagePlus, X, Star } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";

interface Comment {
  id: string;
  name: string;
  text: string;
  images?: string[];
  isAdmin: boolean;
  reply: string;
  isVoiceOfDay?: boolean;
}

export default function CommentBoard() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newName, setNewName] = useState("");
  const [newText, setNewText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminReplyId, setAdminReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const q = query(collection(db, "fan_messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Comment[] = [];
      snapshot.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() } as Comment));
      setComments(msgs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdminLogin = () => {
    if (isAdmin) { setIsAdmin(false); return; }
    const pass = prompt("Admin Password (Hint: Max's number):");
    if (pass === "33" || pass === "1") {
      setIsAdmin(true); alert("✅ Welcome back, Admin Jason!");
    } else {
      alert("❌ Incorrect Password");
    }
  };

  // 📸 影像壓縮引擎 (自動控制在 ~150KB 以下)
  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 800; // 限制最大寬高
          let { width, height } = img;
          if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.5)); // 0.5 壓縮率通常小於 100KB
        };
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (images.length + files.length > 6) {
      alert("Maximum 6 images allowed per post!"); return;
    }
    
    const compressedImages = await Promise.all(files.map(f => processImage(f)));
    setImages(prev => [...prev, ...compressedImages]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddComment = async () => {
    if (!newText.trim() && images.length === 0) return;
    try {
      await addDoc(collection(db, "fan_messages"), {
        name: newName.trim() || "Anonymous Fan",
        text: newText.trim(),
        images: images,
        isAdmin: isAdmin,
        reply: "",
        isVoiceOfDay: false,
        createdAt: serverTimestamp()
      });
      setNewText(""); setImages([]);
    } catch (error) {
      console.error(error); alert("Failed to post. Check database rules.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently delete this post?")) await deleteDoc(doc(db, "fan_messages", id));
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    await updateDoc(doc(db, "fan_messages", id), { reply: `Admin Jason: ${replyText}` });
    setAdminReplyId(null); setReplyText("");
  };

  // 管理員：設為今日之聲
  const toggleVoiceOfDay = async (id: string, currentStatus: boolean) => {
    // 先把其他留言的 VoiceOfDay 取消 (可選，這裡簡化為直接覆蓋)
    await updateDoc(doc(db, "fan_messages", id), { isVoiceOfDay: !currentStatus });
  };

  return (
    <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 shadow-2xl relative" id="paddock-feed">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <MessageSquare className="text-blue-500" size={28} />
          Paddock Feed
        </h2>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>Live
          </span>
          <button onClick={handleAdminLogin} className={`p-2 rounded-full ${isAdmin ? 'text-red-500' : 'text-slate-600'}`}><ShieldCheck size={20} /></button>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 mb-8 focus-within:border-blue-500/50">
        <input type="text" placeholder={isAdmin ? "Admin Jason" : "Your Name (Optional)"} className={`w-full bg-transparent border-b border-slate-800 pb-2 mb-3 focus:outline-none ${isAdmin ? 'text-red-400 font-bold' : 'text-white'}`} value={isAdmin ? "👑 Admin Jason" : newName} onChange={(e) => !isAdmin && setNewName(e.target.value)} disabled={isAdmin} />
        <textarea placeholder="Share your thoughts, stats, or drop emojis! 🔥🏎️..." className="w-full bg-transparent text-white resize-none h-20 focus:outline-none placeholder-slate-600" value={newText} onChange={(e) => setNewText(e.target.value)} />
        
        {/* Image Previews */}
        {images.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <div key={i} className="relative w-16 h-16 shrink-0">
                <img src={img} alt="preview" className="w-full h-full object-cover rounded-lg border border-slate-700" />
                <button onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"><X size={12}/></button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-2 border-t border-slate-800 pt-3">
          <div>
            <input type="file" accept="image/*" multiple ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-blue-400 flex items-center gap-2 text-sm transition">
              <ImagePlus size={18} /> Add Media ({images.length}/6)
            </button>
          </div>
          <button onClick={handleAddComment} className={`${isAdmin ? 'bg-red-600' : 'bg-blue-600'} text-white px-5 py-2 rounded-full font-bold flex items-center gap-2 active:scale-95 transition`}>
            {isAdmin ? "Post Update" : "Send"} <Send size={14} />
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-5 min-h-[200px]">
        {loading ? <div className="text-slate-500 text-center py-10"><Loader2 className="animate-spin inline mr-2"/> Loading Feed...</div> : comments.map((comment) => (
          <div key={comment.id} className={`bg-slate-950/50 p-5 rounded-xl border ${comment.isAdmin ? 'border-red-900/30 bg-red-950/10' : 'border-slate-800/50'} group`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className={`font-bold ${comment.isAdmin ? 'text-red-500' : 'text-blue-400'}`}>{comment.name}</span>
                {comment.isVoiceOfDay && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider border border-orange-500/30"><Star size={10} className="inline mr-1 mb-0.5"/>Voice of Day</span>}
              </div>
              
              {isAdmin && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-3">
                  <button onClick={() => toggleVoiceOfDay(comment.id, comment.isVoiceOfDay || false)} className="text-slate-500 hover:text-orange-400 tooltip" title="Set as Voice of Day"><Star size={16} /></button>
                  <button onClick={() => setAdminReplyId(comment.id)} className="text-slate-500 hover:text-blue-400"><Reply size={16} /></button>
                  <button onClick={() => handleDelete(comment.id)} className="text-slate-500 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              )}
            </div>
            
            <p className="text-gray-300 mb-3 whitespace-pre-wrap leading-relaxed">{comment.text}</p>
            
            {comment.images && comment.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {comment.images.map((img, i) => (
                  <img key={i} src={img} alt="post" className="w-full h-32 object-cover rounded-lg border border-slate-800 hover:opacity-90 transition cursor-pointer" onClick={() => window.open(img, '_blank')} />
                ))}
              </div>
            )}
            
            {comment.reply && (
              <div className="bg-blue-950/30 border-l-4 border-blue-500 p-3 rounded-r-lg mt-3 text-sm text-gray-300">
                <span className="text-blue-400 font-bold block mb-1">Official Reply</span>
                {comment.reply.replace("Admin Jason: ", "")}
              </div>
            )}

            {isAdmin && adminReplyId === comment.id && (
              <div className="mt-4 flex gap-2">
                <input type="text" placeholder="Admin reply..." className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-sm text-white focus:outline-none" value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                <button onClick={() => handleReply(comment.id)} className="bg-blue-600 text-white px-4 py-1 rounded-lg text-sm">Send</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}