// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 使用環境變數載入設定，避免將 Key 直接寫死在程式碼中
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 💡 架構師細節：
// Next.js 在開發模式下會頻繁重新編譯 (Hot Reload)。
// 這裡的判斷是為了避免 Firebase App 被重複初始化而產生 Error。
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 導出資料庫實例，讓其他組件可以使用
const db = getFirestore(app);

export { app, db };