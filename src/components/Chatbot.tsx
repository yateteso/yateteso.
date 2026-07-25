import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Image as ImageIcon, Video, Loader2, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLocation } from 'react-router-dom';

type Message = {
  role: 'user' | 'model';
  parts: { text: string; imageBase64?: string }[];
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', parts: [{ text: "Hello! I'm Yateteso AI. I can answer questions, analyze images, and even generate videos for you. How can I help today?" }] }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  
  // Video generation state
  const [videoPrompt, setVideoPrompt] = useState('');
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [isGeneratingVideoMode, setIsGeneratingVideoMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Hide on certain pages if needed, but for now show everywhere
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({
          data: reader.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Chat mode state
  const [chatMode, setChatMode] = useState<'fast' | 'search' | 'maps' | 'complex'>('fast');

  const handleSendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      parts: [
        { text: input },
        ...(selectedImage ? [{ text: '', imageBase64: selectedImage.data }] : [])
      ]
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const currentImage = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      let responseText = '';
      
      if (currentImage) {
        // Image Analysis (Always uses Pro)
        const res = await fetch('/api/gemini/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: currentImage.data,
            mimeType: currentImage.mimeType,
            prompt: input || 'Please analyze this image.'
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        responseText = data.text;
      } else {
        // Text Chat
        const historyForApi = messages.filter(m => !m.parts[0]?.imageBase64).map(m => ({
          role: m.role,
          parts: [{ text: m.parts[0].text }]
        }));
        
        const res = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: input,
            history: historyForApi,
            mode: chatMode
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        responseText = data.text;
      }

      setMessages(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: `Error: ${error.message}` }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!selectedImage) {
      alert("Please select a starting image to generate a video.");
      return;
    }
    setGeneratingVideo(true);
    setVideoResult(null);
    
    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage.data,
          mimeType: selectedImage.mimeType,
          prompt: videoPrompt,
          aspectRatio: '16:9'
        })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      const opName = data.operationName;
      
      // Poll for status
      const poll = setInterval(async () => {
        const statRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName })
        });
        const statData = await statRes.json();
        
        if (statData.done) {
          clearInterval(poll);
          
          // Try to download
          try {
            const dlRes = await fetch('/api/video-download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ operationName: opName })
            });
            
            if (dlRes.ok) {
              const blob = await dlRes.blob();
              setVideoResult(URL.createObjectURL(blob));
              setGeneratingVideo(false);
              setIsGeneratingVideoMode(false);
              setMessages(prev => [...prev, { role: 'model', parts: [{ text: "I've finished generating your video! You can view it above." }] }]);
            } else {
              throw new Error("Failed to download video");
            }
          } catch (e: any) {
            clearInterval(poll);
            setGeneratingVideo(false);
            alert("Error downloading video: " + e.message);
          }
        }
      }, 10000); // Check every 10 seconds
      
    } catch (error: any) {
      console.error(error);
      alert("Failed to start video generation: " + error.message);
      setGeneratingVideo(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-50 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col z-50 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 bg-zinc-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-black" />
            <h3 className="font-bold">Yateteso AI</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-black">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Mode Toggle */}
        <div className="p-2 flex gap-2 border-b border-zinc-100 bg-zinc-50/50">
          <button 
            onClick={() => setIsGeneratingVideoMode(false)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${!isGeneratingVideoMode ? 'bg-black text-white' : 'bg-transparent text-zinc-600 hover:bg-zinc-200'}`}
          >
            Chat & Analyze
          </button>
          <button 
            onClick={() => setIsGeneratingVideoMode(true)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${isGeneratingVideoMode ? 'bg-black text-white' : 'bg-transparent text-zinc-600 hover:bg-zinc-200'}`}
          >
            Generate Video
          </button>
        </div>

        {/* Messages / Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {isGeneratingVideoMode ? (
            <div className="space-y-4">
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                <h4 className="text-sm font-bold mb-2">Image to Video (Veo)</h4>
                <p className="text-xs text-zinc-500 mb-4">Upload an image and provide a prompt to generate a stunning 16:9 video.</p>
                
                {selectedImage ? (
                  <div className="relative mb-4">
                    <img src={selectedImage.data} alt="Selected" className="w-full rounded-lg border border-zinc-200" />
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/80"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full mb-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Select Starting Image
                  </Button>
                )}
                
                <Input
                  placeholder="Describe the animation..."
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  disabled={generatingVideo}
                  className="mb-4 text-sm"
                />
                
                <Button 
                  className="w-full" 
                  onClick={handleGenerateVideo}
                  disabled={!selectedImage || generatingVideo}
                >
                  {generatingVideo ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating... (This takes a few minutes)</>
                  ) : (
                    <><Video className="h-4 w-4 mr-2" /> Generate Video</>
                  )}
                </Button>
              </div>
              
              {videoResult && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold">Your Generated Video:</h4>
                  <video src={videoResult} controls className="w-full rounded-lg border border-zinc-200" />
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-black text-white rounded-br-none' : 'bg-zinc-100 text-zinc-900 rounded-bl-none'}`}>
                    {msg.parts[0]?.imageBase64 && (
                      <img src={msg.parts[0].imageBase64} alt="Uploaded" className="w-full rounded-lg mb-2" />
                    )}
                    {msg.parts[0]?.text && (
                      <div className="prose prose-sm prose-zinc max-w-none dark:prose-invert">
                        <Markdown remarkPlugins={[remarkGfm]}>{msg.parts[0].text}</Markdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-100 text-zinc-900 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                    <span className="text-sm text-zinc-500">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area (Only for Chat Mode) */}
        {!isGeneratingVideoMode && (
          <div className="p-3 border-t border-zinc-200">
            {selectedImage && (
              <div className="mb-2 relative inline-block">
                <img src={selectedImage.data} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-zinc-200" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-white text-black p-0.5 rounded-full shadow-sm border border-zinc-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            <div className="flex gap-2 mb-2 items-center">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Mode:</span>
              <select 
                value={chatMode} 
                onChange={(e) => setChatMode(e.target.value as any)}
                className="text-xs border border-zinc-200 rounded px-2 py-1 bg-white"
              >
                <option value="fast">Fast (Flash Lite)</option>
                <option value="search">Search (Flash + Web)</option>
                <option value="maps">Maps (Flash + Maps)</option>
                <option value="complex">High Thinking (Pro)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageSelect}
              />
              <button 
                className="p-2 text-zinc-500 hover:text-black transition-colors rounded-full hover:bg-zinc-100"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask Yateteso AI..."
                className="flex-1 bg-zinc-50 border-transparent focus-visible:ring-black focus-visible:bg-white rounded-full px-4"
                disabled={isLoading}
              />
              
              <button 
                onClick={handleSendMessage}
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className="p-2 bg-black text-white rounded-full disabled:opacity-50 hover:scale-105 transition-transform"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
