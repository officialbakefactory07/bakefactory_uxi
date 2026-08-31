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
    "price": 250 (number in INR ₹, default to 150 if missing),
    "category": "Cakes" | "Desserts" | "Cookies" | "Combos",
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

/**
 * Extract menu items from raw text via Groq Llama 3.3
 */
export async function extractMenuFromText(menuText: string): Promise<ExtractedMenuItem[]> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Please extract all menu items from this bakery text:\n\n${menuText}` },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '[]';
    
    // Parse JSON safely
    const parsed = JSON.parse(rawContent);
    const items = Array.isArray(parsed) ? parsed : (parsed.items || parsed.menu || parsed.products || []);
    return items;
  } catch (error) {
    console.error('Error in extractMenuFromText:', error);
    throw error;
  }
}

/**
 * Extract menu items from a menu image via Groq Vision Llama 3.2
 */
export async function extractMenuFromImage(base64Image: string): Promise<ExtractedMenuItem[]> {
  try {
    // Format base64 URL
    const imageUrl = base64Image.startsWith('data:') 
      ? base64Image 
      : `data:image/jpeg;base64,${base64Image}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.2-11b-vision-preview',
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
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq Vision error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '[]';

    // Extract JSON block if wrapped in markdown
    const jsonMatch = rawContent.match(/\[[\s\S]*\]/) || rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return Array.isArray(parsed) ? parsed : (parsed.items || parsed.menu || parsed.products || []);
    }

    return [];
  } catch (error) {
    console.error('Error in extractMenuFromImage:', error);
    throw error;
  }
}
