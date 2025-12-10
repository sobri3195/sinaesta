import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Question, Flashcard } from "../types";

const generateId = () => Math.random().toString(36).substr(2, 9);

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateExamQuestions = async (
  topic: string,
  difficulty: string,
  count: number,
  subtopics: string[] = []
): Promise<Question[]> => {
  try {
    let prompt = `Create ${count} multiple choice questions about "${topic}" at a "${difficulty}" difficulty level.`;

    if (subtopics.length > 0) {
      prompt += ` Distribute the questions among the following subtopic categories: ${subtopics.join(', ')}.`;
    } else {
      prompt += ` Assign a specific subtopic category (e.g., 'Grammar', 'Vocabulary', 'History') to each question.`;
    }

    const questionSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.STRING, description: "The question text" },
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "An array of exactly 4 possible answers"
        },
        correctAnswerIndex: { type: Type.INTEGER, description: "The index (0-3) of the correct answer" },
        explanation: { type: Type.STRING, description: "Brief explanation why the answer is correct" },
        category: { type: Type.STRING, description: "The subtopic or category of the question" }
      },
      required: ["text", "options", "correctAnswerIndex", "explanation", "category"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: questionSchema
        }
      }
    });

    const rawQuestions = JSON.parse(response.text || "[]");
    
    // Map to our internal type with IDs
    return rawQuestions.map((q: any) => ({
      id: generateId(),
      text: q.text,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      explanation: q.explanation,
      category: q.category || topic,
      difficulty: difficulty as 'Easy' | 'Medium' | 'Hard'
    }));

  } catch (error) {
    console.error("Failed to generate questions:", error);
    throw new Error("AI generation failed. Please try again.");
  }
};

export const generateAnswerOptions = async (questionText: string, providedCorrectAnswer?: string): Promise<{ options: string[], correctAnswerIndex: number } | null> => {
  try {
    let prompt = `For the multiple-choice question: "${questionText}"\n`;

    if (providedCorrectAnswer && providedCorrectAnswer.trim()) {
        prompt += `
        The correct answer is: "${providedCorrectAnswer}".
        Generate 3 plausible distractors (incorrect options) that are relevant to the question.
        Combine the correct answer with the 3 distractors to make a list of 4 options.
        Randomize the position of the correct answer.
        Indicate which index (0-3) is the correct answer.
        `;
    } else {
        prompt += `
        Generate 4 plausible multiple-choice options. 
        One must be correct, and three should be plausible distractors.
        Indicate which index (0-3) is the correct answer.
        `;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of 4 option strings"
            },
            correctAnswerIndex: {
              type: Type.INTEGER,
              description: "Index of the correct option (0-3)"
            }
          },
          required: ["options", "correctAnswerIndex"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    if (result.options && Array.isArray(result.options) && result.options.length === 4) {
        return {
            options: result.options,
            correctAnswerIndex: result.correctAnswerIndex ?? 0
        };
    }
    return null;
  } catch (error) {
    console.error("Failed to generate options:", error);
    return null;
  }
};

export const generateExplanations = async (questions: Question[], topic: string): Promise<Record<string, string>> => {
  try {
    const simplifiedQuestions = questions.map(q => ({
      id: q.id,
      text: q.text,
      correctAnswer: q.options[q.correctAnswerIndex]
    }));

    const prompt = `
      For the following multiple-choice questions about "${topic}", generate a detailed and pedagogical explanation for why the answer is correct. 
      The explanation should be clear, informative, and helpful for a student preparing for a professional exam. 
      Where appropriate, include a brief example, clinical pearl, or analogy to clarify the concept.
      
      Return a list of objects containing the question 'id' and the generated 'explanation'.
      
      Questions:
      ${JSON.stringify(simplifiedQuestions)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             explanations: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                    },
                    required: ["id", "explanation"]
                }
             }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    const explanationMap: Record<string, string> = {};
    if (parsed.explanations && Array.isArray(parsed.explanations)) {
        parsed.explanations.forEach((item: any) => {
            explanationMap[item.id] = item.explanation;
        });
    }
    return explanationMap;

  } catch (error) {
    console.error("Explanation generation failed:", error);
    return {};
  }
};

export const generateExamOverview = async (
  topic: string,
  difficulty: string,
  count: number,
  duration: number,
  subtopics: string[],
  description?: string
): Promise<string> => {
  try {
    const prompt = `Generate a professional, concise summary (2-3 sentences) for an exam with these settings:
    Topic: ${topic}
    Difficulty: ${difficulty}
    Questions: ${count}
    Duration: ${duration} minutes
    Focus Areas: ${subtopics.length > 0 ? subtopics.join(', ') : 'Comprehensive coverage'}.
    ${description ? `Additional context from user: ${description.replace(/<[^>]*>/g, '')}` : ''}
    
    The summary should describe the scope, intended learning outcomes, and what the student will be tested on.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Overview generation failed:", error);
    return "";
  }
};

