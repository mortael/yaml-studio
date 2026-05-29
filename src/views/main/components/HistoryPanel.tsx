import React from 'react';
import { Clock, RotateCcw, X, ChevronRight } from 'lucide-react';

interface HistoryItem {
  timestamp: number;
  code: string;
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  currentIndex: number;
  onRestore: (index: number) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  currentIndex,
  onRestore 
}) => {
  if (!isOpen) return null;

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="absolute top-14 right-0 bottom-8 w-80 bg-gray-900 border-l border-gray-800 shadow-2xl z-20 flex flex-col animate-in slide-in-from-right duration-200">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-200">
          <Clock size={18} className="text-blue-400" />
          <h3 className="font-semibold">History</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {history.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 text-sm">No history yet.</div>
        ) : (
          <div className="space-y-1">
            {history.slice().reverse().map((item, reverseIndex) => {
               // Calculate real index based on reversed array
               const index = history.length - 1 - reverseIndex;
               const isCurrent = index === currentIndex;
               
               return (
                <button
                  key={item.timestamp}
                  onClick={() => onRestore(index)}
                  className={`w-full text-left p-3 rounded-md flex items-center justify-between group border transition-all ${
                    isCurrent 
                      ? 'bg-blue-900/20 border-blue-800/50' 
                      : 'hover:bg-gray-800 border-transparent hover:border-gray-700'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`text-sm font-mono ${isCurrent ? 'text-blue-300' : 'text-gray-300'}`}>
                      {formatTime(item.timestamp)}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      {item.code.length} bytes
                    </span>
                  </div>
                  {isCurrent ? (
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  ) : (
                    <RotateCcw size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
               );
            })}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-gray-800 text-xs text-gray-500 text-center">
        History is cleared on refresh
      </div>
    </div>
  );
};

export default HistoryPanel;