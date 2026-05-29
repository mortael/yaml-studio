import yaml from 'js-yaml';
import { ValidationResult } from '../types';

export const validateYaml = (content: string): ValidationResult => {
  if (!content || content.trim() === '') {
    return { isValid: true };
  }

  try {
    const doc = yaml.load(content);
    return validateDockerComposeStructure(doc);
  } catch (e: any) {
    return {
      isValid: false,
      error: e.message || 'Invalid YAML',
      line: e.mark ? e.mark.line + 1 : undefined, // js-yaml lines are 0-indexed
    };
  }
};

const validateDockerComposeStructure = (doc: any): ValidationResult => {
  if (typeof doc !== 'object' || doc === null) {
    return { isValid: false, error: 'Document must be an object (Docker Compose root)' };
  }

  // Basic version check
  if (doc.version && typeof doc.version !== 'string') {
     return { isValid: false, error: "'version' must be a string (e.g., '3.8')" };
  }

  // Services check
  if (doc.services) {
    if (typeof doc.services !== 'object') {
       return { isValid: false, error: "'services' must be a mapping of service names" };
    }
    
    const services = doc.services as Record<string, any>;
    for (const [serviceName, serviceConfig] of Object.entries(services)) {
       if (typeof serviceConfig !== 'object' || serviceConfig === null) {
          return { isValid: false, error: `Service '${serviceName}' must be a mapping configuration` };
       }
       
       const sc = serviceConfig as any;
       if (!sc.image && !sc.build) {
           return { isValid: false, error: `Service '${serviceName}' must specify either 'image' or 'build'` };
       }

       if (sc.ports && !Array.isArray(sc.ports)) {
           return { isValid: false, error: `Service '${serviceName}' ports must be a list` };
       }

       if (sc.volumes && !Array.isArray(sc.volumes) && typeof sc.volumes !== 'object') {
           return { isValid: false, error: `Service '${serviceName}' volumes must be a list or mapping` };
       }
    }
  } else if (Object.keys(doc).length > 0) {
      // It's valid to have a file without services (e.g. override), but usually a warning or valid for partials.
      // For a main editor, we might expect services, but let's be permissive if they are just defining volumes/networks.
      // However, if it has random keys, flag it.
      const validRootKeys = ['version', 'services', 'volumes', 'networks', 'secrets', 'configs', 'x-'];
      const unknownKeys = Object.keys(doc).filter(k => !validRootKeys.some(vk => k.startsWith(vk)));
      if (unknownKeys.length > 0) {
          return { isValid: false, error: `Unknown root level key: '${unknownKeys[0]}'` };
      }
  }

  return { isValid: true };
}

export const formatYaml = (content: string): string => {
    try {
        const obj = yaml.load(content);
        return yaml.dump(obj, { indent: 2, lineWidth: -1 });
    } catch (e) {
        return content; // Return original if invalid
    }
}