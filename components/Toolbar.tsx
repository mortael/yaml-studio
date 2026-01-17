import React from 'react';
import { Download, Sparkles, Copy, Play, CheckCircle, AlertTriangle, Menu, Wand2 } from 'lucide-react';

interface ToolbarProps {
  onGenerateAI: () => void;
  onFormat: () => void;
  onCopy: () => void;
  onDownload: () => void;
  toggleSidebar: () => void;
  isValid: boolean;
  isAiLoading: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  onGenerateAI, 
  onFormat, 
  onCopy, 
  onDownload, 
  toggleSidebar,
  isValid,
  isAiLoading
}) => {
  return (
    <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
           <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
             YAML Studio
           </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 border ${isValid ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-red-900/20 border-red-800 text-red-400'}`}>
           {isValid ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
           {isValid ? 'Valid YAML' : 'Syntax Error'}
        </div>

        <div className="h-6 w-px bg-gray-700 mx-2"></div>

        <button 
          onClick={onGenerateAI}
          disabled={isAiLoading}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAiLoading ? <Wand2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          AI Assist
        </button>

        <button 
          onClick={onFormat}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          title="Format Document"
        >
          <Play size={18} className="rotate-90" />
        </button>

        <button 
          onClick={onCopy}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          title="Copy to Clipboard"
        >
          <Copy size={18} />
        </button>

        <button 
          onClick={onDownload}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-gray-700"
        >
          <Download size={16} />
          Export
        </button>
      </div>
    </div>
  );
};

export default Toolbar;