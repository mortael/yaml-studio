import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import Statusbar from './components/Statusbar';
import AIPanel from './components/AIPanel';
import HistoryPanel from './components/HistoryPanel';
import CLIModal from './components/CLIModal';
import { INITIAL_CONTENT, DOCKER_ROOT_KEYS, DOCKER_SERVICE_KEYS, COMMON_IMAGES, DOCKERFILE_INSTRUCTIONS } from './constants';
import { validateYaml, formatYaml } from './services/yamlService';
import { generateYamlFromPrompt, fixYamlWithAi, convertCliToYaml } from './services/geminiService';
import { Template, ValidationResult } from './types';

interface HistoryState {
  timestamp: number;
  code: string;
}

const App: React.FC = () => {
  const [code, setCode] = useState<string>(INITIAL_CONTENT);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [language, setLanguage] = useState<'yaml' | 'dockerfile'>('yaml');
  
  // Panels
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCliModalOpen, setIsCliModalOpen] = useState(false);

  // Loading States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  
  // Editor
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [monacoInstance, setMonacoInstance] = useState<any>(null);
  const [cursorPosition, setCursorPosition] = useState({ lineNumber: 1, column: 1 });
  
  // History Management
  const [history, setHistory] = useState<HistoryState[]>([{ timestamp: Date.now(), code: INITIAL_CONTENT }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounce for history and validation
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only validate if in YAML mode
      if (language === 'yaml') {
        setValidation(validateYaml(code));
      } else {
        setValidation({ isValid: true });
      }
      
      // Add to history if different from current history head
      if (history[historyIndex].code !== code) {
        const newEntry = { timestamp: Date.now(), code };
        const newHistory = history.slice(0, historyIndex + 1);
        // Limit history size to 50
        if (newHistory.length > 50) newHistory.shift();
        
        setHistory([...newHistory, newEntry]);
        setHistoryIndex(newHistory.length);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [code, language]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    setEditorInstance(editor);
    setMonacoInstance(monaco);
    
    // Attempt to fix font measurement issues
    document.fonts.ready.then(() => {
       monaco.editor.remeasureFonts();
    });

    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        lineNumber: e.position.lineNumber,
        column: e.position.column
      });
    });

    // Register YAML Autocompletion
    monaco.languages.registerCompletionItemProvider('yaml', {
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });
        
        const lineContent = textUntilPosition;
        const trimmed = lineContent.trim();
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word ? word.startColumn : position.column,
          endColumn: word ? word.endColumn : position.column
        };

        const suggestions: any[] = [];
        if (lineContent.match(/image:\s*$/) || (lineContent.includes('image:') && !trimmed.endsWith(':'))) {
             COMMON_IMAGES.forEach(img => {
               suggestions.push({
                  label: img,
                  kind: monaco.languages.CompletionItemKind.Value,
                  insertText: img,
                  range: range,
                  detail: 'Docker Image'
               });
             });
        } else if (lineContent.match(/^\s+[\w-]*$/)) { 
             DOCKER_SERVICE_KEYS.forEach(key => {
                suggestions.push({
                   label: key,
                   kind: monaco.languages.CompletionItemKind.Property,
                   insertText: key + ': ',
                   range: range,
                   documentation: `Service configuration: ${key}`
                });
             });
        } else if (lineContent.match(/^[\w-]*$/)) {
             DOCKER_ROOT_KEYS.forEach(key => {
                suggestions.push({
                   label: key,
                   kind: monaco.languages.CompletionItemKind.Keyword,
                   insertText: key + ': ',
                   range: range,
                   documentation: `Root property: ${key}`
                });
             });
        }
        return { suggestions };
      }
    });

    // Register Dockerfile Autocompletion
    monaco.languages.registerCompletionItemProvider('dockerfile', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions = DOCKERFILE_INSTRUCTIONS.map(inst => ({
            label: inst,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: inst + ' ',
            range: range,
            detail: 'Dockerfile Instruction'
        }));
        
        return { suggestions };
      }
    });

    if (language === 'yaml') {
        setValidation(validateYaml(INITIAL_CONTENT));
    }
  };

  const updateCode = (newCode: string) => {
    setCode(newCode);
    // Immediate validation update for UI responsiveness (only for YAML)
    if (language === 'yaml') {
        setValidation(validateYaml(newCode));
    }
  };

  const handleTemplateSelect = (template: Template) => {
    if (code.trim() !== '' && code !== INITIAL_CONTENT) {
      if (!window.confirm("Replace current content with template?")) {
        return;
      }
    }
    // Switch to YAML if a template is selected (templates are currently all YAML)
    if (language !== 'yaml') {
        setLanguage('yaml');
    }
    updateCode(template.content);
  };

  const handleFormat = () => {
    if (language === 'yaml') {
        const formatted = formatYaml(code);
        updateCode(formatted);
    }
    // Dockerfile formatting could be added here in future
  };

  // Undo/Redo/History Actions
  const handleUndo = () => {
    if (editorInstance) {
      editorInstance.trigger('keyboard', 'undo', null);
    }
  };

  const handleRedo = () => {
    if (editorInstance) {
      editorInstance.trigger('keyboard', 'redo', null);
    }
  };

  const handleRestoreHistory = (index: number) => {
    if (index >= 0 && index < history.length) {
      const entry = history[index];
      updateCode(entry.code);
      setHistoryIndex(index);
      setIsHistoryOpen(false);
    }
  };

  // File Operations
  const handleSave = () => {
    const isYaml = language === 'yaml';
    const blob = new Blob([code], { type: isYaml ? 'text/yaml' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isYaml ? 'docker-compose.yml' : 'Dockerfile';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (fileName.includes('dockerfile')) {
        setLanguage('dockerfile');
    } else {
        setLanguage('yaml');
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        updateCode(content);
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  // AI & CLI
  const handleAiGenerate = async (prompt: string) => {
    setIsAiLoading(true);
    try {
      // TODO: Enhance AI service to support Dockerfile generation based on language state
      // For now, assuming YAML context as per initial requirements
      const generatedCode = await generateYamlFromPrompt(prompt, code);
      updateCode(generatedCode);
      setIsAiPanelOpen(false);
    } catch (error) {
      alert("Failed to generate code. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCliConvert = async (command: string) => {
    setIsAiLoading(true);
    try {
      const yamlFragment = await convertCliToYaml(command);
      
      let newContent = code;
      // If we are in Dockerfile mode, switch to YAML or warn?
      // Since convertCliToYaml makes YAML, let's switch to YAML if needed or append if compatible.
      // Usually users want this for compose.
      if (language === 'dockerfile') {
          if (window.confirm("CLI import generates Docker Compose YAML. Switch language to Compose?")) {
              setLanguage('yaml');
              // Append to empty or just set it
              newContent = yamlFragment;
          } else {
               // Abort if user wants to stay in Dockerfile
               setIsAiLoading(false);
               return; 
          }
      } else {
        if (code.includes('services:')) {
            newContent = code.trimEnd() + '\n' + yamlFragment;
        } else {
            newContent = code + '\n' + yamlFragment;
        }
      }
      
      updateCode(newContent);
      setIsCliModalOpen(false);
    } catch (error) {
      alert("Failed to convert command.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFixError = async () => {
    if (!validation.error) return;
    setIsFixing(true);
    try {
        const fixed = await fixYamlWithAi(code, validation.error);
        updateCode(fixed);
    } catch (error) {
        alert("Failed to fix YAML automatically.");
    } finally {
        setIsFixing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        // Accept both YAML and Dockerfile types (Dockerfile usually has no extension or .dockerfile)
        accept=".yml,.yaml,.dockerfile,Dockerfile"
      />

      <Toolbar 
        onGenerateAI={() => setIsAiPanelOpen(true)}
        onFormat={handleFormat}
        onCopy={() => navigator.clipboard.writeText(code)}
        onSave={handleSave}
        onOpen={handleOpenClick}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        onCliImport={() => setIsCliModalOpen(true)}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isValid={validation.isValid}
        isAiLoading={isAiLoading || isFixing}
        language={language}
        onLanguageChange={setLanguage}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onSelectTemplate={handleTemplateSelect} 
        />
        
        <div className="flex-1 flex flex-col relative h-full w-full bg-[#1e1e1e]">
          <Editor
            height="100%"
            defaultLanguage="yaml"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={updateCode}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              padding: { top: 16, bottom: 16 },
              // Explicit font stack to fix cursor issues
              fontFamily: '"JetBrains Mono", Consolas, "Courier New", monospace',
              fontLigatures: true,
              renderWhitespace: 'selection',
            }}
          />
          
          <HistoryPanel 
            isOpen={isHistoryOpen} 
            onClose={() => setIsHistoryOpen(false)}
            history={history}
            currentIndex={historyIndex}
            onRestore={handleRestoreHistory}
          />
        </div>
      </div>

      <Statusbar 
        isValid={validation.isValid} 
        error={validation.error}
        lineCount={code.split('\n').length}
        cursorPosition={cursorPosition}
        onFixError={handleFixError}
        isFixing={isFixing}
      />

      <AIPanel 
        isOpen={isAiPanelOpen}
        onClose={() => setIsAiPanelOpen(false)}
        onGenerate={handleAiGenerate}
        isLoading={isAiLoading}
      />
      
      <CLIModal
        isOpen={isCliModalOpen}
        onClose={() => setIsCliModalOpen(false)}
        onConvert={handleCliConvert}
        isLoading={isAiLoading}
      />
    </div>
  );
};

export default App;