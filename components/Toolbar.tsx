import React from 'react';
import { Save, FolderOpen, Sparkles, Copy, Play, CheckCircle, AlertTriangle, Menu, Wand2, Terminal, Clock, RotateCcw, RotateCw, FileCode, FileJson } from 'lucide-react';

interface ToolbarProps {
  onGenerateAI: () => void;
  onFormat: () => void;
  onCopy: () => void;
  onSave: () => void;
  onOpen: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onHistory: () => void;
  onCliImport: () => void;
  toggleSidebar: () => void;
  isValid: boolean;
  isAiLoading: boolean;
  language: 'yaml' | 'dockerfile';
  onLanguageChange: (lang: 'yaml' | 'dockerfile') => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  onGenerateAI, 
  onFormat, 
  onCopy, 
  onSave,
  onOpen,
  onUndo,
  onRedo,
  onHistory,
  onCliImport,
  toggleSidebar,
  isValid,
  isAiLoading,
  language,
  onLanguageChange
}) => {
  return (
    <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2 select-none">
           <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
             YAML Studio
           </span>
        </div>
        
        <div className="h-6 w-px bg-gray-700 mx-1"></div>

        {/* Language Selector */}
        <div className="flex bg-gray-800 rounded-lg p-0.5 border border-gray-700">
          <button
            onClick={() => onLanguageChange('yaml')}
            className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-2 transition-colors ${
              language === 'yaml' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileCode size={12} />
            Compose
          </button>
          <button
            onClick={() => onLanguageChange('dockerfile')}
            className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-2 transition-colors ${
              language === 'dockerfile' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileJson size={12} />
            Dockerfile
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {language === 'yaml' && (
          <div className={`mr-4 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 border ${isValid ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-red-900/20 border-red-800 text-red-400'}`}>
             {isValid ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
             {isValid ? 'Valid' : 'Error'}
          </div>
        )}

        {/* History Group */}
        <div className="flex items-center gap-1 bg-gray-800/50 p-1 rounded-lg border border-gray-800">
           <button onClick={onUndo} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors" title="Undo">
             <RotateCcw size={16} />
           </button>
           <button onClick={onRedo} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors" title="Redo">
             <RotateCw size={16} />
           </button>
           <div className="w-px h-4 bg-gray-700 mx-1"></div>
           <button onClick={onHistory} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors" title="History">
             <Clock size={16} />
           </button>
        </div>

        <div className="h-6 w-px bg-gray-700 mx-2"></div>

        {/* Tools Group */}
        <button 
          onClick={onCliImport}
          className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-800 rounded-md transition-colors"
          title="Import from Docker CLI"
        >
          <Terminal size={18} />
        </button>

        <button 
          onClick={onGenerateAI}
          disabled={isAiLoading}
          className="flex items-center gap-2 bg-purple-600/90 hover:bg-purple-500 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-2"
        >
          {isAiLoading ? <Wand2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          AI Assist
        </button>

        <div className="h-6 w-px bg-gray-700 mx-2"></div>

        {/* File Actions */}
         <button 
          onClick={onOpen}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          title="Open File"
        >
          <FolderOpen size={18} />
        </button>

        <button 
          onClick={onSave}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-gray-700 ml-1"
        >
          <Save size={16} />
          Save
        </button>
      </div>
    </div>
  );
};

export default Toolbar;