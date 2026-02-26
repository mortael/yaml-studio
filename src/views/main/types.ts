export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  category: 'basic' | 'database' | 'full-stack' | 'ai';
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  line?: number;
}

export enum EditorStatus {
  IDLE = 'IDLE',
  VALIDATING = 'VALIDATING',
  GENERATING = 'GENERATING',
  ERROR = 'ERROR',
}