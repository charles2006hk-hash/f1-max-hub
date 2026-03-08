"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import { Quote, Megaphone } from "lucide-react";

export default function VoiceOfDay() {
  const [voice, setVoice] = useState<any>(null);

  useEffect(() => {
    // 只抓取被標記為 isVoiceOfDay 的最新一筆留言
    const q = query(
      collection(db, "fan_messages"),
      where("isVoiceOfDay", "==", true),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setVoice({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        setVoice(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!voice) return null;

  return (
    <div className="bg-gradient-to-br from-orange-900/40 to-slate-900 p-6 rounded-3xl border border-orange-500/30 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Quote size={80} />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="text-orange-400" size={20} />
        <h3 className="text-lg font-black text-white uppercase tracking-wider">Voice of the Day</h3>
      </div>
      
      <p className="text-gray-200 text-lg italic mb-4 relative z-10 whitespace-pre-wrap">
        "{voice.text}"
      </p>
      
      {/* 如果有圖片，顯示第一張作為縮圖 */}
      {voice.images && voice.images.length > 0 && (
        <img src={voice.images[0]} alt="Attached" className="w-full h-32 object-cover rounded-xl mb-4 border border-slate-700" />
      )}

      <div className="flex justify-end items-center mt-4 border-t border-slate-700/50 pt-3">
        <span className="text-orange-400 font-bold text-sm">— {voice.name}</span>
      </div>
    </div>
  );
}