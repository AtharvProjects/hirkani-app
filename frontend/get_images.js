const https = require('https');

function getUnsplash(query) {
  return new Promise((resolve) => {
    https.get(`https://unsplash.com/s/photos/${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        // Extract all photo URLs
        const matches = data.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+/g);
        if (matches) {
          // Uniq matches
          const unique = [...new Set(matches)];
          resolve({ query, url: unique[0] + '?w=500&q=80' });
        } else {
          resolve({ query, url: null });
        }
      });
    }).on('error', () => resolve({ query, url: null }));
  });
}

async function main() {
  const queries = [
    "sweet-potato",
    "bean-sprouts",
    "yogurt",
    "cheddar-cheese",
    "brie-cheese",
    "almond-milk",
    "vitamin-pill",
    "iron-supplement"
  ];
  for (const q of queries) {
    const res = await getUnsplash(q);
    console.log(res);
  }
}
main();
