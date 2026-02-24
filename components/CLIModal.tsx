import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowRight, Loader2, Terminal } from 'lucide-react';

interface CLIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConvert: (command: string) => Promise<void>;
  isLoading: boolean;
}

const CLIModal: React.FC<CLIModalProps> = ({ isOpen, onClose, onConvert, isLoading }) => {
  const [command, setCommand] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-800/50">
          <div className="flex items-center gap-2 text-green-400">
            <Terminal size={20} />
            <h3 className="font-semibold text-white">Import from CLI</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <label className="block text-sm text-gray-400 mb-2">
            Paste your <code className="text-green-400">docker run</code> command here:
          </label>
          <textarea
            ref={inputRef}
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder={`docker run -d --name nginx -p 8080:80 nginx:latest`}
            className="w-full h-40 bg-black/30 border border-gray-700 rounded-lg p-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 resize-none font-mono text-sm leading-relaxed"
          />

          <div className="flex justify-end mt-6 gap-3">
             <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => onConvert(command)}
              disabled={isLoading || !command.trim()}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
              Convert to YAML
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CLIModal;