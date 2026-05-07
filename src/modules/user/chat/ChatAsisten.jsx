import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Paperclip, MoreVertical } from 'lucide-react';
import { auth } from "../../../services/firebase";
import { getAssistantResponse } from "./chatService.js";
import nutrinaImg from "../../../assets/nutrina-asist.jpeg";

export default function ChatAsisten() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: `Halo, Bunda ${auth.currentUser?.displayName || 'Juris Vassa'}! \nSaya Nutrina, asisten pintar e-ASI Care. Ada yang bisa Nutrina bantu seputar gizi atau kendala menyusui hari ini?`,
            sender: 'bot',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll ke pesan terbaru
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userText = input;
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // 1. Tambah pesan user ke UI
        const userMsg = { id: Date.now(), text: userText, sender: 'user', time: currentTime };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            // 2. Panggil API Gemini (lewat chatService)
            const aiResponse = await getAssistantResponse(userText);

            // 3. Tambah respon bot ke UI
            const botMsg = {
                id: Date.now() + 1,
                text: aiResponse,
                sender: 'bot',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Error fetching AI response:", error);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Chat Header - Ukuran diperbesar ke w-12 agar Nutrina menonjol */}
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden shadow-md border-2 border-pink-100 bg-pink-50 flex items-center justify-center">
                        <img
                            src={nutrinaImg}
                            alt="Nutrina"
                            className="w-full h-full object-cover object-top scale-110"
                        />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 leading-tight">Nutrina</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-xs text-gray-400">Asisten Aktif</span>
                        </div>
                    </div>
                </div>
                <button className="p-2 hover:bg-gray-50 rounded-full text-gray-400">
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                            {/* Avatar Dinamis - Bot diperbesar sedikit ke w-10 */}
                            <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center shadow-sm overflow-hidden border
                            ${msg.sender === 'user' ? 'bg-pink-100 border-pink-200' : 'bg-white border-gray-100'}`}>
                                {msg.sender === 'user' ? (
                                    <img
                                        src={auth.currentUser?.photoURL || `https://ui-avatars.com/api/?name=${auth.currentUser?.displayName || 'User'}&background=D81B60&color=fff`}
                                        alt="User"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img
                                        src={nutrinaImg}
                                        alt="Nutrina"
                                        className="w-full h-full object-cover object-top scale-110"
                                    />
                                )}
                            </div>

                            {/* Bubble Chat dengan Gradasi Tema  */}
                            <div className="flex flex-col">
                                <div className={`p-4 rounded-2xl shadow-sm leading-relaxed text-[14px] whitespace-pre-wrap
                                ${msg.sender === 'user'
                                    ? 'bg-gradient-to-r from-[#D81B60] to-[#FF6B9E] text-white rounded-tr-none'
                                    : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'}`}>
                                    {msg.text}
                                </div>
                                <span className={`text-[10px] mt-1.5 block text-gray-400 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                {msg.time}
                            </span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Indikator Mengetik */}
                {isTyping && (
                    <div className="flex justify-start items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-gray-100">
                            <img src={nutrinaImg} alt="Nutrina" className="w-full h-full object-cover object-top opacity-50" />
                        </div>
                        <div className="bg-gray-200 text-gray-500 px-4 py-2 rounded-2xl text-[11px] font-medium italic">
                            Nutrina sedang menganalisis data edukasi...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Area  */}
            <div className="p-4 bg-white border-t border-gray-50">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:border-pink-300 transition-all">
                    <button type="button" className="p-2 text-gray-400 hover:text-pink-500 transition-colors">
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isTyping ? "Nutrina sedang memproses..." : "Tulis pertanyaan Bunda ke Nutrina..."}
                        disabled={isTyping}
                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 py-2 disabled:cursor-not-allowed"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className={`p-2.5 rounded-xl transition-all shadow-md
                        ${input.trim() && !isTyping
                            ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-pink-200'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        <Send size={18} />
                    </button>
                </form>
                <p className="text-[10px] text-gray-400 text-center mt-3 tracking-wide">
                    Nutrina memberikan informasi berdasarkan Data Edukasi e-ASI Care.
                </p>
            </div>
        </div>
    );
}
