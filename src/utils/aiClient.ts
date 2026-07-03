import { GoogleGenAI } from '@google/genai';

// We store the API key in localStorage
export const getApiKey = () => localStorage.getItem('gemini_api_key');
export const setApiKey = (key: string) => localStorage.setItem('gemini_api_key', key);
export const hasApiKey = () => !!getApiKey();

export const generateAIResponse = async (prompt: string, context: string = '', imageFile?: File): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('API Key not set');

  const ai = new GoogleGenAI({ apiKey });
  
  const fullPrompt = context 
    ? `Context:\n${context}\n\nTask:\n${prompt}`
    : prompt;

  try {
    let contents: any = fullPrompt;

    if (imageFile) {
      const base64String = await fileToBase64(imageFile);
      contents = [
        { inlineData: { data: base64String.split(',')[1], mimeType: imageFile.type } },
        fullPrompt
      ];
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents
    });
    return response.text || '';
  } catch (err: any) {
    console.error('AI Error:', err);
    throw new Error(err.message || 'Failed to generate AI response');
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const parseFileText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
};
