import React, { useState, useEffect, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import Statusbar from './components/Statusbar';
import AIPanel from './components/AIPanel';
import { INITIAL_CONTENT, DOCKER_ROOT_KEYS, DOCKER_SERVICE_KEYS, COMMON_IMAGES } from './constants';
import { validateYaml, formatYaml } from './services/yamlService';
import { generateYamlFromPrompt, fixYamlWithAi } from './services/geminiService';
import { Template, ValidationResult } from './types';

const App: React.FC = () => {
  const [code, setCode] = useState<string>(INITIAL_CONTENT);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [cursorPosition, setCursorPosition] = useState({ lineNumber: 1, column: 1 });

  // Debounced validation
  useEffect(() => {
    const timer = setTimeout(() => {
      setValidation(validateYaml(code));
    }, 300);
    return () => clearTimeout(timer);
  }, [code]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    setEditorInstance(editor);
    
    // Fix cursor alignment issues with custom fonts by waiting for them to load
    document.fonts.ready.then(() => {
       monaco.editor.remeasureFonts();
    });

    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        lineNumber: e.position.lineNumber,
        column: e.position.column
      });
    });

    // Register Autocompletion Provider
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

        // 1. Image Autocomplete: Triggered after "image: "
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
        }
        // 2. Service Keys: Triggered when indented
        else if (lineContent.match(/^\s+[\w-]*$/)) { 
             DOCKER_SERVICE_KEYS.forEach(key => {
                suggestions.push({
                   label: key,
                   kind: monaco.languages.CompletionItemKind.Property,
                   insertText: key + ': ',
                   range: range,
                   documentation: `Service configuration: ${key}`
                });
             });
        }
        // 3. Root Keys: Triggered at start of line
        else if (lineContent.match(/^[\w-]*$/)) {
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

    // Initial validation
    setValidation(validateYaml(INITIAL_CONTENT));
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    if (code.trim() !== '' && code !== INITIAL_CONTENT) {
      if (!window.confirm("Replace current content with template?")) {
        return;
      }
    }
    setCode(template.content);
  };

  const handleFormat = () => {
    const formatted = formatYaml(code);
    setCode(formatted);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'docker-compose.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAiGenerate = async (prompt: string) => {
    setIsAiLoading(true);
    try {
      const generatedCode = await generateYamlFromPrompt(prompt, code);
      setCode(generatedCode);
      setIsAiPanelOpen(false);
    } catch (error) {
      alert("Failed to generate YAML. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFixError = async () => {
    if (!validation.error) return;
    setIsFixing(true);
    try {
        const fixed = await fixYamlWithAi(code, validation.error);
        setCode(fixed);
    } catch (error) {
        alert("Failed to fix YAML automatically.");
    } finally {
        setIsFixing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">
      <Toolbar 
        onGenerateAI={() => setIsAiPanelOpen(true)}
        onFormat={handleFormat}
        onCopy={handleCopy}
        onDownload={handleDownload}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isValid={validation.isValid}
        isAiLoading={isAiLoading || isFixing}
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
            theme="vs-dark"
            value={code}
            onChange={handleCodeChange}
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
              fontFamily: 'JetBrains Mono, monospace',
              renderWhitespace: 'selection',
              fontLigatures: true,
            }}
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
    </div>
  );
};

export default App;