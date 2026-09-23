export const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

export interface ExtractedMenuItem {
  name: string;
  description: string;
  price: number;
  category: 'Cakes' | 'Desserts' | 'Cookies' | 'Combos';
  subcategory?: string;
  available: boolean;
  bestSeller: boolean;
}

const SYSTEM_PROMPT = `
You are an expert restaurant/bakery menu parsing AI for "Bake Factory" (an artisanal bakery in Vijayawada).
Your job is to analyze unstructured menu text or menu card images and extract all bakery/dessert products into clean, structured JSON.

Return ONLY a valid JSON array of objects with this schema:
[
  {
    "name": "Product Name (clean, capitalized)",
    "description": "Short delicious description (1-2 sentences)",
    "price": 250,
    "category": "Cakes",
    "subcategory": "e.g. Birthday Cakes, Pastries, Cheesecakes, Jar Cakes, Cupcakes, Brownies",
    "available": true,
    "bestSeller": false
  }
]

Rules:
1. Category must strictly be one of: "Cakes", "Desserts", "Cookies", "Combos".
2. If price is given with weight (e.g., "500g ₹450 / 1kg ₹850"), use the base price (450) and note the size in description or name.
3. Clean up abbreviations, typos, and formatting.
4. Output MUST be strictly valid JSON without any markdown wraps or backticks if possible, or inside standard json fences.
`;

function cleanAndParseJson(rawContent: string): ExtractedMenuItem[] {
  if (!rawContent) return [];
  
  // 1. Direct JSON parse
  try {
    const parsed = JSON.parse(rawContent);
    if (Array.isArray(parsed)) return parsed;
    if (parsed.items && Array.isArray(parsed.items)) return parsed.items;
    if (parsed.menu && Array.isArray(parsed.menu)) return parsed.menu;
    if (parsed.products && Array.isArray(parsed.products)) return parsed.products;
  } catch (_) {}

  // 2. Extract JSON Array [ ... ]
  const arrayMatch = rawContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
  }

  // 3. Extract JSON Object { ... }
  const objMatch = rawContent.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      const parsed = JSON.parse(objMatch[0]);
      if (parsed.items && Array.isArray(parsed.items)) return parsed.items;
      if (parsed.menu && Array.isArray(parsed.menu)) return parsed.menu;
      if (parsed.products && Array.isArray(parsed.products)) return parsed.products;
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
  }

  return [];
}

/**
 * Extract menu items from raw text via Groq
 */
export async function extractMenuFromText(menuText: string): Promise<ExtractedMenuItem[]> {
  try {
    const modelsToTry = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: `Please extract all menu items from this bakery text:\n\n${menuText}` },
            ],
            temperature: 0.1,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`Groq model ${model} error (${response.status}): ${errText}`);
          lastError = new Error(`Groq API error (${response.status}): ${errText}`);
          continue;
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '';
        const items = cleanAndParseJson(rawContent);
        if (items.length > 0) {
          return items;
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (lastError) throw lastError;
    return [];
  } catch (error) {
    console.error('Error in extractMenuFromText:', error);
    throw error;
  }
}

/**
 * Extract menu items from a menu image via Groq Multimodal Vision
 */
export async function extractMenuFromImage(base64Image: string): Promise<ExtractedMenuItem[]> {
  try {
    // Format base64 URL
    const imageUrl = base64Image.startsWith('data:') 
      ? base64Image 
      : `data:image/jpeg;base64,${base64Image}`;

    const modelsToTry = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b'];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Extract all products, names, categories, and prices from this bakery menu image into structured JSON items list:' },
                  { type: 'image_url', image_url: { url: imageUrl } },
                ],
              },
            ],
            temperature: 0.1,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`Groq Vision model ${model} error (${response.status}): ${errText}`);
          lastError = new Error(`Groq Vision error (${response.status}): ${errText}`);
          continue;
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '';
        const items = cleanAndParseJson(rawContent);
        if (items.length > 0) {
          return items;
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (lastError) throw lastError;
    return [];
  } catch (error) {
    console.error('Error in extractMenuFromImage:', error);
    throw error;
  }
}
