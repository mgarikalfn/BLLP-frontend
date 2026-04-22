"use client";

import { useEffect, useState, useRef } from "react";
import { useP2PChatStore } from "@/store/useP2PChatStore";
import { useAuthStore } from "@/store/authStore";
import { useEconomyStore } from "@/store/useEconomyStore";
import { useLanguageStore } from "@/store/languageStore";
import Image from "next/image";
import { 
  Send, 
  Mic, 
  Plus, 
  Smile, 
  Video, 
  Info,
  Loader2,
  AlertTriangle,
  Flame,
  Gem,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";

const uiText = {
  am: {
    title: "የቋንቋ ልውውጥ",
    subtitle: "ከአፍ መፍቻ ቋንቋ ተናጋሪዎች ጋር ይገናኙ እና የተማሩትን በተግባር ይለማመዱ።",
    findPartner: "አዲስ አጋር ፈልግ",
    finding: "አጋር በመፈለግ ላይ...",
    expert: "ባለሙያ",
    chats: "ውይይቶች",
    placeholderAm: "በአማርኛ ይተይቡ...",
    placeholderAo: "በኦሮምኛ ይተይቡ...",
    reportTitle: "ይህን መልዕክት ሪፖርት አድርግ?",
    reportDesc: "ይህ መልዕክት ለምን አግባብ እንዳልሆነ ይምረጡ።",
    reportSubmit: "ሪፖርት አድርግ",
    cancel: "ሰርዝ",
    type: "የእርስዎን ተሞክሮ እዚህ ይፃፉ ..."
  },
  ao: {
    title: "Waljijjiirraa Afaanii",
    subtitle: "Dubbattoota afaan dhalootaa waliin wal qunnamaa, wanta barattanis shaakalaa.",
    findPartner: "Hiriyaa Haaraa Barbaadi",
    finding: "Hiriyaa Barbaadaa jira...",
    expert: "Ogeessa",
    chats: "Haasaa",
    placeholderAm: "Amaariffaan barreessi...",
    placeholderAo: "Afaan Oromootin barreessi...",
    reportTitle: "Ergaa kana gabaasuu feetaa?",
    reportDesc: "Ergaan kun maaliif akka hin taane filadhu.",
    reportSubmit: "Gabaasi",
    cancel: "Haqi",
    type: "Ergaa kee asitti barreessi..."
  }
} as const;

export default function ChatPage() {
  const { 
    socket, 
    isConnected, 
    connectSocket, 
    disconnectSocket, 
    isMatching, 
    conversations,
    activeConversation,
    setActiveConversation,
    fetchConversations,
    messages, 
    error, 
    findMatch, 
    sendMessage,
    reportUser
  } = useP2PChatStore();

  const user = useAuthStore((state) => state.user);
  const gems = useEconomyStore((state) => state.gems);
  const lang = useLanguageStore((state) => state.lang);
  const targetLang = useLanguageStore((state) => state.targetLang);
  const t = uiText[lang] || uiText.am;
  
  // Resolve the active user ID
  const [localUserId, setLocalUserId] = useState<string>("");
  const activeUserId = user?.id || localUserId;
  
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reporting State
  const [reportModal, setReportModal] = useState<{messageId: string, reportedUserId: string} | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  useEffect(() => {
    connectSocket();
    fetchConversations();
    
    // Fallback if useAuthStore user is not fully loaded immediately on mount
    const token = localStorage.getItem("token");
    if (token && !user?.id) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setLocalUserId(payload.id);
      } catch(e) {}
    }

    return () => disconnectSocket();
  }, [connectSocket, disconnectSocket, user?.id, fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText("");
    }
  };

  const handleReportSubmit = async () => {
    if (!reportModal || !reportReason) return;
    setIsReporting(true);
    await reportUser(reportModal.reportedUserId, reportModal.messageId, reportReason);
    setIsReporting(false);
    setReportModal(null);
    setReportReason("");
  };

  const activePartner = activeConversation?.participants.find(p => p._id !== activeUserId);

  return (
    <div className="flex relative h-[calc(100vh-64px)] w-full bg-[#F4F7F6]">
      
      {/* Sidebar - Conversation List */}
      <div className="w-20 md:w-80 h-full bg-white border-r border-slate-100 flex flex-col flex-shrink-0 z-10 transition-all">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="hidden md:block font-black text-slate-800 text-lg">{t.chats}</h2>
          <button 
            onClick={() => void findMatch()} 
            disabled={isMatching} 
            className="p-3 md:p-2 rounded-full bg-indigo-50 text-indigo-500 hover:bg-indigo-100 active:scale-95 transition mx-auto md:mx-0 flex items-center justify-center disabled:opacity-50"
            title={t.findPartner}
          >
            {isMatching ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full p-2 space-y-1">
          {conversations.map(conv => {
            const partner = conv.participants.find(p => p._id !== activeUserId);
            if (!partner) return null;
            const isActive = activeConversation?._id === conv._id;

            return (
              <button
                key={conv._id}
                onClick={() => void setActiveConversation(conv)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition text-left
                  ${isActive ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
              >
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center text-indigo-500 font-bold text-lg">
                  {partner.avatarUrl ? (
                    <Image src={partner.avatarUrl} alt="Avatar" fill className="object-cover" />
                  ) : (
                    partner.username.charAt(0).toUpperCase()
                  )}
                  {/* Online Indicator */}
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                </div>
                <div className="hidden md:flex flex-col flex-1 min-w-0">
                  <span className={`font-bold truncate ${isActive ? 'text-indigo-700' : 'text-slate-800'}`}>
                    {partner.username}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 truncate">
                    Level {partner.level} {t.expert}
                  </span>
                </div>
              </button>
            )
          })}
          {conversations.length === 0 && (
            <div className="hidden md:flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <MessageSquare size={32} className="mb-2 opacity-20" />
              <p className="text-sm font-medium">No active chats.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#F4F7F6]">
        
        {!activeConversation ? (
          // Empty State
          <div className="flex-1 flex items-center justify-center p-4">
             <div className="flex flex-col items-center bg-white p-10 rounded-3xl shadow-sm text-center max-w-md w-full">
              <div className="w-24 h-24 bg-sky-100 rounded-full flex items-center justify-center mb-6">
                <Image src="/mascot.svg" height={60} width={60} alt="Mascot" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">{t.title}</h2>
              <p className="text-slate-500 font-medium mb-8">
                {t.subtitle}
              </p>

              {error && (
                <div className="mb-4 w-full rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-500 flex items-center gap-2 text-left">
                  <AlertTriangle size={16} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={() => void findMatch()}
                disabled={isMatching}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-green-500 px-6 py-4 text-base font-black text-white transition-all hover:bg-green-600 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-sm shadow-green-500/20 w-fit sm:w-full sm:px-12"
              >
                {isMatching ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {t.finding}
                  </>
                ) : (
                  t.findPartner
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="flex flex-shrink-0 items-center justify-between bg-white px-6 py-4 border-b border-slate-100 shadow-sm z-10 w-full h-20">
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-slate-100 bg-slate-100 flex items-center justify-center text-indigo-500 font-bold text-xl">
                  {activePartner?.avatarUrl ? (
                      <Image src={activePartner.avatarUrl} alt="Avatar" fill className="object-cover" />
                    ) : (
                      activePartner?.username.charAt(0).toUpperCase()
                    )}
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg font-black text-slate-800 leading-tight">
                    {activePartner?.username}
                  </h2>
                  <span className="text-xs font-bold text-green-600">
                    Online • Lvl {activePartner?.level || 1} {t.expert}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 md:gap-6">
                <div className="hidden md:flex items-center gap-4 text-sm font-black">
                  <div className="flex items-center gap-1 text-orange-500">
                    <Flame size={18} className="fill-orange-500" />
                    <span>12</span>
                  </div>
                  <div className="flex items-center gap-1 text-sky-500">
                    <Gem size={18} className="fill-sky-500" />
                    <span>{gems}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <button className="hover:text-slate-600 transition"><Video size={20} strokeWidth={2.5} /></button>
                  <button className="hover:text-slate-600 transition"><Info size={20} strokeWidth={2.5} /></button>
                </div>
              </div>
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* Learning Reinforcement Banner */}
              <div className="flex justify-center mb-8 mt-2 w-full">
                <div className="bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-3 rounded-2xl flex items-start gap-3 w-full max-w-lg shadow-sm">
                   <div className="bg-white p-2 rounded-full shadow-sm text-indigo-500 flex-shrink-0 mt-0.5">
                     <Image src="/mascot.svg" height={24} width={24} alt="Tip" />
                   </div>
                   <div className="text-sm">
                     <p className="font-bold mb-0.5">Learning Tip</p>
                     <p className="font-medium opacity-90 leading-snug text-[13px]">
                       Use full sentences to practice grammar. Don't worry about making mistakes—your partner is here to help!
                     </p>
                   </div>
                </div>
              </div>

              <div className="flex justify-center my-6">
                <span className="bg-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                  Today
                </span>
              </div>

              {messages.map((msg, idx) => {
                const isMe = msg.senderId === activeUserId;
                const showAvatar = !isMe && (idx === 0 || messages[idx - 1].senderId !== msg.senderId);

                return (
                  <div key={msg._id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[85%] md:max-w-[70%] items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      
                      {/* Partner Avatar next to message */}
                      {!isMe ? (
                         <div className="w-8 h-8 flex-shrink-0 hidden sm:block">
                           {showAvatar && (
                              <div className="relative h-8 w-8 overflow-hidden rounded-full border border-slate-100 bg-slate-100 flex items-center justify-center text-indigo-500 font-bold text-xs">
                                {activePartner?.avatarUrl ? (
                                    <Image src={activePartner.avatarUrl} alt="Avatar" fill className="object-cover" />
                                  ) : (
                                    activePartner?.username.charAt(0).toUpperCase()
                                  )}
                              </div>
                           )}
                         </div>
                      ) : null}

                      <div className="flex flex-col gap-1 w-full relative group">
                         <div 
                          className={`relative rounded-3xl px-5 py-3 shadow-sm ${
                            isMe 
                              ? 'bg-green-600 text-white rounded-br-sm' 
                              : 'bg-white text-slate-700 border border-slate-100 rounded-bl-sm'
                          }`}
                        >
                          <p className="text-[15px] font-medium leading-relaxed break-words">{msg.text}</p>
                          
                          {/* Time */}
                          <span className={`block text-[10px] font-bold mt-1 text-right ${isMe ? 'text-green-200' : 'text-slate-400'}`}>
                            {format(new Date(msg.createdAt), 'hh:mm a')}
                          </span>

                          {/* Report button for partner messages */}
                          {!isMe && (
                            <button 
                               onClick={() => setReportModal({ messageId: msg._id, reportedUserId: msg.senderId })}
                               className="absolute -right-8 md:-right-10 top-1/2 -translate-y-1/2 opacity-0 md:group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all p-2 focus:opacity-100"
                               title="Report user"
                            >
                               <AlertTriangle size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex flex-shrink-0 items-center bg-[#F4F7F6] p-4 sm:p-6 sm:pt-2 w-full pb-6">
              <form 
                onSubmit={handleSend}
                className="flex w-full items-center gap-2 sm:gap-3 bg-white p-2 sm:p-3 rounded-full shadow-sm shadow-slate-200/50 border border-slate-200"
              >
                <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-95 transition flex-shrink-0">
                  <Plus size={20} strokeWidth={2.5} />
                </button>
                
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={targetLang === 'ao' ? t.placeholderAo : t.placeholderAm}
                  className="flex-1 bg-transparent px-2 text-[15px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none w-full min-w-0"
                />

                <button type="button" className="hidden sm:block text-slate-400 hover:text-slate-600 transition flex-shrink-0">
                  <Smile size={24} />
                </button>

                {inputText.trim() ? (
                  <button 
                    type="submit"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 active:scale-95 transition flex-shrink-0"
                  >
                    <Send size={18} strokeWidth={2.5} className="ml-1" />
                  </button>
                ) : (
                  <button 
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 active:scale-95 transition flex-shrink-0"
                  >
                    <Mic size={20} strokeWidth={2.5} />
                  </button>
                )}
              </form>
            </div>
          </>
        )}
      </div>

      {/* Report Modal overlay */}
      {reportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-rose-500 mb-2">
              <div className="p-3 bg-rose-100 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-black">{t.reportTitle}</h3>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-2">
              {t.reportDesc}
            </p>
            <textarea 
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder={t.type}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 outline-none focus:border-rose-300 resize-none h-24"
            />
            <div className="flex items-center gap-3 mt-2">
              <button 
                onClick={() => setReportModal(null)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition"
              >
                {t.cancel}
              </button>
              <button 
                onClick={handleReportSubmit}
                disabled={!reportReason.trim() || isReporting}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-rose-500 text-white hover:bg-rose-600 transition disabled:opacity-50 flex justify-center"
              >
                {isReporting ? <Loader2 size={20} className="animate-spin" /> : t.reportSubmit}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
