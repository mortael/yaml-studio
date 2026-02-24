import React from 'react';
import { AlertCircle } from 'lucide-react';

interface StatusbarProps {
  isValid: boolean;
  error?: string;
  lineCount: number;
  cursorPosition?: { lineNumber: number; column: number };
  onFixError: () => void;
  isFixing: boolean;
}

const Statusbar: React.FC<StatusbarProps> = ({ 
  isValid, 
  error, 
  lineCount, 
  cursorPosition,
  onFixError,
  isFixing
}) => {
  return (
    <div className={`h-8 border-t flex items-center justify-between px-4 text-xs select-none shrink-0 ${isValid ? 'bg-blue-950 border-blue-900' : 'bg-red-950 border-red-900'}`}>
      <div className="flex items-center gap-4 overflow-hidden">
        <div className="flex items-center gap-2">
            {!isValid && (
                <>
                <AlertCircle size={14} className="text-red-400" />
                <span className="text-red-300 truncate max-w-md font-mono" title={error}>
                    {error}
                </span>
                <button 
                    onClick={onFixError}
                    disabled={isFixing}
                    className="ml-2 px-2 py-0.5 bg-red-800 hover:bg-red-700 text-white rounded text-[10px] font-bold uppercase tracking-wider disabled:opacity-50 transition-colors"
                >
                    {isFixing ? 'Fixing...' : 'Fix with AI'}
                </button>
                </>
            )}
            {isValid && (
                <span className="text-blue-300">Ready</span>
            )}
        </div>
      </div>

      <div className="flex items-center gap-6 text-gray-400 font-mono">
        {typeof window !== 'undefined' && (window as any).__electrobun && (
          <div className="flex items-center gap-2 text-emerald-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[10px] font-bold">NATIVE</span>
          </div>
        )}
        <span>Ln {cursorPosition?.lineNumber || 1}, Col {cursorPosition?.column || 1}</span>
        <span>{lineCount} Lines</span>
        <span>UTF-8</span>
        <span>YAML</span>
      </div>
    </div>
  );
};

export default Statusbar;