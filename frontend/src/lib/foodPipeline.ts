const USER_AGENT = "HirkaniApp - iOS/Android - Version 1.0";
const COMMON_KEYWORDS = [
  "appy", "avocado", "orange", "juice", "milk", "cheese", "strawberry",
  "curd", "yogurt", "pizza", "burger", "caffeine", "coffee", "tea",
  "chocolate", "soda", "apple", "banana", "mango", "papaya", "guava",
  "peach", "pineapple", "coconut", "lemon", "lime", "spinach", "broccoli"
];

function parseIngredients(text: string): string[] {
  return text.split(/[,;.]/).map(p => p.trim()).filter(Boolean);
}

export async function barcodeStage(barcode: string) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, {
      headers: { "User-Agent": USER_AGENT }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const product = data.product || {};
    if (!product.product_name && !product.product_name_en) return null;

    const ingredientsText = product.ingredients_text || "";
    const nutriments = product.nutriments || {};

    const safeFloat = (val: any) => (val !== null && !isNaN(parseFloat(val))) ? parseFloat(val) : 0.0;

    return {
      detected_food: product.product_name || product.product_name_en || "Unknown Product",
      ingredients: parseIngredients(ingredientsText),
      nutrients: {
        sugar_g: safeFloat(nutriments.sugars_100g),
        sodium_mg: safeFloat(nutriments.sodium_100g) * 1000.0,
        caffeine_mg: safeFloat(nutriments.caffeine_100g),
        trans_fat_g: safeFloat(nutriments["trans-fat_100g"]),
        vitamin_a_mcg: safeFloat(nutriments["vitamin-a_100g"]),
      },
      additives: product.additives_tags || [],
      image_url: product.image_url || product.image_front_url || product.image_small_url || product.image_thumb_url,
      source: "openfoodfacts"
    };
  } catch (e) {
    return null;
  }
}

function expandQuery(query: string): string {
  const words = query.toLowerCase().split(" ");
  const expanded = [...words];
  for (const w of words) {
    const matches = COMMON_KEYWORDS.filter(k => k.includes(w) || w.includes(k));
    for (const m of matches) {
      if (!expanded.includes(m)) expanded.push(m);
    }
  }
  return expanded.join(" ");
}

function scoreAndFilterHits(hits: any[], query: string) {
  const queryTerms = query.toLowerCase().split(" ").filter(t => t.length > 1);
  const scored = hits.map(h => {
    const name = (h.product_name || h.product_name_en || "").toLowerCase();
    let score = h._score || 1.0;
    if (h.product_name_en) score *= 1.5;
    const termsMatched = queryTerms.reduce((acc, t) => acc + (name.includes(t) ? 1 : 0), 0);
    score *= (1.0 + (termsMatched * 5.0));
    if (String(h.code).startsWith("890")) score *= 3.0;
    if (h.image_small_url) score *= 1.2;
    return { score, hit: h };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.hit);
}

export async function searchStage(query: string) {
  try {
    const url = new URL("https://world.openfoodfacts.org/api/v2/search");
    url.searchParams.append("categories_tags_en", expandQuery(query));
    url.searchParams.append("fields", "product_name,product_name_en,code,image_url,image_small_url,image_thumb_url");
    url.searchParams.append("page_size", "20");

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": USER_AGENT }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const hits = data.products || [];
    if (hits.length === 0) {
      // Fallback to searching by product name if category tag fails
      const url2 = new URL("https://world.openfoodfacts.org/cgi/search.pl");
      url2.searchParams.append("search_terms", query);
      url2.searchParams.append("search_simple", "1");
      url2.searchParams.append("action", "process");
      url2.searchParams.append("json", "1");
      url2.searchParams.append("page_size", "20");
      const res2 = await fetch(url2.toString(), {
        headers: { "User-Agent": USER_AGENT }
      });
      if (res2.ok) {
        const data2 = await res2.json();
        const hits2 = data2.products || [];
        if (hits2.length > 0) {
           const ranked2 = scoreAndFilterHits(hits2, query);
           if (ranked2.length > 0) return await barcodeStage(ranked2[0].code);
        }
      }
      return null;
    }

    const ranked = scoreAndFilterHits(hits, query);
    if (ranked.length === 0) return null;

    const barcode = ranked[0].code;
    if (!barcode) return null;
    return await barcodeStage(barcode);
  } catch (e) {
    return null;
  }
}

export async function autocompleteStage(query: string) {
  try {
    // We use the cgi search for autocomplete as it searches across names better than v2 categories
    const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
    url.searchParams.append("search_terms", query);
    url.searchParams.append("search_simple", "1");
    url.searchParams.append("action", "process");
    url.searchParams.append("json", "1");
    url.searchParams.append("page_size", "20");
    
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": USER_AGENT }
    });
    if (!res.ok) return [];
    const data = await res.json();
    const hits = data.products || [];
    const ranked = scoreAndFilterHits(hits, query);

    const results = [];
    const seenNames = new Set();
    for (const p of ranked) {
      const name = p.product_name || p.product_name_en;
      if (name && !seenNames.has(name.toLowerCase())) {
        seenNames.add(name.toLowerCase());
        results.push({
          name,
          image: p.image_small_url || p.image_thumb_url || p.image_url,
          code: p.code
        });
        if (results.length >= 6) break;
      }
    }
    return results;
  } catch (e) {
    return [];
  }
}
