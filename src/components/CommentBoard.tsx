"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Trash2, ShieldCheck, Send, Reply, Loader2, ImagePlus, X, Star, Smile, ThumbsUp, Type } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc, increment } from "firebase/firestore";
import EmojiPicker, { Theme } from 'emoji-picker-react';
// 🔥 引入 Lightbox
import Lightbox from "@/components/Lightbox";

interface Comment {
  id: string; name: string; text: string; images?: string[]; isAdmin: boolean; reply: string; isVoiceOfDay?: boolean; likes: number;
}

export default function CommentBoard() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newName, setNewName] = useState("");
  const [newText, setNewText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminReplyId, setAdminReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // 🔥 Lightbox 狀態
  const [lightboxState, setLightboxState] = useState<{ isOpen: boolean; currentImages: string[]; currentIndex: number }>({
    isOpen: false, currentImages: [], currentIndex: 0
  });

  useEffect(() => {
    const q = query(collection(db, "fan_messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Comment[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({ id: doc.id, ...data, likes: data.likes || 0 } as Comment);
      });
      setComments(msgs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdminLogin = () => {
    if (isAdmin) { setIsAdmin(false); return; }
    const pass = prompt("Admin Password:");
    if (pass === "33" || pass === "1") { setIsAdmin(true); alert("👑 Admin Jason, Paddock Feed unlocked!"); }
    else { alert("❌ Correct Password"); }
  };

  const onEmojiClick = (emojiObject: any) => {
    setNewText(prev => prev + emojiObject.emoji);
    setShowEmoji(false);
  };

  // 📸 進階影像引擎 (Meme 模式)
  const processImage = (file: File, overlayText: string): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 800;
          let { width, height } = img;
          if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(canvas.toDataURL("image/jpeg", 0.5));
          ctx.drawImage(img, 0, 0, width, height);

          if (overlayText) {
            ctx.font = `bold ${width * 0.09}px Impact, sans-serif`;
            ctx.textAlign = "center"; ctx.textBaseline = "bottom";
            ctx.lineWidth = width * 0.015; ctx.strokeStyle = "black";
            ctx.strokeText(overlayText.toUpperCase(), width / 2, height - 20);
            ctx.fillStyle = "white";
            ctx.fillText(overlayText.toUpperCase(), width / 2, height - 20);
          }
          resolve(canvas.toDataURL("image/jpeg", 0.5));
        };
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (images.length + files.length > 6) { alert("Maximum 6 images!"); return; }
    const overlayText = prompt("Do you want to add Meme text on these images? (Leave blank for none)") || "";
    const compressedImages = await Promise.all(files.map(f => processImage(f, overlayText)));
    setImages(prev => [...prev, ...compressedImages]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

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
        likes: 0,
        createdAt: serverTimestamp()
      });
      setNewText(""); setNewName(""); setImages([]); setShowEmoji(false);
    } catch (error) { console.error(error); alert("Failed to post."); }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently delete this post?")) await deleteDoc(doc(db, "fan_messages", id));
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    await updateDoc(doc(db, "fan_messages", id), { reply: `Admin Jason: ${replyText}` });
    setAdminReplyId(null); setReplyText("");
  };

  const toggleVoiceOfDay = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "fan_messages", id), { isVoiceOfDay: !currentStatus });
  };

  // 🔥 高階功能：原子級點讚 (Atomic Increment)
  const handleLike = async (id: string) => {
    // 檢查瀏覽器記憶，防止重複點讚
    const hasLiked = localStorage.getItem(`max33_liked_${id}`);
    if (hasLiked) { alert("Simply Lovely! You have already liked this post."); return; }
    
    //Firestore 原子操作
    await updateDoc(doc(db, "fan_messages", id), { likes: increment(1) });
    localStorage.setItem(`max33_liked_${id}`, "true"); // 記憶點讚狀態
  };

  // 🔥 打開 Lightbox
  const openLightbox = (commentImages: string[], index: number) => {
    setLightboxState({ isOpen: true, currentImages: commentImages, currentIndex: index });
  };

  return (
    <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 shadow-2xl relative" id="paddock-feed">
      {/* 導航列 */}
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

      {/* 輸入區塊 */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 mb-8 focus-within:border-blue-500/50 relative">
        <input type="text" placeholder={isAdmin ? "👑 Admin Jason" : "Your Name (Optional)"} className={`w-full bg-transparent border-b border-slate-800 pb-2 mb-3 focus:outline-none ${isAdmin ? 'text-red-400 font-bold' : 'text-white'}`} value={isAdmin ? "👑 Admin Jason" : newName} onChange={(e) => !isAdmin && setNewName(e.target.value)} disabled={isAdmin} />
        <textarea placeholder="Share your thoughts, stats, or drop emojis! 🔥🏎️..." className="w-full bg-transparent text-white resize-none h-20 focus:outline-none placeholder-slate-600" value={newText} onChange={(e) => setNewText(e.target.value)} />
        
        {showEmoji && (
          <div className="absolute z-50 bottom-16 left-5 shadow-2xl">
            <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.DARK} />
          </div>
        )}

        {images.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2 custom-scrollbar">
            {images.map((img, i) => (
              <div key={i} className="relative w-16 h-16 shrink-0 group">
                <img src={img} alt="preview" className="w-full h-full object-cover rounded-lg border border-slate-700" />
                <button onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"><X size={12}/></button>
              </div>
            ))}
          </div>
        )}

        {/* 🔥 以下是針對 iPhone 優化過觸控熱區的底部按鈕列 */}
        <div className="flex justify-between items-center mt-3 border-t border-slate-800 pt-4">
          <div className="flex gap-3 md:gap-4">
            <button onClick={() => setShowEmoji(!showEmoji)} className="text-slate-400 hover:text-yellow-400 flex items-center gap-1.5 text-xs md:text-sm transition bg-slate-900 md:bg-transparent px-3 py-2 md:px-0 md:py-0 rounded-lg">
              <Smile size={18} /> <span className="hidden md:inline">Emoji</span>
            </button>
            <input type="file" accept="image/*" multiple ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-blue-400 flex items-center gap-1.5 text-xs md:text-sm transition bg-slate-900 md:bg-transparent px-3 py-2 md:px-0 md:py-0 rounded-lg">
              <ImagePlus size={18} /> Media <span className="text-[10px] bg-slate-800 px-1.5 rounded">{images.length}/6</span>
            </button>
          </div>
          <button onClick={handleAddComment} className={`${isAdmin ? 'bg-red-600' : 'bg-blue-600'} text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 active:scale-95 transition text-sm shadow-lg shadow-blue-900/20`}>
            {isAdmin ? "Post Update" : "Send"} <Send size={16} />
          </button>
        </div>
      </div>

      {/* 留言列表 */}
      <div className="space-y-5 min-h-[200px]">
        {loading ? <div className="text-slate-500 text-center py-10"><Loader2 className="animate-spin inline mr-2"/> Loading Paddock Feed...</div> : comments.map((comment) => (
          <div key={comment.id} className={`bg-slate-950/50 p-5 rounded-xl border ${comment.isAdmin ? 'border-red-900/30 bg-red-950/10' : 'border-slate-800/50'} group`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className={`font-bold ${comment.isAdmin ? 'text-red-500' : 'text-blue-400'}`}>{comment.name}</span>
                {comment.isVoiceOfDay && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider border border-orange-500/30"><Star size={10} className="inline mr-1 mb-0.5"/>Voice of Day</span>}
              </div>
              
              <div className="flex items-center gap-3">
                {/* 🔥 點讚按鈕 */}
                <button onClick={() => handleLike(comment.id)} className="flex items-center gap-1.5 text-slate-500 hover:text-yellow-400 transition group/like active:scale-125">
                  <ThumbsUp size={16} className={`${comment.likes > 0 ? 'text-yellow-500 fill-yellow-500/20' : ''} group-hover/like:rotate-[-10deg]`} />
                  <span className={`text-xs ${comment.likes > 0 ? 'font-bold text-yellow-400' : ''}`}>{comment.likes}</span>
                </button>
                {isAdmin && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-3">
                    <button onClick={() => toggleVoiceOfDay(comment.id, comment.isVoiceOfDay || false)} className="text-slate-500 hover:text-orange-400" title="Set as Voice of Day"><Star size={16} /></button>
                    <button onClick={() => setAdminReplyId(comment.id)} className="text-slate-500 hover:text-blue-400"><Reply size={16} /></button>
                    <button onClick={() => handleDelete(comment.id)} className="text-slate-500 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-gray-300 mb-3 whitespace-pre-wrap leading-relaxed">{comment.text}</p>
            
            {comment.images && comment.images.length > 0 && (
              <div className={`grid ${comment.images.length === 1 ? 'grid-cols-1 max-w-sm' : 'grid-cols-2 md:grid-cols-3'} gap-2 mb-3`}>
                {comment.images.map((img, i) => (
                  <div key={i} className="relative group/img overflow-hidden rounded-lg">
                    {/* 🔥 列表維持原樣，但加上 hover 提示可以放大 */}
                    <img 
                      src={img} 
                      alt="post" 
                      className={`w-full ${comment.images.length === 1 ? 'h-auto max-h-96' : 'h-32'} object-cover border border-slate-800 group-hover/img:scale-105 transition duration-300 cursor-zoom-in`} 
                      onClick={() => openLightbox(comment.images!, i)} // 🔥 點擊放大
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center pointer-events-none">
                       <Smile className="text-white" size={24} /> {/* 這裡借用 Smile 當作放大圖示 */}
                    </div>
                  </div>
                ))}
              </div>
            ) }
            
            {comment.reply && (
              <div className="bg-blue-950/30 border-l-4 border-blue-500 p-3 rounded-r-lg mt-3 text-sm text-gray-300">
                <span className="text-blue-400 font-bold block mb-1">Paddock Official Reply</span>
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

      {/* 🔥 導入 Lightbox */}
      {lightboxState.isOpen && (
        <Lightbox 
          images={lightboxState.currentImages}
          selectedIndex={lightboxState.currentIndex}
          onClose={() => setLightboxState({ ...lightboxState, isOpen: false })}
          onPrev={() => setLightboxState(prev => ({ ...prev, currentIndex: (prev.currentIndex - 1 + prev.currentImages.length) % prev.currentImages.length }))}
          onNext={() => setLightboxState(prev => ({ ...prev, currentIndex: (prev.currentIndex + 1) % prev.currentImages.length }))}
        />
      )}
    </div>
  );
}
