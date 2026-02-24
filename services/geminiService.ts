import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateYamlFromPrompt = async (prompt: string, currentCode: string): Promise<string> => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `You are an expert DevOps engineer specializing in Docker Compose and YAML configuration. 
  Your task is to generate valid, best-practice Docker Compose YAML based on the user's request.
  
  Rules:
  1. Return ONLY the YAML code. Do not include markdown code blocks (like \`\`\`yaml), explanations, or conversational text.
  2. If the user asks to modify existing code, merging the request intelligently.
  3. Ensure valid indentation (2 spaces).
  4. Use version '3.8' or higher unless specified.
  `;

  const fullPrompt = `
  Current YAML (if any):
  ${currentCode}

  User Request:
  ${prompt}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.2, // Low temperature for deterministic code
      }
    });

    let text = response.text || '';
    // Clean up if the model accidentally included markdown
    text = text.replace(/^```yaml\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');
    return text.trim();

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate YAML. Please check your API key.");
  }
};

export const fixYamlWithAi = async (code: string, errorMessage: string): Promise<string> => {
     const model = 'gemini-3-flash-preview';
     
     const prompt = `
     The following YAML file has syntax errors. Please fix it.
     
     Error Message: ${errorMessage}
     
     YAML Content:
     ${code}
     `;

      const systemInstruction = `You are a YAML syntax validator and fixer. Return ONLY the fixed YAML content. No markdown, no explanations.`;

      try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.1
            }
        });

        let text = response.text || '';
        text = text.replace(/^```yaml\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');
        return text.trim();
      } catch (error) {
          console.error("Gemini API Error:", error);
          throw error;
      }
}

export const convertCliToYaml = async (cliCommand: string): Promise<string> => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `You are a Docker expert. Convert the provided "docker run" command into a valid Docker Compose "services" YAML block.
  
  Rules:
  1. Return ONLY the YAML content for the services block (do not include "version" or "services" keys unless necessary for context, but preferably just the service definition).
  2. Use best practices (naming, indentation).
  3. Do not include markdown formatting.
  `;

  const prompt = `Convert this command:\n${cliCommand}`;

  try {
     const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { systemInstruction, temperature: 0.1 }
     });

     let text = response.text || '';
     text = text.replace(/^```yaml\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');
     return text.trim();
  } catch (error) {
      console.error("Gemini Conversion Error:", error);
      throw new Error("Failed to convert command.");
  }
}