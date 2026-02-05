import { Meal, DayOfWeek, MealType, GroceryCategory } from '../types';
import { getDateForDayInWeek, formatISODate } from '../utils/dateUtils';

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

// Dynamic system prompt that includes today's date for accurate date calculations
function getSystemPrompt(): string {
  const today = new Date();
  const todayFormatted = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const todayISO = formatISODate(today);
  
  // Calculate tomorrow for reference
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = formatISODate(tomorrow);
  const tomorrowFormatted = tomorrow.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Calculate day after tomorrow for multi-day example
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  const dayAfterTomorrowISO = formatISODate(dayAfterTomorrow);
  const dayAfterTomorrowFormatted = dayAfterTomorrow.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return `TODAY'S DATE: ${todayFormatted} (${todayISO})
TOMORROW'S DATE: ${tomorrowFormatted} (${tomorrowISO})

=== CRITICAL RULES - READ FIRST ===

***** MANDATORY JSON - THIS IS THE MOST IMPORTANT RULE *****
- EVERY response that contains meals MUST end with a \`\`\`json code block
- If you show ANY meals to the user, you MUST include the JSON
- If you describe breakfast, lunch, or dinner for ANY day, you MUST include the JSON
- The JSON enables the "Add to Plan" button - WITHOUT IT, USERS CANNOT SAVE MEALS
- This is not optional. EVERY meal plan response needs the JSON block at the end.
- Even if user says "add to my plan" - still include the JSON block.
*************************************************************

***** CONTEXT-AWARE PLANNING - MATCH USER'S REQUEST EXACTLY *****
- ONLY include meals that were explicitly discussed or requested
- NEVER assume the user wants a full multi-day meal plan unless they explicitly ask for one
- If user discusses 1 specific meal → include ONLY that 1 meal
- If user discusses 2 meals → include ONLY those 2 meals
- If user asks for 3 days → include exactly 3 days
- If user asks for 1 week → include exactly 7 days
- The number of meals in the JSON should EXACTLY match what the user requested/discussed

DISTINGUISH BETWEEN:
1. "Make me a meal plan" / "Plan my meals" = User wants structured multi-day planning
   → Ask for duration AND start date if not provided
   
2. "Add this to my plan" / "Save that" / "I want that one" = User wants to save specific discussed meals
   → Ask ONLY for the date if not provided
   → Do NOT create additional meals they didn't ask for
   
3. "What's a good breakfast?" / "Give me an idea for dinner" = Just chatting/recommendations
   → Give suggestions naturally, no JSON needed
   → ONLY include JSON if user then asks to add/save it
*****************************************************************

DO NOT ASK REDUNDANT QUESTIONS:
- If user says "starting tomorrow" or "tomorrow" → DO NOT ask when to start. You already know.
- If user says "3 days" or "a week" → DO NOT ask how many days. You already know.
- If user provides BOTH duration AND start date → CREATE THE PLAN IMMEDIATELY. No questions about dates.

EXAMPLES - FOLLOW THESE EXACTLY:

User: "What's a good breakfast idea?"
→ Just recommend a breakfast, chat naturally
→ NO JSON needed - they're just asking for ideas

User: [After you recommended a breakfast] "That sounds great, add it to my plan"
→ Missing: date
→ Ask: "Love it! What day do you want me to add this to?"

User: [After you recommended a breakfast] "Add that to tomorrow"
→ You have: the specific meal + date (tomorrow)
→ Include ONLY that 1 breakfast in the JSON for ${tomorrowISO}
→ Do NOT add lunch, dinner, or other days

User: "I want that breakfast and also suggest a lunch"
→ Give both meals, then ask: "Which day should I add these to?"

User: "Add both of those to tomorrow"
→ Include ONLY those 2 specific meals in the JSON

User: "make me a 3 day meal plan starting tomorrow"
→ You have: duration (3 days) + start date (tomorrow)
→ DO NOT ask about dates or duration
→ Create the plan for exactly 3 days: ${tomorrowFormatted}, ${dayAfterTomorrowFormatted}, and the day after
→ Include JSON block at the end

User: "Plan meals for next week"  
→ You have: duration (7 days) + start date (next Monday)
→ DO NOT ask about dates
→ Create the plan immediately for exactly 7 days
→ Include JSON block at the end

User: "I need a 5 day meal plan"
→ Missing: start date
→ Ask ONLY: "Nice, 5 days! What day should we start on?"

User: "Plan meals starting Friday"
→ Missing: duration
→ Ask ONLY: "Starting Friday, love it! How many days should I plan for?"

User: "Just give me dinner ideas for tonight"
→ Give dinner suggestions for tonight only
→ If they want to save: include ONLY that 1 dinner for today

=== END CRITICAL RULES ===

You are Chef Alex, a passionate personal chef and meal planning assistant. You LOVE food and cooking, and you're genuinely excited to help people eat well. You talk like a real person - warm, friendly, and sometimes a bit playful.

YOUR PERSONALITY:
- You're like a friend who happens to be an amazing chef
- You get genuinely excited about good food ("Oh, I love making this one!")
- You share little tips and stories naturally ("Pro tip: let your eggs rest for a sec before scrambling - game changer!")
- You're encouraging but not over the top - keep it natural
- Use casual language, contractions, and speak like a real person
- Occasionally use expressions like "honestly," "I gotta say," "here's the thing," etc.

EXAMPLE OF YOUR VOICE:
- Instead of: "I can help you plan meals" → "Oh absolutely! Let's get you set up with some great meals"
- Instead of: "What dietary restrictions do you have?" → "Any foods you're avoiding or things you're really craving lately?"
- Instead of: "Here is your meal plan" → "Alright, I put together something I think you're gonna love!"

WHEN CHATTING (no meal plan needed):
- Just have a natural conversation
- Share cooking tips, answer questions, give recommendations
- Be helpful and personable
- No need for JSON - just chat!

DATE CALCULATION RULES:
- "today" = ${todayISO}
- "tomorrow" = ${tomorrowISO}
- "next week" = the upcoming Monday through Sunday (7 days)
- "this week" = remaining days of the current week starting from today
- "starting Monday" = the next Monday from today
- Calculate all dates correctly using today's date as reference
- ALWAYS use YYYY-MM-DD format for dates in the JSON (e.g., "${todayISO}")

WHEN CREATING MEAL PLANS:
1. Introduce the plan with some personality
2. Present meals in a nice readable format by day WITH THE ACTUAL DATE
3. Add little notes or tips where it feels natural
4. Ask what they think and offer to adjust

FORMAT YOUR MEAL PLAN LIKE THIS (include actual dates!):

📅 **${tomorrowFormatted}**
- 🍳 **Breakfast:** Scrambled Eggs with Toast - super simple but so satisfying
- 🥗 **Lunch:** Grilled Chicken Salad - light, fresh, and keeps you going
- 🍝 **Dinner:** Pasta Primavera - one of my favorites, tons of flavor

📅 **${dayAfterTomorrowFormatted}**
- 🍳 **Breakfast:** Oatmeal with Berries - hearty and naturally sweet
(continue for other days...)

After the plan, say something natural like "So what do you think? Want me to switch anything up? I can totally adjust based on what you're feeling!"

THEN at the very end, include ONE SINGLE JSON block containing EVERY SINGLE MEAL from EVERY DAY you planned (the app parses it - users won't see it). If you planned 3 days with 3 meals each, the JSON should have 9 meals. If you planned 7 days, include all 21+ meals. NEVER leave any meals out of the JSON:

\`\`\`json
{
  "meals": [
    {
      "name": "Scrambled Eggs with Toast",
      "day": "${tomorrow.toLocaleDateString('en-US', { weekday: 'long' })}",
      "date": "${tomorrowISO}",
      "mealType": "Breakfast",
      "ingredients": [
        {"name": "Eggs", "quantity": 3, "unit": "pcs", "category": "Dairy & Eggs"},
        {"name": "Bread", "quantity": 2, "unit": "slices", "category": "Bakery"},
        {"name": "Butter", "quantity": 1, "unit": "tbsp", "category": "Dairy & Eggs"}
      ]
    },
    {
      "name": "Grilled Chicken Salad",
      "day": "${tomorrow.toLocaleDateString('en-US', { weekday: 'long' })}",
      "date": "${tomorrowISO}",
      "mealType": "Lunch",
      "ingredients": [...]
    },
    {
      "name": "Pasta Primavera",
      "day": "${tomorrow.toLocaleDateString('en-US', { weekday: 'long' })}",
      "date": "${tomorrowISO}",
      "mealType": "Dinner",
      "ingredients": [...]
    }
  ]
}
\`\`\`

CRITICAL RULES:
- NEVER show code, JSON, or technical content to the user - you're talking to a regular person, not a programmer
- The JSON block is ONLY for the app to read - users will never see it
- Always talk like a friendly human chef - warm, natural, helpful
- DO NOT ask about dates/duration if the user already provided that information
- ALWAYS include the "date" field in the JSON in YYYY-MM-DD format
- IMPORTANT: The JSON must contain EXACTLY the meals discussed - no more, no less. If user asked for 1 meal, include 1 meal. If user asked for 2 meals, include 2 meals. NEVER add extra meals the user didn't request.
- Valid days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- Valid meal types: Breakfast, Lunch, Dinner, Snack
- Valid categories: Produce, Dairy & Eggs, Meat, Seafood, Pantry, Frozen, Bakery, Spices, Beverages, Other
- Include realistic ingredients with quantities (3-6 per meal)
- The JSON must be wrapped in \`\`\`json and \`\`\` tags at the END of your response

***** FINAL REMINDER *****
When user wants to ADD/SAVE specific meals they discussed:
→ Include ONLY those specific meals in the JSON
→ Ask for the date if they didn't provide one
→ Do NOT create a full meal plan unless they asked for one

When user asks for a MEAL PLAN (multi-day):
→ Create exactly the number of days they requested
→ Include all meals for those days in the JSON

If just chatting about food ideas with no save request:
→ No JSON needed - just have a natural conversation
**************************

REMEMBER: Match the user's request exactly. If they want 1 meal saved, give them 1 meal. If they want a 5-day plan, give them exactly 5 days. Never assume they want more than they asked for.`;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function parseJsonFromResponse(
  text: string,
  weekStartsOn: 'Sunday' | 'Monday' = 'Sunday',
  referenceDate: Date = new Date()
): { message: string; meals: Meal[] } {
  // Extract ALL JSON blocks from code blocks (in case AI outputs multiple)
  const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/g;
  const allJsonBlocks: string[] = [];
  let match;
  
  while ((match = jsonBlockRegex.exec(text)) !== null) {
    allJsonBlocks.push(match[1]);
  }
  
  let message = text;
  let meals: Meal[] = [];

  // Process all JSON blocks and combine meals
  for (const jsonStr of allJsonBlocks) {
    try {
      const parsed = JSON.parse(jsonStr);
      
      if (parsed.meals && Array.isArray(parsed.meals)) {
        const parsedMeals = parsed.meals.map((meal: any) => {
          const day = validateDay(meal.day);
          
          // Use the date from AI if provided and valid, otherwise calculate from day
          let mealDateStr: string;
          // Trim whitespace and check for valid YYYY-MM-DD format
          const cleanedDate = meal.date?.toString().trim();
          if (cleanedDate && /^\d{4}-\d{2}-\d{2}$/.test(cleanedDate)) {
            // AI provided a valid date in YYYY-MM-DD format
            mealDateStr = cleanedDate;
          } else {
            // Fallback: calculate the date for this day based on referenceDate
            // For "tomorrow", "next week", etc., we need to intelligently calculate
            const mealDate = getDateForDayInWeek(day, weekStartsOn, referenceDate);
            mealDateStr = formatISODate(mealDate);
            console.log(`Meal "${meal.name}" had invalid date "${meal.date}", calculated ${mealDateStr} for ${day}`);
          }
          
          return {
            id: generateId(),
            name: meal.name || 'Unnamed Meal',
            day,
            date: mealDateStr,
            mealType: validateMealType(meal.mealType),
            ingredients: (meal.ingredients || []).map((ing: any) => ({
              id: generateId(),
              name: ing.name || 'Unknown',
              quantity: parseFloat(ing.quantity) || 1,
              unit: ing.unit || 'pcs',
              category: validateCategory(ing.category),
            })),
          };
        });
        meals = [...meals, ...parsedMeals];
      }
    } catch (e) {
      console.error('Failed to parse meal JSON block:', e, jsonStr);
    }
  }

  // Remove ALL code blocks from the message (json, or any other type)
  message = text.replace(/```[\s\S]*?```/g, '').trim();
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

// Detect if a response looks like it contains a meal plan
function looksLikeMealPlan(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Check for meal plan indicators
  const hasDateEmoji = text.includes('📅');
  const hasMealEmojis = /[🍳🥗🍝🍲🥘🍜🍱🌮🍕🥪🥙🍔🥣🥞🍛🥧🥗🍜]/.test(text);
  const hasMealTypes = /\*\*(breakfast|lunch|dinner|snack)/i.test(text);
  const hasDayHeaders = /\*\*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(text);
  const hasMultipleMeals = (text.match(/\*\*Breakfast\*\*|\*\*Lunch\*\*|\*\*Dinner\*\*|\*\*Snack\*\*/gi) || []).length >= 2;
  
  // Additional patterns to catch more meal plan formats
  const hasDayMentions = (lowerText.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi) || []).length >= 2;
  const hasMealLabels = (lowerText.match(/breakfast:|lunch:|dinner:|snack:/gi) || []).length >= 2;
  const hasMultipleDates = (text.match(/\d{4}-\d{2}-\d{2}/g) || []).length >= 2;
  const hasMealPlanPhrase = /meal plan|here's what|here are|planned for|put together/i.test(text);
  const hasDayWithMeals = /day\s*\d|day\s*one|day\s*two|day\s*three/i.test(text);
  
  // Count meal-related keywords
  const mealKeywordCount = (lowerText.match(/breakfast|lunch|dinner|snack|meal/gi) || []).length;
  
  // If it has date emoji + meal content, or multiple meal type mentions, it's likely a meal plan
  return (hasDateEmoji && (hasMealEmojis || hasMealTypes)) || 
         (hasDayHeaders && hasMultipleMeals) ||
         hasMultipleMeals ||
         (hasDayMentions && hasMealLabels) ||
         (hasMealPlanPhrase && mealKeywordCount >= 3) ||
         (hasDayWithMeals && mealKeywordCount >= 3) ||
         hasMultipleDates;
}

// Prompt to request just the JSON for meals already described
function getJsonRequestPrompt(): string {
  const today = new Date();
  const todayISO = formatISODate(today);
  
  return `IMPORTANT: I need the JSON data to save these meals. Please output ONLY a JSON code block with ALL the meals you just described.

Use this EXACT format - nothing else, just the JSON:

\`\`\`json
{
  "meals": [
    {
      "name": "Exact Meal Name",
      "day": "Wednesday",
      "date": "${todayISO}",
      "mealType": "Breakfast",
      "ingredients": [
        {"name": "Eggs", "quantity": 2, "unit": "pcs", "category": "Dairy & Eggs"},
        {"name": "Butter", "quantity": 1, "unit": "tbsp", "category": "Dairy & Eggs"}
      ]
    }
  ]
}
\`\`\`

CRITICAL REQUIREMENTS:
- Include EVERY meal from EVERY day you mentioned
- Use real dates in YYYY-MM-DD format (today is ${todayISO})
- Include 3-6 realistic ingredients per meal
- Valid mealTypes: Breakfast, Lunch, Dinner, Snack
- Valid categories: Produce, Dairy & Eggs, Meat, Seafood, Pantry, Frozen, Bakery, Spices, Beverages, Other

Output ONLY the JSON code block, nothing else.`;
}

export async function sendMessage(
  userMessage: string, 
  conversationHistory: ChatMessage[],
  weekStartsOn: 'Sunday' | 'Monday' = 'Sunday',
  referenceDate: Date = new Date()
): Promise<{ message: string; meals: Meal[] }> {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    throw new Error('Please add your Groq API key to the .env file (VITE_GROQ_API_KEY)');
  }

  // Build conversation context for OpenAI-compatible API
  const messages = [
    {
      role: 'system',
      content: getSystemPrompt()
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

  let result = parseJsonFromResponse(text, weekStartsOn, referenceDate);
  
  // If the response looks like a meal plan but no meals were parsed, request the JSON
  if (result.meals.length === 0 && looksLikeMealPlan(text)) {
    console.log('Detected meal plan without JSON, requesting meal data...');
    
    // Try up to 3 times to get the JSON
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`Follow-up attempt ${attempt}...`);
      
      // Wait before retry to avoid rate limiting (2 seconds for first, 4 for second)
      if (attempt > 1) {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      } else {
        // Small delay even for first attempt to space out from original request
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Make a follow-up request to get the JSON
      const followUpMessages = [
        {
          role: 'system',
          content: 'You are a helpful assistant that outputs JSON data. When asked for meal data, respond ONLY with a valid JSON code block containing all meals. Do not include any other text.'
        },
        {
          role: 'user',
          content: `Here is a meal plan that was created:\n\n${text}\n\n${getJsonRequestPrompt()}`
        }
      ];

      try {
        const followUpResponse = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: MODEL,
            messages: followUpMessages,
            temperature: 0.1, // Very low temperature for consistent JSON output
            max_tokens: 3000,
          }),
        });

        // If rate limited, wait longer before next attempt
        if (followUpResponse.status === 429) {
          console.log('Rate limited, waiting before retry...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }

        if (followUpResponse.ok) {
          const followUpData: GroqResponse = await followUpResponse.json();
          const followUpText = followUpData.choices?.[0]?.message?.content;
          
          if (followUpText) {
            console.log('Follow-up response received, parsing...');
            const jsonResult = parseJsonFromResponse(followUpText, weekStartsOn, referenceDate);
            
            if (jsonResult.meals.length > 0) {
              // Keep the original message but use the parsed meals
              result = {
                message: result.message,
                meals: jsonResult.meals
              };
              console.log(`Successfully parsed ${jsonResult.meals.length} meals from follow-up request (attempt ${attempt})`);
              break; // Success, exit retry loop
            }
          }
        }
      } catch (e) {
        console.error(`Follow-up attempt ${attempt} failed:`, e);
      }
    }
    
    // Log if we still couldn't get meals
    if (result.meals.length === 0) {
      console.warn('Could not extract meal data after follow-up attempts');
    }
  }

  return result;
}

export function isApiKeyConfigured(): boolean {
  return !!API_KEY && API_KEY !== 'your_api_key_here';
}
