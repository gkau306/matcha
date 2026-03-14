const db = require('./db');

const cafes = [
  {
    id: 1,
    name: 'Cha Cha Matcha',
    city: 'New York',
    address: '373 Broome St, New York, NY 10013',
    neighborhood: 'SoHo',
    description: 'Iconic NYC matcha bar known for vibrant ceremonial-grade drinks and pastel aesthetics.',
    long_description: 'Cha Cha Matcha pioneered the matcha café scene in New York. Their ceremonial-grade sourcing from Uji, Japan shines through in every sip — a clean, grassy sweetness with no bitterness. The iced matcha latte with oat milk is a city staple. Expect a wait on weekends but it is absolutely worth it.',
    image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
    secondary_images: [
      'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&q=80',
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80'
    ],
    matcha_quality: 'exceptional',
    price_range: '$$',
    tags: ['ceremonial grade', 'oat milk', 'iced', 'sweet', 'smooth', 'no bitterness', 'uji japan', 'iconic'],
    flavors: ['classic matcha', 'matcha latte', 'iced matcha', 'matcha soft serve', 'strawberry matcha'],
    vibe: ['trendy', 'instagrammable', 'social', 'bright', 'modern'],
    rating: 4.6,
    review_count: 1240,
    website: 'https://chachamatcha.com',
    instagram: '@chachamatcha'
  },
  {
    id: 2,
    name: 'Kettl Tea',
    city: 'New York',
    address: '231 Front St, Brooklyn, NY 11201',
    neighborhood: 'DUMBO',
    description: 'Serious Japanese tea house importing direct from small farms. Not sweet — purely ceremonial.',
    long_description: 'Kettl is for the matcha purist. Zero added sugar, no milk options unless you ask — just pristine stone-ground tencha from Kagoshima and Kyoto. The umami depth here is unlike anything else in the city. Their single-origin flights let you taste the terroir differences between regions. Quiet, meditative space.',
    image_url: 'https://images.unsplash.com/photo-1582793988951-9aed5509eb97?w=800&q=80',
    secondary_images: [
      'https://images.unsplash.com/photo-1567922045116-2a00fae2ed03?w=800&q=80'
    ],
    matcha_quality: 'exceptional',
    price_range: '$$$',
    tags: ['ceremonial grade', 'single origin', 'no sugar', 'pure', 'umami', 'earthy', 'traditional', 'kagoshima', 'kyoto', 'purist', 'bitter', 'complex'],
    flavors: ['ceremonial matcha', 'koicha thick matcha', 'usucha thin matcha', 'cold brew matcha', 'matcha flight'],
    vibe: ['quiet', 'meditative', 'serious', 'minimalist', 'zen', 'intimate'],
    rating: 4.9,
    review_count: 387,
    website: 'https://kettl.co',
    instagram: '@kettltea'
  },
  {
    id: 3,
    name: 'Maru Coffee',
    city: 'Los Angeles',
    address: '1936 Hillhurst Ave, Los Angeles, CA 90027',
    neighborhood: 'Los Feliz',
    description: 'LA coffee institution that takes its matcha as seriously as espresso. Clean and architectural.',
    long_description: 'Maru is a beautifully designed space with matcha that matches its aesthetic — precise, clean, unfussy. Their matcha latte uses a blend of ceremonial-grade powder whisked to order with a touch of house-made vanilla oat milk. Slightly sweet, never cloying. Their hojicha counterpart is equally stellar.',
    image_url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80',
    secondary_images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&q=80'
    ],
    matcha_quality: 'exceptional',
    price_range: '$$',
    tags: ['ceremonial grade', 'oat milk', 'vanilla', 'slightly sweet', 'smooth', 'architectural', 'precise', 'hojicha'],
    flavors: ['matcha latte', 'iced matcha', 'hojicha latte', 'matcha tonic', 'vanilla matcha'],
    vibe: ['minimal', 'architectural', 'cool', 'design-forward', 'LA aesthetic'],
    rating: 4.7,
    review_count: 892,
    website: 'https://marucoffee.com',
    instagram: '@marucoffee'
  },
  {
    id: 4,
    name: 'Café Tetra',
    city: 'San Francisco',
    address: '767 Valencia St, San Francisco, CA 94110',
    neighborhood: 'Mission District',
    description: 'Mission staple blending Japanese technique with SF coffee culture. Milky, balanced lattes.',
    long_description: 'Tetra found the sweet spot between coffee-bar efficiency and Japanese tea ritual. Their iced matcha latte — made with whole milk and just a half-pump of vanilla — is the most balanced and milky matcha in the Bay. Not too grassy, not too sweet. Perfect gateway matcha for anyone converting from coffee.',
    image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
    secondary_images: [
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80'
    ],
    matcha_quality: 'good',
    price_range: '$$',
    tags: ['milky', 'balanced', 'whole milk', 'slightly sweet', 'vanilla', 'gateway', 'iced', 'smooth', 'approachable'],
    flavors: ['matcha latte', 'iced matcha', 'matcha cortado', 'oat milk matcha', 'dirty matcha'],
    vibe: ['neighbourhood', 'casual', 'warm', 'approachable', 'local'],
    rating: 4.4,
    review_count: 654,
    instagram: '@cafetetra'
  },
  {
    id: 5,
    name: 'Isshiki Matcha',
    city: 'Los Angeles',
    address: '2130 Sawtelle Blvd, Los Angeles, CA 90025',
    neighborhood: 'Sawtelle',
    description: 'Japanese-run specialty matcha bar on Sawtelle. Inventive drinks, ceremonial quality, serious craft.',
    long_description: "Isshiki is the real deal on LA's Sawtelle corridor. Run by Japanese founders who import directly, the base matcha has that vivid electric green and deep vegetal umami. Their seasonal specials — like strawberry jam matcha or black sesame matcha — layer flavors without masking the tea. The hojicha soft serve alone is worth the trip.",
    image_url: 'https://images.unsplash.com/photo-1582793988951-9aed5509eb97?w=800&q=80',
    secondary_images: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80',
      'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80'
    ],
    matcha_quality: 'exceptional',
    price_range: '$$',
    tags: ['ceremonial grade', 'seasonal specials', 'black sesame', 'strawberry', 'inventive', 'umami', 'electric green', 'japanese-run', 'direct import', 'soft serve', 'hojicha'],
    flavors: ['classic matcha', 'strawberry matcha', 'black sesame matcha', 'hojicha', 'seasonal matcha', 'matcha soft serve'],
    vibe: ['authentic', 'specialty', 'creative', 'japanese', 'sawtelle'],
    rating: 4.8,
    review_count: 521,
    instagram: '@isshikimatcha'
  },
  {
    id: 6,
    name: 'Ippodo Tea',
    city: 'New York',
    address: '125 E 39th St, New York, NY 10016',
    neighborhood: 'Midtown',
    description: '300-year-old Kyoto tea house, New York outpost. The most traditional, austere matcha experience in America.',
    long_description: 'Ippodo has been selling tea in Kyoto since 1717. Their New York outpost carries that same reverence. This is not a latte destination — it is a bowl of whisked matcha, served with a wagashi sweet, in near silence. The Ummon grade is transcendent: deep, savory, lingering. Come here when you want to understand what matcha actually is.',
    image_url: 'https://images.unsplash.com/photo-1567922045116-2a00fae2ed03?w=800&q=80',
    secondary_images: [
      'https://images.unsplash.com/photo-1582793988951-9aed5509eb97?w=800&q=80'
    ],
    matcha_quality: 'exceptional',
    price_range: '$$$',
    tags: ['300 years old', 'kyoto', 'traditional', 'ceremonial', 'wagashi', 'no milk', 'purist', 'savory', 'umami', 'deep', 'historical', 'austere', 'whisked to order'],
    flavors: ['usucha', 'koicha', 'cold matcha', 'seasonal ceremonial'],
    vibe: ['silent', 'reverent', 'traditional', 'historic', 'meditative', 'japanese'],
    rating: 4.9,
    review_count: 203,
    website: 'https://ippodotea.com',
    instagram: '@ippodoteany'
  },
  {
    id: 7,
    name: 'Matcha Cafe Maiko',
    city: 'Chicago',
    address: '1029 W Belmont Ave, Chicago, IL 60657',
    neighborhood: 'Lakeview',
    description: "Chicago's cheerful matcha destination. Sweet, milky drinks and excellent matcha soft serve.",
    long_description: 'Maiko brings Osaka energy to Chicago — colorful, fun, unabashedly sweet. Their matcha soft serve is perfectly overrun and creamy with a clean finish. Drinks lean milky and sweet, which makes it an ideal introduction for matcha newcomers. The red bean matcha parfait is a must-order.',
    image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80',
    secondary_images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80'
    ],
    matcha_quality: 'good',
    price_range: '$',
    tags: ['sweet', 'milky', 'soft serve', 'red bean', 'parfait', 'fun', 'colorful', 'dessert', 'accessible', 'beginner-friendly'],
    flavors: ['matcha soft serve', 'matcha latte', 'red bean matcha parfait', 'matcha kakigori', 'matcha milk tea'],
    vibe: ['fun', 'colorful', 'sweet', 'casual', 'dessert-focused'],
    rating: 4.3,
    review_count: 789,
    instagram: '@matchacafemaiko'
  },
  {
    id: 8,
    name: 'Seven Grams Caffe',
    city: 'Seattle',
    address: '609 E Pine St, Seattle, WA 98122',
    neighborhood: 'Capitol Hill',
    description: 'Pacific Northwest specialty cafe treating matcha with the same rigor as pour-over coffee.',
    long_description: 'In a city that takes craft seriously, Seven Grams applies coffee-shop precision to matcha. They weigh every dose, water temperature is exact, and the whisking technique is taught to every barista. Their matcha oat latte is creamy, earthy, and complex — not sweet unless you ask. Their hojicha cold brew is one of the most interesting drinks in Seattle.',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    secondary_images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80'
    ],
    matcha_quality: 'exceptional',
    price_range: '$$',
    tags: ['precise', 'specialty', 'earthy', 'complex', 'not sweet', 'oat milk', 'cold brew', 'hojicha', 'craft', 'coffee-influenced', 'northwest'],
    flavors: ['matcha oat latte', 'hojicha cold brew', 'matcha espresso', 'straight matcha', 'matcha tonic'],
    vibe: ['specialty', 'serious', 'crafted', 'hip', 'northwest'],
    rating: 4.7,
    review_count: 445,
    instagram: '@sevengrams'
  },
  {
    id: 9,
    name: 'Samovar Tea Lounge',
    city: 'San Francisco',
    address: '730 Howard St, San Francisco, CA 94103',
    neighborhood: 'SoMa',
    description: 'Relaxed tea sanctuary in SoMa with excellent ceremonial matcha and thoughtful food pairings.',
    long_description: 'Samovar is the antidote to rush culture. Their matcha preparation is slow and intentional — stone-ground ceremonial powder, 175°F water, a real chasen. The result is silky, complex, slightly sweet from the tea itself with zero additives. Pair it with their matcha financiers or mochi. A great place to work or just exhale.',
    image_url: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&q=80',
    secondary_images: [
      'https://images.unsplash.com/photo-1567922045116-2a00fae2ed03?w=800&q=80'
    ],
    matcha_quality: 'exceptional',
    price_range: '$$',
    tags: ['ceremonial', 'slow', 'intentional', 'silky', 'chasen', 'stone-ground', 'no additives', 'food pairing', 'mochi', 'financiers', 'relaxed', 'work-friendly'],
    flavors: ['ceremonial matcha', 'matcha latte', 'hojicha', 'seasonal tea'],
    vibe: ['relaxed', 'sanctuary', 'slow', 'cozy', 'work-friendly', 'calm'],
    rating: 4.5,
    review_count: 312,
    website: 'https://samovarlife.com',
    instagram: '@samovar'
  },
  {
    id: 10,
    name: 'Tsujiri',
    city: 'Los Angeles',
    address: '130 Japanese Village Plaza Mall, Los Angeles, CA 90012',
    neighborhood: 'Little Tokyo',
    description: '160-year-old Kyoto institution with LA outpost. Premium ceremonial matcha meets Japanese dessert culture.',
    long_description: 'Tsujiri has been in Kyoto since 1860. Their Little Tokyo outpost is a gateway into serious Japanese matcha culture. The Uji matcha soft serve is extraordinary — clean, bitter-sweet balance, vivid color. Their parfaits layer houjicha jelly, azuki beans, and mochi in ways that are both familiar and surprising. Authentic without being inaccessible.',
    image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
    secondary_images: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80'
    ],
    matcha_quality: 'exceptional',
    price_range: '$$',
    tags: ['uji', 'kyoto', '160 years', 'soft serve', 'parfait', 'azuki', 'mochi', 'hojicha', 'bitter-sweet', 'authentic', 'little tokyo', 'dessert'],
    flavors: ['uji matcha soft serve', 'matcha parfait', 'matcha latte', 'hojicha latte', 'matcha kakigori', 'red bean matcha'],
    vibe: ['authentic', 'japanese', 'dessert-focused', 'cultural', 'heritage'],
    rating: 4.7,
    review_count: 967,
    instagram: '@tsujiri_us'
  },
  {
    id: 11,
    name: 'Panther Coffee',
    city: 'Miami',
    address: '2390 NW 2nd Ave, Miami, FL 33127',
    neighborhood: 'Wynwood',
    description: "Miami's beloved specialty roaster with a matcha program that rivals their coffee. Bright and tropical.",
    long_description: 'Panther is famous for coffee but their matcha is a hidden gem. A vibrant Uji-grade powder served over ice with coconut milk creates something tropical and unusual — lightly sweet, creamy without being heavy, and that vivid electric green color. Perfect Miami drink. The coconut matcha here is an institution.',
    image_url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80',
    secondary_images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
    ],
    matcha_quality: 'good',
    price_range: '$$',
    tags: ['coconut milk', 'tropical', 'iced', 'sweet', 'creamy', 'electric green', 'uji', 'specialty', 'miami', 'wynwood'],
    flavors: ['coconut matcha', 'iced matcha', 'matcha latte', 'oat matcha', 'dirty matcha'],
    vibe: ['vibrant', 'tropical', 'art-district', 'energetic', 'cool'],
    rating: 4.5,
    review_count: 732,
    website: 'https://panthercoffee.com',
    instagram: '@panthercoffee'
  },
  {
    id: 12,
    name: 'Blueprint Coffee',
    city: 'St. Louis',
    address: '6225 Delmar Blvd, St. Louis, MO 63130',
    neighborhood: 'The Loop',
    description: 'Midwest specialty coffee leader with a matcha menu that punches above its weight class.',
    long_description: "Blueprint is proof that exceptional matcha is not confined to coastal cities. Their imported ceremonial-grade powder is handled with the same care as their single-origin coffee. The iced matcha with oat milk is clean, slightly vegetal, and has none of the artificial sweetness that plagues chain alternatives. Their staff can answer detailed questions about the tea's origin.",
    image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
    secondary_images: [],
    matcha_quality: 'good',
    price_range: '$$',
    tags: ['ceremonial grade', 'oat milk', 'clean', 'vegetal', 'knowledgeable staff', 'midwest', 'no artificial sweetness', 'specialty'],
    flavors: ['iced matcha latte', 'hot matcha latte', 'matcha oat', 'hojicha'],
    vibe: ['serious', 'knowledgeable', 'midwest', 'local-beloved', 'craft'],
    rating: 4.6,
    review_count: 289,
    website: 'https://blueprintcoffee.com',
    instagram: '@blueprintcoffee'
  }
];

