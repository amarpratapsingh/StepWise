import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface TutorialStep {
  title: string;
  description: string;
  timestamp?: string;
}

export interface StructuredTutorial {
  title: string;
  prerequisites: string[];
  steps: TutorialStep[];
  checklist: string[];
  summary: string;
}

export async function structureTutorial(transcript: string, metadata?: { title?: string, description?: string, author?: string }): Promise<StructuredTutorial> {
  const context = `
    VIDEO TITLE: ${metadata?.title || 'Unknown'}
    VIDEO DESCRIPTION: ${metadata?.description || 'No description provided'}
    TRANSCRIPT: ${transcript || 'No transcript available (Video might not have captions enabled)'}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      ROLE: Tutorial structuring assistant
      TASK: Convert the provided video data into a highly structured, actionable guide.
      
      VIDEO CONTEXT:
      ${context}
      
      INSTRUCTIONS:
      1. Carefully analyze the provided VIDEO CONTEXT.
      2. If a TRANSCRIPT is present, use it as the primary source for the guide.
      3. CRITICAL: If the TRANSCRIPT is missing or "No transcript available", you must synthesize a highly probable and logical step-by-step tutorial based ON THE VIDEO TITLE AND VIDEO DESCRIPTION. 
      4. Use your extensive general knowledge to deduce the most standard, safe, and effective way to perform the task described in the title.
      5. If the title is "How to bake a cake" and there is no transcript, you should provide a standard, high-quality cake baking guide.
      6. Reconstruct the steps clearly as if you are followig the video's teaching style (clear, sequential, encouraging).
      7. Identify prerequisites or materials/tools needed first.
      8. Create a numbered list of steps (aim for clarity, max 30 words per description).
      9. Create a simple completion checklist for the progress tracker.
      10. Provide a brief 1-sentence summary at the end.
      11. If the context is entirely insufficient or is not an instructional video, provide a generic guide based on the title but note it in the summary.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Clear, concise title for the tutorial" },
          prerequisites: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of items or knowledge needed before starting" 
          },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                timestamp: { type: Type.STRING, description: "Estimate timestamp if possible, otherwise leave empty" }
              }
            }
          },
          checklist: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Action items for a progress tracker"
          },
          summary: { type: Type.STRING }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI returned empty response");
  
  return JSON.parse(text) as StructuredTutorial;
}