export const generateExamThumbnail = async (topic: string, difficulty: string): Promise<string | undefined> => {
  try {
    // Optimized prompt for professional, medical education app style
    const prompt = `
      Create a simple, professional, flat vector icon or illustration for a medical exam about "${topic}" (Difficulty: ${difficulty}).
      Style: Minimalist, clean lines, educational app aesthetic, white background, soft medical colors (blues, greens, teals).
      Subject: A central iconic representation of ${topic} (e.g. heart for cardiology, brain for neurology).
      NO TEXT inside the image. 
      Aspect Ratio: 1:1.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error) {
    console.error("Thumbnail generation failed:", error);
    return undefined;
  }
};

export interface IncorrectSample {
  index: number;
  text: string;
  category: string;
}

export const generatePerformanceFeedback = async (
  examTitle: string,
  score: number,
  total: number,
  topic: string,
  incorrectSamples: IncorrectSample[] = []
): Promise<string> => {
  try {
    let prompt = `A student scored ${score} out of ${total} on a "${topic}" exam titled "${examTitle}".\n`;
    
    if (incorrectSamples.length > 0) {
      prompt += `
      The student answered the following specific questions incorrectly. Use these examples to provide targeted, educational advice:
      
      ${incorrectSamples.map(q => `- Question ${q.index} [${q.category}]: "${q.text}"`).join('\n')}

      Please provide a constructive performance review (max 150 words):
      1. Briefly acknowledge the score.
      2. CRITICAL: Explicitly reference 2-3 of the specific questions above (e.g., "You struggled with Question X regarding...") and explain the core concept the student likely missed.
      3. Suggest 1-2 specific study topics based on these errors.
      4. Use an encouraging, professional tone. Address the student as "You".`;
    } else {
      prompt += `
      The student got a perfect or near-perfect score.
      Please provide a brief, encouraging, and constructive feedback paragraph (max 80 words) for the student. 
      Address them directly using "You". Congratulate them on mastering ${topic}.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Great effort! Keep studying to improve your score.";
  } catch (error) {
    console.error("Feedback generation failed", error);
    return "Feedback unavailable at this time.";
  }
};

export const generateFlashcards = async (topic: string, count: number): Promise<Flashcard[]> => {
  try {
    const prompt = `Create ${count} flashcards for a medical student studying "${topic}".
    Each flashcard must have a 'front' (Concept, Term, Diagnosis, or Drug) and a 'back' (Definition, Treatment, Criteria, or Dose).
    Focus on high-yield facts, clinical pearls, or standard criteria (e.g., Wells Score, Rome IV).
    Avoid overly long paragraphs on the back side. Keep it concise.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING, description: "The front side of the card (Question/Term)" },
              back: { type: Type.STRING, description: "The back side of the card (Answer/Definition)" },
              category: { type: Type.STRING, description: "Subtopic or tag" }
            },
            required: ["front", "back"]
          }
        }
      }
    });

    const raw = JSON.parse(response.text || "[]");
    return raw.map((c: any) => ({
      id: generateId(),
      front: c.front,
      back: c.back,
      category: c.category || topic
    }));

  } catch (error) {
    console.error("Flashcard generation failed", error);
    throw new Error("Failed to generate flashcards");
  }
};