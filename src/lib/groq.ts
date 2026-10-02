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
You are an expert restaurant and bakery catalog parsing AI for "Bake Factory" (an artisanal boutique bakery in Vijayawada).
Your job is to parse ANY items, cake designs, customized tiers, add-ons, extra charges, or priced offerings from the input into clean, structured JSON products.

Important Guidelines:
1. Even if an item is labeled as "Extra Charges", "Custom Design", "Photo Theme", "Fondant", or "Add-on", extract each line as a valid product item with its specified price.
2. If price is specified "per kg" (e.g. "300 per kg" or "800 per kg"), use the numeric rate (e.g. 300 or 800) and note "Priced per kg" in the description.
3. Category must strictly be one of: "Cakes", "Desserts", "Cookies", "Combos".
   - Anything relating to cakes, sponge, fondant, theme, birthday tiers -> "Cakes"
   - Pastries, brownies, cheesecakes, jar cakes, mousses, tartlets -> "Desserts"
   - Cookies, biscuits, tea treats -> "Cookies"
   - Hampers, gift boxes, party packs -> "Combos"

Return ONLY a valid JSON array of objects with this schema:
[
  {
    "name": "Product Name (clean, capitalized)",
    "description": "Short appetizing description (1-2 sentences)",
    "price": 300,
    "category": "Cakes",
    "subcategory": "Custom Design / Add-on",
    "available": true,
    "bestSeller": false
  }
]

Output MUST be strictly valid JSON without any conversational text.
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
 * Bulletproof heuristic regex parser for plain text lines containing prices.
 * Used as a fallback if an AI model returns an empty list or encounters format issues.
 */
function heuristicMenuParser(text: string): ExtractedMenuItem[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const items: ExtractedMenuItem[] = [];

  for (const line of lines) {
    // Skip general non-item headers
    if (/^(extra\s+charges|menu|price\s*list|categories|catalogue|items)$/i.test(line)) continue;

    // Match numbers in line (e.g. "300", "₹450", "Extra 500 per kg", "120/-")
    const priceMatch = line.match(/(?:₹|rs\.?|inr|extra\s*)?\s*(\d{2,6})(?:\s*\/-|\s*per\s*kg)?/i);
    if (!priceMatch) continue;

    const price = parseInt(priceMatch[1], 10);
    if (isNaN(price) || price <= 0) continue;

    // Clean out price number and extra keywords from the item name
    let name = line
      .replace(/(?:-|:|\bextra\b|₹|rs\.?|inr)?\s*\d{2,6}(?:\s*\/-|\s*per\s*kg)?.*$/i, '')
      .replace(/^[-•*–\s]+/, '')
      .trim();

    if (!name || name.length < 2) {
      name = line.split(/[-:]/)[0]?.trim() || line;
    }
    name = name.replace(/^[-•*–\s]+/, '').trim();
    if (!name) continue;

    const lower = (name + ' ' + line).toLowerCase();
    let category: 'Cakes' | 'Desserts' | 'Cookies' | 'Combos' = 'Cakes';
    if (lower.includes('cookie') || lower.includes('biscuit')) {
      category = 'Cookies';
    } else if (lower.includes('pastry') || lower.includes('cheesecake') || lower.includes('brownie') || lower.includes('dessert') || lower.includes('jar') || lower.includes('cupcake') || lower.includes('mousse')) {
      category = 'Desserts';
    } else if (lower.includes('combo') || lower.includes('box') || lower.includes('hamper')) {
      category = 'Combos';
    }

    const isPerKg = line.toLowerCase().includes('per kg');
    const isCustom = lower.includes('fondant') || lower.includes('theme') || lower.includes('custom') || lower.includes('design');

    items.push({
      name,
      description: isPerKg 
        ? `${name} — artisanal customization priced per kilogram.` 
        : `${name} — freshly handcrafted bake from Bake Factory.`,
      price,
      category,
      subcategory: isCustom ? 'Custom Design / Add-on' : '',
      available: true,
      bestSeller: false,
    });
  }

  return items;
}

/**
 * Extract menu items from raw text via Groq (OpenAI GPT-OSS-120B / Qwen 3.8-27B)
 */
export async function extractMenuFromText(menuText: string): Promise<ExtractedMenuItem[]> {
  try {
    // Primary model is gpt-oss-120b for superior text parsing and complex structured reasoning
    const modelsToTry = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];
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
              { role: 'user', content: `Please extract all menu items, add-ons, and priced offerings from this bakery text:\n\n${menuText}` },
            ],
            temperature: 0.1,
            max_tokens: 800,
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

    // If AI models return 0 items or encounter issues, run the heuristic parser
    const fallbackItems = heuristicMenuParser(menuText);
    if (fallbackItems.length > 0) {
      return fallbackItems;
    }

    if (lastError) throw lastError;
    return [];
  } catch (error) {
    console.error('Error in extractMenuFromText:', error);
    // Final fallback attempt before throwing
    const fallbackItems = heuristicMenuParser(menuText);
    if (fallbackItems.length > 0) {
      return fallbackItems;
    }
    throw error;
  }
}

/**
 * Extract menu items from a menu image via Groq Multimodal Vision (Qwen 3.8-27B)
 */
export async function extractMenuFromImage(base64Image: string): Promise<ExtractedMenuItem[]> {
  try {
    // Format base64 URL
    const imageUrl = base64Image.startsWith('data:') 
      ? base64Image 
      : `data:image/jpeg;base64,${base64Image}`;

    // Only vision-capable models can accept multimodal array content
    const modelsToTry = ['qwen/qwen3.8-27b'];
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
                  { type: 'text', text: 'Extract all products, names, categories, and prices from this bakery menu image into a structured JSON array:' },
                  { type: 'image_url', image_url: { url: imageUrl } },
                ],
              },
            ],
            temperature: 0.1,
            max_tokens: 800,
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