const reviews = [
  { id: 1, cafe_id: 1, author: 'maya r.', body: 'The strawberry matcha changed my life. Sweet without being cloying. The oat milk perfectly complements the ceremonial grade powder. Will be back weekly.', rating: 5, tags: ['sweet', 'oat milk', 'strawberry'] },
  { id: 2, cafe_id: 1, author: 'alex t.', body: 'Good matcha but the line is long on weekends. Quality is consistent. The iced version is superior to the hot.', rating: 4, tags: ['iced', 'crowded', 'consistent'] },
  { id: 3, cafe_id: 2, author: 'james w.', body: 'This is what matcha is supposed to taste like. No sugar, no milk, just pure stone-ground tencha. The single-origin flight revealed how different Kagoshima and Kyoto taste. Revelatory.', rating: 5, tags: ['pure', 'no sugar', 'single origin', 'educational'] },
  { id: 4, cafe_id: 2, author: 'soo y.', body: 'Expensive but worth it for the quality. Not for the sweet-tooth crowd. Come here to learn about matcha, not to have a milky latte.', rating: 5, tags: ['expensive', 'purist', 'educational'] },
  { id: 5, cafe_id: 3, author: 'claire m.', body: 'The space is stunning and the matcha lives up to it. Perfectly balanced, whisked to order. The vanilla oat version is a 10/10.', rating: 5, tags: ['vanilla', 'oat milk', 'balanced'] },
  { id: 6, cafe_id: 4, author: 'daniel k.', body: 'Best gateway matcha in SF. Introduced three coffee-loving friends who all converted. The milky, slightly sweet balance is perfect.', rating: 4, tags: ['milky', 'sweet', 'gateway', 'beginner'] },
  { id: 7, cafe_id: 5, author: 'hana l.', body: "The black sesame matcha is one of the most interesting drinks I've ever had. Rich, nutty, earthy. Isshiki really gets flavor pairing.", rating: 5, tags: ['black sesame', 'inventive', 'earthy'] },
  { id: 8, cafe_id: 6, author: 'tom f.', body: "Walking into Ippodo feels like stepping into Kyoto. The wagashi pairing is perfect. This is not fast food matcha — it's a ceremony.", rating: 5, tags: ['traditional', 'wagashi', 'kyoto', 'ceremony'] },
  { id: 9, cafe_id: 7, author: 'priya s.', body: 'The soft serve alone is worth the visit. Creamy, green, perfect. The red bean parfait is an experience. Great place to bring matcha beginners.', rating: 4, tags: ['soft serve', 'dessert', 'red bean', 'fun'] },
  { id: 10, cafe_id: 8, author: 'noah p.', body: 'Coffee nerds will appreciate the precision here. They weigh doses and track water temp. The matcha is complex and earthy — not for the faint of heart.', rating: 5, tags: ['precise', 'earthy', 'complex', 'craft'] },
  { id: 11, cafe_id: 9, author: 'lily h.', body: 'A true sanctuary. I come here to decompress. The slow preparation is meditative and the matcha is silky. The financiers are an excellent pairing.', rating: 5, tags: ['relaxing', 'silky', 'slow', 'pairing'] },
  { id: 12, cafe_id: 10, author: 'kevin c.', body: 'The Uji soft serve is electric green and genuinely complex. Bitter-sweet in the best way. The parfait is Instagram gold but also genuinely delicious.', rating: 5, tags: ['uji', 'soft serve', 'bitter-sweet', 'parfait'] },
  { id: 13, cafe_id: 11, author: 'zoe r.', body: 'Coconut matcha in Miami heat = perfection. Light, tropical, creamy. This is exactly what matcha should taste like in a warm climate.', rating: 5, tags: ['coconut', 'tropical', 'creamy', 'refreshing'] }
];

// Reset and seed
db.set('cafes', cafes).set('reviews', reviews).set('_nextCafeId', cafes.length + 1).set('_nextReviewId', reviews.length + 1).write();
console.log(`Seeded ${cafes.length} cafes and ${reviews.length} reviews.`);
