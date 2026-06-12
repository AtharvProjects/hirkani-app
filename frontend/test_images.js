const https = require('https');

const checkUrl = (url) => new Promise((resolve) => {
  https.get(url, (res) => {
    resolve({ url, status: res.statusCode, contentType: res.headers['content-type'] });
  }).on('error', () => resolve({ url, status: 500 }));
});

const urls = [
  "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&q=80", // Spinach (current)
  "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80", // Sweet Potato (current)
  "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500&q=80", // Broccoli (current)
  "https://images.unsplash.com/photo-1533036665792-628d002ff2c3?w=500&q=80", // Raw sprouts
  "https://images.unsplash.com/photo-1564149504298-00c351fd7f16?w=500&q=80", // Yogurt
  "https://images.unsplash.com/photo-1618164435735-42ce3d77d704?w=500&q=80", // Cheddar
  "https://images.unsplash.com/photo-1631379578036-749e4e64f7b2?w=500&q=80", // Brie
  "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&q=80", // Almond milk
  "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&q=80", // Prenatal
  "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80", // Folic
  "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80", // Iron
  "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&q=80"  // Vitamin A
];

Promise.all(urls.map(checkUrl)).then(console.log);
