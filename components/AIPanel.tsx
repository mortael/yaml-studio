import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, Loader2 } from 'lucide-react';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

const AIPanel: React.FC<AIPanelProps> = ({ isOpen, onClose, onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt);
      // Don't clear prompt immediately, user might want to refine it if it fails or needs adjustment
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-800/50">
          <div className="flex items-center gap-2 text-purple-400">
            <Sparkles size={20} />
            <h3 className="font-semibold text-white">Gemini AI Assistant</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-700 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-300 text-sm mb-4">
            Describe the Docker Compose service or infrastructure you need. You can mention specific images, ports, or relationships.
          </p>
          
          <div className="relative">
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Create a setup with Nginx, Python Flask, and Redis. The Nginx service should proxy requests to Flask on port 5000."
              className="w-full h-32 bg-gray-950 border border-gray-700 rounded-lg p-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none font-mono text-sm leading-relaxed"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-600">
              Press Enter to send
            </div>
          </div>

          <div className="flex justify-end mt-4 gap-3">
             <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => handleSubmit()}
              disabled={isLoading || !prompt.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              {isLoading ? 'Thinking...' : 'Generate Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;