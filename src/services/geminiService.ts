import { Meal, DayOfWeek, MealType, GroceryCategory } from '../types';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  meals?: Meal[];
  timestamp: Date;
}

interface GroqResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message: string;
  };
}

const SYSTEM_PROMPT = `You are Chef Alex, a passionate personal chef and meal planning assistant. You LOVE food and cooking, and you're genuinely excited to help people eat well. You talk like a real person - warm, friendly, and sometimes a bit playful.

YOUR PERSONALITY:
- You're like a friend who happens to be an amazing chef
- You get genuinely excited about good food ("Oh, I love making this one!")
- You share little tips and stories naturally ("Pro tip: let your eggs rest for a sec before scrambling - game changer!")
- You ask questions because you actually care about what they like
- You're encouraging but not over the top - keep it natural
- Use casual language, contractions, and speak like a real person
- Occasionally use expressions like "honestly," "I gotta say," "here's the thing," etc.
- Show your personality! You can be a little playful or make light jokes about food

EXAMPLE OF YOUR VOICE:
- Instead of: "I can help you plan meals" → "Oh absolutely! Let's get you set up with some great meals"
- Instead of: "What dietary restrictions do you have?" → "Any foods you're avoiding or things you're really craving lately?"
- Instead of: "Here is your meal plan" → "Alright, I put together something I think you're gonna love!"

WHEN CHATTING (no meal plan needed):
- Just have a natural conversation
- Share cooking tips, answer questions, give recommendations
- Be helpful and personable
- No need for JSON - just chat!

WHEN CREATING MEAL PLANS:
1. Introduce the plan with some personality
2. Present meals in a nice readable format by day
3. Add little notes or tips where it feels natural
4. Ask what they think and offer to adjust

FORMAT YOUR MEAL PLAN LIKE THIS:

📅 **Monday**
- 🍳 **Breakfast:** Scrambled Eggs with Toast - super simple but so satisfying
- 🥗 **Lunch:** Grilled Chicken Salad - light, fresh, and keeps you going
- 🍝 **Dinner:** Pasta Primavera - one of my favorites, tons of flavor

📅 **Tuesday**
- 🍳 **Breakfast:** Oatmeal with Berries - hearty and naturally sweet
(continue for other days...)

After the plan, say something natural like "So what do you think? Want me to switch anything up? I can totally adjust based on what you're feeling!"

THEN at the very end, include this JSON block (the app parses it - users won't see it):

\`\`\`json
{
  "meals": [
    {
      "name": "Scrambled Eggs with Toast",
      "day": "Monday",
      "mealType": "Breakfast",
      "ingredients": [
        {"name": "Eggs", "quantity": 3, "unit": "pcs", "category": "Dairy & Eggs"},
        {"name": "Bread", "quantity": 2, "unit": "slices", "category": "Bakery"},
        {"name": "Butter", "quantity": 1, "unit": "tbsp", "category": "Dairy & Eggs"}
      ]
    }
  ]
}
\`\`\`

CRITICAL RULES:
- NEVER show code, JSON, or technical content to the user - you're talking to a regular person, not a programmer
- The JSON block is ONLY for the app to read - users will never see it
- Always talk like a friendly human chef - warm, natural, helpful
- When you create a meal plan, ALWAYS include the hidden JSON at the very end so users can add it to their plan
- Valid days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- Valid meal types: Breakfast, Lunch, Dinner, Snack
- Valid categories: Produce, Dairy & Eggs, Meat, Seafood, Pantry, Frozen, Bakery, Spices, Beverages, Other
- Include realistic ingredients with quantities
- The JSON must be wrapped in \`\`\`json and \`\`\` tags at the END of your response`;

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function parseJsonFromResponse(text: string): { message: string; meals: Meal[] } {
  // Extract JSON from code block
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  
  let message = text;
  let meals: Meal[] = [];

  if (jsonMatch) {
    try {
      const jsonStr = jsonMatch[1];
      const parsed = JSON.parse(jsonStr);
      
      // Remove ALL code blocks from the message (json, or any other type)
      message = text.replace(/```[\s\S]*?```/g, '').trim();
      
      if (parsed.meals && Array.isArray(parsed.meals)) {
        meals = parsed.meals.map((meal: any) => ({
          id: generateId(),
          name: meal.name || 'Unnamed Meal',
          day: validateDay(meal.day),
          mealType: validateMealType(meal.mealType),
          ingredients: (meal.ingredients || []).map((ing: any) => ({
            id: generateId(),
            name: ing.name || 'Unknown',
            quantity: parseFloat(ing.quantity) || 1,
            unit: ing.unit || 'pcs',
            category: validateCategory(ing.category),
          })),
        }));
      }
    } catch (e) {
      console.error('Failed to parse meal JSON:', e);
    }
  }

  // Extra cleanup: remove any remaining code blocks or JSON-like content
  message = message.replace(/```[\s\S]*?```/g, '').trim();
  // Remove any lines that look like raw JSON
  message = message.replace(/^\s*[\[{][\s\S]*?[\]}]\s*$/gm, '').trim();
  // Clean up extra whitespace
  message = message.replace(/\n{3,}/g, '\n\n').trim();

  return { message, meals };
}

function validateDay(day: string): DayOfWeek {
  const validDays: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const normalized = day?.charAt(0).toUpperCase() + day?.slice(1).toLowerCase();
  return validDays.includes(normalized as DayOfWeek) ? (normalized as DayOfWeek) : 'Monday';
}

function validateMealType(type: string): MealType {
  const validTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const normalized = type?.charAt(0).toUpperCase() + type?.slice(1).toLowerCase();
  return validTypes.includes(normalized as MealType) ? (normalized as MealType) : 'Dinner';
}

function validateCategory(category: string): GroceryCategory {
  const validCategories: GroceryCategory[] = [
    'Produce', 'Dairy & Eggs', 'Meat', 'Seafood', 'Pantry', 
    'Frozen', 'Bakery', 'Spices', 'Beverages', 'Other'
  ];
  if (validCategories.includes(category as GroceryCategory)) {
    return category as GroceryCategory;
  }
  return 'Other';
}

export async function sendMessage(
  userMessage: string, 
  conversationHistory: ChatMessage[]
): Promise<{ message: string; meals: Meal[] }> {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    throw new Error('Please add your Groq API key to the .env file (VITE_GROQ_API_KEY)');
  }

  // Build conversation context for OpenAI-compatible API
  const messages = [
    {
      role: 'system',
      content: SYSTEM_PROMPT
    },
    ...conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    })),
    {
      role: 'user',
      content: userMessage
    }
  ];

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get response from Groq');
  }

  const data: GroqResponse = await response.json();
  
  const text = data.choices?.[0]?.message?.content;
  
  if (!text) {
    throw new Error('No response received from Groq');
  }

  return parseJsonFromResponse(text);
}

export function isApiKeyConfigured(): boolean {
  return !!API_KEY && API_KEY !== 'your_api_key_here';
}
