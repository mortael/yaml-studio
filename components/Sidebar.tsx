import React from 'react';
import { FileText, Database, Layers, Box, Code } from 'lucide-react';
import { TEMPLATES } from '../constants';
import { Template } from '../types';

interface SidebarProps {
  onSelectTemplate: (template: Template) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectTemplate, isOpen }) => {
  if (!isOpen) return null;

  const getIcon = (category: string) => {
    switch (category) {
      case 'database': return <Database size={16} className="text-blue-400" />;
      case 'full-stack': return <Layers size={16} className="text-purple-400" />;
      case 'basic': return <Box size={16} className="text-green-400" />;
      default: return <FileText size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full overflow-hidden shrink-0 transition-all duration-300">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2">
        <Code className="text-blue-500" />
        <h2 className="font-semibold text-gray-200 tracking-wide">Templates</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className="w-full text-left p-3 rounded-md hover:bg-gray-800 group transition-colors flex items-start gap-3 border border-transparent hover:border-gray-700"
            >
              <div className="mt-1">{getIcon(template.category)}</div>
              <div>
                <div className="text-sm font-medium text-gray-300 group-hover:text-white">
                  {template.name}
                </div>
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {template.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-800 text-xs text-gray-600 text-center">
        YAML Studio v1.0
      </div>
    </div>
  );
};

export default Sidebar;