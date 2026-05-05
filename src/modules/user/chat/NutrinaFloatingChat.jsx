import React, {useState, useRef, useEffect} from 'react';
import {Send, Bot, Paperclip, X, Minimize2} from 'lucide-react';
import {auth} from "../../../services/firebase.js";
import {getAssistantResponse} from "./chatService.js";
import nutrinaImg from "../../../assets/nutrina-asist.jpeg";

export default function NutrinaFloatingChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: `Halo, Bunda ${auth.currentUser?.displayName || 'Juris'}! \nSaya Nutrina, asisten pintar e-ASI Care. Ada yang bisa Nutrina bantu?`,
            sender: 'bot',
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isTyping, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userText = input;
        const userMsg = {
            id: Date.now(),
            text: userText,
            sender: 'user',
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const aiResponse = await getAssistantResponse(userText);
            const botMsg = {
                id: Date.now() + 1,
                text: aiResponse,
                sender: 'bot',
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end">
            {/* Jendela Chat Overlay */}
            {isOpen && (
                <div
                    className="mb-6 w-[350px] max-w-[85vw] h-[500px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Header Pop-up */}
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-pink-100">
                                <img src={nutrinaImg} alt="Nutrina"
                                     className="w-full h-full object-cover object-top scale-110"/>
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-800 text-sm">Nutrina</h2>
                                <span className="text-[10px] text-green-500 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
                                </span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors">
                            <Minimize2 size={18}/>
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id}
                                 className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`flex gap-2 max-w-[90%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div
                                        className="w-7 h-7 rounded-full shrink-0 overflow-hidden border border-gray-100 bg-white">
                                        <img
                                            src={msg.sender === 'user' ? (auth.currentUser?.photoURL || "https://ui-avatars.com/api/?name=User") : nutrinaImg}
                                            className="w-full h-full object-cover object-top"
                                            alt="Avatar"
                                        />
                                    </div>
                                    <div
                                        className={`p-3 rounded-2xl text-[13px] shadow-sm ${msg.sender === 'user' ? 'bg-[#D81B60] text-white rounded-tr-none' : 'bg-white text-gray-700 rounded-tl-none border border-gray-50'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && <div className="text-[10px] text-gray-400 animate-pulse italic ml-9">Nutrina
                            mengetik...</div>}
                        <div ref={messagesEndRef}/>
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage}
                          className="p-3 bg-white border-t border-gray-50 flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Tanya Nutrina..."
                            className="flex-1 bg-gray-50 border-none outline-none text-xs p-2.5 rounded-xl"
                        />
                        <button type="submit"
                                className="p-2.5 bg-[#D81B60] text-white rounded-xl shadow-md shadow-pink-100">
                            <Send size={16}/>
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Button Pemicu */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 pl-2 pr-6 py-2 rounded-full shadow-xl transition-all duration-300 transform active:scale-95 
        ${isOpen ? 'bg-white text-gray-800 border border-gray-100' : 'bg-[#D81B60] text-white hover:shadow-pink-200'}`}
            >
                {isOpen ? (
                    <X size={24} className="mx-2"/>
                ) : (
                    <>
                        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/30 shadow-md">
                            <img
                                src={nutrinaImg}
                                alt="Nutrina"
                                className="w-full h-full object-cover object-top scale-110"
                            />
                        </div>
                        <span className="text-sm font-bold tracking-wide">Tanya Nutrina</span>
                    </>
                )}
            </button>
        </div>
    );
}
