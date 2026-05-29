import React, { useRef, useState } from 'react';
import { FileText, Database, Layers, Box, Code, FolderOpen, RefreshCw, Search, X, FolderSync } from 'lucide-react';
import { TEMPLATES } from '../constants';
import { Template } from '../types';
import yaml from 'js-yaml';

interface SidebarProps {
  onSelectTemplate: (template: Template) => void;
  isOpen: boolean;
  importedTemplates: Template[] | null;
  onImportFolder: (templates: Template[]) => void;
  onResetTemplates: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onSelectTemplate, 
  isOpen, 
  importedTemplates, 
  onImportFolder, 
  onResetTemplates 
}) => {
  const dirInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleFolderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    const foundTemplates: Template[] = [];
    const filesArray = Array.from(filesList);

    for (const fileObj of filesArray) {
      const file = fileObj as any;
      const path = file.webkitRelativePath || file.name;
      
      // Early exclusion guard: skip files inside common heavy directories
      const pathLower = path.toLowerCase();
      if (
        pathLower.includes('/node_modules/') || 
        pathLower.includes('\\node_modules\\') ||
        pathLower.includes('/.git/') || 
        pathLower.includes('\\.git\\') ||
        pathLower.includes('/vendor/') ||
        pathLower.includes('\\vendor\\') ||
        pathLower.includes('/dist/') ||
        pathLower.includes('\\dist\\') ||
        pathLower.includes('/build/') ||
        pathLower.includes('\\build\\') ||
        pathLower.includes('/.next/') ||
        pathLower.includes('\\.next\\') ||
        pathLower.includes('/.nuxt/') ||
        pathLower.includes('\\.nuxt\\')
      ) {
        continue;
      }

      const parts = path.split(/[/\\]/);
      const fileName = parts[parts.length - 1].toLowerCase();
      
      if (
        fileName === 'docker-compose.yml' || 
        fileName === 'docker-compose.yaml' || 
        fileName === 'compose.yml' || 
        fileName === 'compose.yaml'
      ) {
        try {
          const text = await file.text();
          let templateName = '';
          
          try {
            const doc = yaml.load(text) as any;
            if (doc && typeof doc === 'object' && doc.name) {
              templateName = String(doc.name).trim();
            }
          } catch (err) {
            // Parsing error is fine, we fallback to folder names
          }

          // Extract parent folder name as fallback or description detail
          const parentFolder = parts.length > 1 ? parts[parts.length - 2] : '';
          
          if (!templateName) {
            templateName = parentFolder || parts[parts.length - 1];
          }

          foundTemplates.push({
            id: path,
            name: templateName,
            description: path,
            content: text,
            category: 'basic'
          });
        } catch (err) {
          console.error('Error reading file:', path, err);
        }
      }
    }

    if (foundTemplates.length > 0) {
      onImportFolder(foundTemplates);
    } else {
      alert("No docker-compose.yml or docker-compose.yaml files were found in the selected folder.");
    }
    
    e.target.value = '';
  };

  const handleImportClick = () => {
    dirInputRef.current?.click();
  };

  const getIcon = (category: string, isImported: boolean) => {
    if (isImported) {
      return <FolderOpen size={16} className="text-amber-400 shrink-0 mt-0.5" />;
    }
    switch (category) {
      case 'database': return <Database size={16} className="text-blue-400 shrink-0 mt-0.5" />;
      case 'full-stack': return <Layers size={16} className="text-purple-400 shrink-0 mt-0.5" />;
      case 'basic': return <Box size={16} className="text-green-400 shrink-0 mt-0.5" />;
      default: return <FileText size={16} className="text-gray-400 shrink-0 mt-0.5" />;
    }
  };

  const currentItems = importedTemplates !== null ? importedTemplates : TEMPLATES;
  const isUsingImported = importedTemplates !== null;

  const filteredItems = currentItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full overflow-hidden shrink-0 transition-all duration-300" id="sidebar-container">
      {/* Invisible Directory/Folder Input */}
      <input
        type="file"
        ref={dirInputRef}
        onChange={handleFolderChange}
        className="hidden"
        {...({
          webkitdirectory: "",
          directory: ""
        } as any)}
        multiple
      />

      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="text-blue-500" />
          <h2 className="font-semibold text-gray-200 tracking-wide">
            {isUsingImported ? 'Local Composes' : 'Templates'}
          </h2>
        </div>
        {isUsingImported && (
          <button 
            onClick={onResetTemplates}
            title="Reset to builtin templates"
            className="text-gray-500 hover:text-gray-300 p-1 hover:bg-gray-800 rounded transition-colors"
            id="btn-reset-templates"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="p-3 border-b border-gray-800 flex flex-col gap-2 bg-gray-900/50">
        <button
          onClick={handleImportClick}
          className="w-full py-2 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
          id="btn-import-folder"
        >
          <FolderSync size={14} />
          <span>Import Docker Folder</span>
        </button>

        {/* Search bar */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-gray-500">
            <Search size={12} />
          </span>
          <input
            type="text"
            placeholder={isUsingImported ? "Search compose files..." : "Search templates..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-1.5 pl-8 pr-7 text-xs bg-gray-950 border border-gray-800 hover:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded text-gray-300 placeholder-gray-600 outline-none transition-all"
            id="sidebar-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-500 hover:text-gray-300"
              id="btn-clear-search"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2" id="sidebar-items-list">
        {filteredItems.length > 0 ? (
          <div className="space-y-1">
            {filteredItems.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className="w-full text-left p-2.5 rounded hover:bg-gray-800 group transition-colors flex items-start gap-2.5 border border-transparent hover:border-gray-800"
                id={`template-item-${template.id.replace(/[^a-zA-Z0-9]/g, '-')}`}
              >
                <div>{getIcon(template.category, isUsingImported)}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-gray-300 group-hover:text-white truncate">
                    {template.name}
                  </div>
                  <div 
                    className="text-[10px] text-gray-500 mt-0.5 font-mono truncate cursor-help"
                    title={template.description}
                  >
                    {isUsingImported 
                      ? template.description.substring(template.description.indexOf('/') + 1) || template.description
                      : template.description
                    }
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4 text-xs text-gray-600 font-sans" id="sidebar-empty-state">
            {searchQuery ? "No matching files" : (isUsingImported ? "No compose files found. Import another folder." : "No templates found")}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-gray-800 text-[10px] text-gray-600 flex justify-between bg-gray-900/40" id="sidebar-footer">
        <span>YAML Studio v1.1</span>
        {isUsingImported && (
          <span className="text-blue-500/70 font-mono">{filteredItems.length} composes</span>
        )}
      </div>
    </div>
  );
};

export default Sidebar;