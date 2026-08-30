// Master parts database with CUSTOMER pricing
export const PARTS_DB = {
  cpu: [
    { name: 'AMD Ryzen 5 5500',    price: 99.99,  tags: ['AM4', 'DDR4'], brand: 'AMD', platform: 'AM4', ram_type: 'DDR4', cores: 6,  tdp: 65,  tier: 1 },
    { name: 'AMD Ryzen 5 5600',    price: 169.99, tags: ['AM4', 'DDR4'], brand: 'AMD', platform: 'AM4', ram_type: 'DDR4', cores: 6,  tdp: 65,  tier: 2 },
    { name: 'AMD Ryzen 5 5600XT',  price: 189.99, tags: ['AM4', 'DDR4'], brand: 'AMD', platform: 'AM4', ram_type: 'DDR4', cores: 6,  tdp: 65,  tier: 3 },
    { name: 'AMD Ryzen 5 5600X',   price: 209.99, tags: ['AM4', 'DDR4'], brand: 'AMD', platform: 'AM4', ram_type: 'DDR4', cores: 6,  tdp: 65,  tier: 4 },
    { name: 'AMD Ryzen 7 5800X',   price: 249.99, tags: ['AM4', 'DDR4'], brand: 'AMD', platform: 'AM4', ram_type: 'DDR4', cores: 8,  tdp: 105, tier: 5 },
    { name: 'AMD Ryzen 7 5800XT',  price: 259.99, tags: ['AM4', 'DDR4'], brand: 'AMD', platform: 'AM4', ram_type: 'DDR4', cores: 8,  tdp: 105, tier: 6 },
    { name: 'AMD Ryzen 5 7500F',   price: 179.99, tags: ['AM5', 'DDR5'], brand: 'AMD', platform: 'AM5', ram_type: 'DDR5', cores: 6,  tdp: 65,  tier: 1 },
    { name: 'AMD Ryzen 5 7600X',   price: 189.99, tags: ['AM5', 'DDR5'], brand: 'AMD', platform: 'AM5', ram_type: 'DDR5', cores: 6,  tdp: 105, tier: 2 },
    { name: 'AMD Ryzen 5 9600X',   price: 209.99, tags: ['AM5', 'DDR5'], brand: 'AMD', platform: 'AM5', ram_type: 'DDR5', cores: 6,  tdp: 65,  tier: 3 },
    { name: 'AMD Ryzen 7 7700X',   price: 289.99, tags: ['AM5', 'DDR5'], brand: 'AMD', platform: 'AM5', ram_type: 'DDR5', cores: 8,  tdp: 105, tier: 4 },
    { name: 'AMD Ryzen 7 9700X',   price: 349.99, tags: ['AM5', 'DDR5'], brand: 'AMD', platform: 'AM5', ram_type: 'DDR5', cores: 8,  tdp: 65,  tier: 5 },
    { name: 'AMD Ryzen 9 9900X',   price: 399.99, tags: ['AM5', 'DDR5'], brand: 'AMD', platform: 'AM5', ram_type: 'DDR5', cores: 12, tdp: 120, tier: 6 },
    { name: 'AMD Ryzen 7 7800X3D', price: 439.99, tags: ['AM5', 'DDR5'], brand: 'AMD', platform: 'AM5', ram_type: 'DDR5', cores: 8,  tdp: 120, tier: 7 },
    { name: 'AMD Ryzen 7 9800X3D', price: 489.99, tags: ['AM5', 'DDR5'], brand: 'AMD', platform: 'AM5', ram_type: 'DDR5', cores: 8,  tdp: 120, tier: 8 },
    { name: 'AMD Ryzen 9 9950X',   price: 649.99, tags: ['AM5', 'DDR5'], brand: 'AMD', platform: 'AM5', ram_type: 'DDR5', cores: 16, tdp: 170, tier: 9 },
    { name: 'AMD Ryzen 9 9950X3D', price: 739.99, tags: ['AM5', 'DDR5'], brand: 'AMD', platform: 'AM5', ram_type: 'DDR5', cores: 16, tdp: 170, tier: 10 },
  ],
  gpu: [
    { name: 'Intel Arc B570',                          price: 289.99,  tags: ['AM4','AM5'], brand: 'Intel',  color: 'neutral', tier: 1,  tdp: 120, min_psu: 550, length_mm: 250 },
    { name: 'NVIDIA GeForce RTX 5050',                 price: 319.99,  tags: ['AM4','AM5'], brand: 'NVIDIA', color: 'neutral', tier: 2,  tdp: 130, min_psu: 550, length_mm: 250 },
    { name: 'Intel Arc B580',                          price: 349.99,  tags: ['AM4','AM5'], brand: 'Intel',  color: 'neutral', tier: 3,  tdp: 190, min_psu: 650, length_mm: 270 },
    { name: 'Intel Arc B580 (White)',                  price: 349.99,  tags: ['AM4','AM5'], brand: 'Intel',  color: 'white',   tier: 3,  tdp: 190, min_psu: 650, length_mm: 270 },
    { name: 'AMD Radeon RX 9060 XT 8GB (White)',       price: 389.99,  tags: ['AM4','AM5'], brand: 'AMD',    color: 'white',   tier: 4,  tdp: 150, min_psu: 650, length_mm: 260 },
    { name: 'AMD Radeon RX 9060 XT 8GB',               price: 399.99,  tags: ['AM4','AM5'], brand: 'AMD',    color: 'neutral', tier: 4,  tdp: 150, min_psu: 650, length_mm: 260 },
    { name: 'NVIDIA GeForce RTX 5060',                 price: 399.99,  tags: ['AM4','AM5'], brand: 'NVIDIA', color: 'neutral', tier: 5,  tdp: 150, min_psu: 650, length_mm: 240 },
    { name: 'NVIDIA GeForce RTX 5060 (White)',         price: 399.99,  tags: ['AM4','AM5'], brand: 'NVIDIA', color: 'white',   tier: 5,  tdp: 150, min_psu: 650, length_mm: 240 },
    { name: 'NVIDIA GeForce RTX 5060 TI 8GB',         price: 419.99,  tags: ['AM4','AM5'], brand: 'NVIDIA', color: 'neutral', tier: 6,  tdp: 180, min_psu: 650, length_mm: 260 },
    { name: 'AMD Radeon RX 7700 XT',                   price: 459.99,  tags: ['AM4','AM5'], brand: 'AMD',    color: 'neutral', tier: 7,  tdp: 190, min_psu: 700, length_mm: 275 },
    { name: 'AMD Radeon RX 7700 XT (White)',            price: 469.99,  tags: ['AM4','AM5'], brand: 'AMD',    color: 'white',   tier: 7,  tdp: 190, min_psu: 700, length_mm: 275 },
    { name: 'AMD Radeon RX 9060 XT',                   price: 499.99,  tags: ['AM4','AM5'], brand: 'AMD',    color: 'neutral', tier: 8,  tdp: 150, min_psu: 650, length_mm: 260 },
    { name: 'AMD Radeon RX 9060 XT (White)',            price: 519.99,  tags: ['AM4','AM5'], brand: 'AMD',    color: 'white',   tier: 8,  tdp: 150, min_psu: 650, length_mm: 260 },
    { name: 'NVIDIA GeForce RTX 5060 TI 16GB',        price: 629.99,  tags: ['AM4','AM5'], brand: 'NVIDIA', color: 'neutral', tier: 9,  tdp: 180, min_psu: 700, length_mm: 260 },
    { name: 'NVIDIA GeForce RTX 5060 TI 16GB (White)',price: 649.99,  tags: ['AM4','AM5'], brand: 'NVIDIA', color: 'white',   tier: 9,  tdp: 180, min_psu: 700, length_mm: 260 },
    { name: 'AMD Radeon RX 9070',                      price: 659.99,  tags: ['AM4','AM5'], brand: 'AMD',    color: 'neutral', tier: 10, tdp: 220, min_psu: 750, length_mm: 300 },
    { name: 'AMD Radeon RX 9070 (White)',               price: 689.99,  tags: ['AM4','AM5'], brand: 'AMD',    color: 'white',   tier: 10, tdp: 220, min_psu: 750, length_mm: 300 },
    { name: 'NVIDIA GeForce RTX 5070',                 price: 709.99,  tags: ['AM4','AM5'], brand: 'NVIDIA', color: 'neutral', tier: 11, tdp: 200, min_psu: 750, length_mm: 310 },
    { name: 'NVIDIA GeForce RTX 5070 (White)',         price: 729.99,  tags: ['AM4','AM5'], brand: 'NVIDIA', color: 'white',   tier: 11, tdp: 200, min_psu: 750, length_mm: 310 },
    { name: 'AMD Radeon RX 9070 XT',                   price: 739.99,  tags: ['AM4','AM5'], brand: 'AMD',    color: 'neutral', tier: 12, tdp: 280, min_psu: 800, length_mm: 320 },
    { name: 'AMD Radeon RX 9070 XT (White)',            price: 799.99,  tags: ['AM4','AM5'], brand: 'AMD',    color: 'white',   tier: 12, tdp: 280, min_psu: 800, length_mm: 320 },
    { name: 'NVIDIA GeForce RTX 5070 TI',              price: 1079.99, tags: ['AM4','AM5'], brand: 'NVIDIA', color: 'neutral', tier: 13, tdp: 300, min_psu: 850, length_mm: 340 },
    { name: 'NVIDIA GeForce RTX 5070 TI (White)',      price: 1139.99, tags: ['AM4','AM5'], brand: 'NVIDIA', color: 'white',   tier: 13, tdp: 300, min_psu: 850, length_mm: 340 },
    { name: 'NVIDIA GeForce RTX 5080',                 price: 1419.99, tags: ['AM4','AM5'], brand: 'NVIDIA', color: 'neutral', tier: 14, tdp: 360, min_psu: 850, length_mm: 360 },
    { name: 'NVIDIA GeForce RTX 5080 (White)',         price: 1619.99, tags: ['AM4','AM5'], brand: 'NVIDIA', color: 'white',   tier: 14, tdp: 360, min_psu: 850, length_mm: 360 },
  ],
  ram: [
    { name: '16GB DDR4',  price: 129.99, tags: ['DDR4'] },
    { name: '32GB DDR4',  price: 249.99, tags: ['DDR4'] },
    { name: '64GB DDR4',  price: 579.99, tags: ['DDR4'] },
    { name: '16GB DDR5',  price: 259.99, tags: ['DDR5'] },
    { name: '32GB DDR5',  price: 469.99, tags: ['DDR5'] },
    { name: '64GB DDR5',  price: 929.99, tags: ['DDR5'] },
  ],
  storage: [
    { name: '1TB M.2 SSD',  price: 189.99, tags: ['AM4','AM5'] },
    { name: '2TB M.2 SSD',  price: 299.99, tags: ['AM4','AM5'] },
    { name: '4TB M.2 SSD',  price: 519.99, tags: ['AM4','AM5'] },
  ],
  motherboard: [
    { name: 'Gigabyte B550M K',                        price: 109.99, tags: ['AM4','DDR4','mATX'], color: 'neutral' },
    { name: 'Asus B650-PLUS WIFI',                     price: 129.99, tags: ['AM5','DDR5','ATX'],  color: 'neutral' },
    { name: 'MSI PRO B850-S WIFI6E',                   price: 179.99, tags: ['AM5','DDR5','ATX'],  color: 'neutral' },
    { name: 'Asus B650E MAX GAMING WIFI (White)',       price: 179.99, tags: ['AM5','DDR5','ATX'],  color: 'white'   },
    { name: 'ASRock Phantom Gaming X870 Riptide WiFi', price: 209.99, tags: ['AM5','DDR5','ATX'],  color: 'neutral' },
    { name: 'ASRock X870 Pro RS WiFi (White)',          price: 209.99, tags: ['AM5','DDR5','ATX'],  color: 'white'   },
    { name: 'Gigabyte B850 AORUS ELITE WIFI7',         price: 239.99, tags: ['AM5','DDR5','ATX'],  color: 'neutral' },
    { name: 'Gigabyte X870 AORUS ELITE WIFI7',         price: 259.99, tags: ['AM5','DDR5','ATX'],  color: 'neutral' },
    { name: 'Gigabyte B850 AORUS ELITE WIFI7 ICE (White)', price: 269.99, tags: ['AM5','DDR5','ATX'], color: 'white' },
    { name: 'Asus ROG STRIX X870-A GAMING WIFI (White)', price: 299.99, tags: ['AM5','DDR5','ATX'], color: 'white' },
  ],
  cooler: [
    { name: 'Stock AMD Cooler',                  price: 5.00,   tags: ['AM4','AM5','mATX','ATX'], color: 'neutral', type: 'air',     max_tdp: 65,  aio_size: '0'    },
    { name: 'Single Tower Air Cooler',           price: 29.99,  tags: ['AM4','AM5','mATX','ATX'], color: 'neutral', type: 'air',     max_tdp: 100, aio_size: '0'    },
    { name: 'Single Tower Air Cooler (White)',   price: 29.99,  tags: ['AM4','AM5','mATX','ATX'], color: 'white',   type: 'air',     max_tdp: 100, aio_size: '0'    },
    { name: 'Dual Tower Air Cooler',             price: 49.99,  tags: ['AM4','AM5','mATX','ATX'], color: 'neutral', type: 'air',     max_tdp: 150, aio_size: '0'    },
    { name: 'Dual Tower Air Cooler (White)',     price: 49.99,  tags: ['AM4','AM5','mATX','ATX'], color: 'white',   type: 'air',     max_tdp: 150, aio_size: '0'    },
    { name: '240mm AIO',                         price: 79.99,  tags: ['AM4','AM5','mATX','ATX'], color: 'neutral', type: 'aio',     max_tdp: 170, aio_size: '240mm' },
    { name: '240mm AIO (White)',                 price: 89.99,  tags: ['AM4','AM5','mATX','ATX'], color: 'white',   type: 'aio',     max_tdp: 170, aio_size: '240mm' },
    { name: '360mm AIO',                         price: 89.99,  tags: ['AM4','AM5','ATX'],         color: 'neutral', type: 'aio',     max_tdp: 250, aio_size: '360mm' },
    { name: '360mm AIO (White)',                 price: 89.99,  tags: ['AM4','AM5','ATX'],         color: 'white',   type: 'aio',     max_tdp: 250, aio_size: '360mm' },
    { name: '360mm AIO Screen',                  price: 199.99, tags: ['AM4','AM5','ATX'],         color: 'neutral', type: 'aio_lcd', max_tdp: 250, aio_size: '360mm' },
    { name: '360mm AIO Screen (White)',          price: 199.99, tags: ['AM4','AM5','ATX'],         color: 'white',   type: 'aio_lcd', max_tdp: 250, aio_size: '360mm' },
    { name: '360mm AIO Screen Curved Pro',       price: 429.99, tags: ['AM4','AM5','ATX'],         color: 'neutral', type: 'aio_lcd', max_tdp: 250, aio_size: '360mm' },
    { name: '360mm AIO Screen Curved Pro (White)', price: 429.99, tags: ['AM4','AM5','ATX'],       color: 'white',   type: 'aio_lcd', max_tdp: 250, aio_size: '360mm' },
  ],
  psu: [
    { name: 'MSI MAG 550W',         price: 69.99,  tags: ['AM4','AM5'], color: 'neutral', wattage: 550 },
    { name: 'MSI MAG 650W',         price: 79.99,  tags: ['AM4','AM5'], color: 'neutral', wattage: 650 },
    { name: 'MSI MAG 750W',         price: 109.99, tags: ['AM4','AM5'], color: 'neutral', wattage: 750 },
    { name: 'MSI MAG 850W',         price: 129.99, tags: ['AM4','AM5'], color: 'neutral', wattage: 850 },
    { name: 'MSI MAG 850W (White)', price: 139.99, tags: ['AM4','AM5'], color: 'white',   wattage: 850 },
  ],
  cables: [
    { name: 'No Cable Sleeves',    price: 5.00,  tags: ['AM4','AM5'], color: 'neutral' },
    { name: 'White Cable Sleeves', price: 24.99, tags: ['AM4','AM5'], color: 'white'   },
    { name: 'Black Cable Sleeves', price: 24.99, tags: ['AM4','AM5'], color: 'black'   },
  ],
  cases: [
    { name: 'GAMDIAS mATX',                       price: 59.99,  tags: ['mATX'], color: 'black', form_factor: 'mATX', gpu_length_supported: 320, max_aio_size: '240mm' },
    { name: 'Thermaltake View 170 mATX (White)',   price: 79.99,  tags: ['mATX'], color: 'white', form_factor: 'mATX', gpu_length_supported: 330, max_aio_size: '240mm' },
    { name: 'Montech XR ATX',                      price: 89.99,  tags: ['ATX'],  color: 'black', form_factor: 'ATX',  gpu_length_supported: 370, max_aio_size: '360mm' },
    { name: 'Antec C5 ATX',                        price: 99.99,  tags: ['ATX'],  color: 'black', form_factor: 'ATX',  gpu_length_supported: 390, max_aio_size: '360mm' },
    { name: 'Antec C5 ATX (White)',                price: 109.99, tags: ['ATX'],  color: 'white', form_factor: 'ATX',  gpu_length_supported: 390, max_aio_size: '360mm' },
  ],
};

// Base builds
export const BASE_BUILDS = {
  'ZTB-1': {
    cpu: 'AMD Ryzen 5 5500',
    gpu: 'Intel Arc B570',
    ram: '16GB DDR4',
    storage: '1TB M.2 SSD',
    cooler: 'Stock AMD Cooler',
    psu: 'MSI MAG 550W',
    motherboard: 'Gigabyte B550M K',
    cables: 'No Cable Sleeves',
    platform: 'AM4',
    ramType: 'DDR4',
    caseSize: 'mATX_Case',
    caseName: 'GAMDIAS mATX',
    color: 'black',
  },
  'ZTW-2': {
    cpu: 'AMD Ryzen 5 5600',
    gpu: 'NVIDIA GeForce RTX 5060 (White)',
    ram: '16GB DDR4',
    storage: '1TB M.2 SSD',
    cooler: 'Single Tower Air Cooler (White)',
    psu: 'MSI MAG 650W',
    motherboard: 'Gigabyte B550M K',
    cables: 'White Cable Sleeves',
    platform: 'AM4',
    ramType: 'DDR4',
    caseSize: 'mATX_Case',
    caseName: 'Thermaltake View 170 mATX (White)',
    color: 'white',
  },
  'ZTB-3': {
    cpu: 'AMD Ryzen 5 9600X',
    gpu: 'NVIDIA GeForce RTX 5060',
    ram: '32GB DDR5',
    storage: '1TB M.2 SSD',
    cooler: '360mm AIO',
    psu: 'MSI MAG 650W',
    motherboard: 'Asus B650-PLUS WIFI',
    cables: 'Black Cable Sleeves',
    platform: 'AM5',
    ramType: 'DDR5',
    caseSize: 'ATX_Case',
    caseName: 'Montech XR ATX',
    color: 'black',
  },
  'ZTB-4': {
    cpu: 'AMD Ryzen 5 9600X',
    gpu: 'NVIDIA GeForce RTX 5070',
    ram: '32GB DDR5',
    storage: '2TB M.2 SSD',
    cooler: '360mm AIO',
    psu: 'MSI MAG 750W',
    motherboard: 'Asus B650-PLUS WIFI',
    cables: 'Black Cable Sleeves',
    platform: 'AM5',
    ramType: 'DDR5',
    caseSize: 'ATX_Case',
    caseName: 'Antec C5 ATX',
    color: 'black',
  },
  'ZTW-5': {
    cpu: 'AMD Ryzen 5 9600X',
    gpu: 'NVIDIA GeForce RTX 5070 (White)',
    ram: '32GB DDR5',
    storage: '2TB M.2 SSD',
    cooler: '360mm AIO (White)',
    psu: 'MSI MAG 750W',
    motherboard: 'Asus B650-PLUS WIFI',
    cables: 'White Cable Sleeves',
    platform: 'AM5',
    ramType: 'DDR5',
    caseSize: 'ATX_Case',
    caseName: 'Antec C5 ATX (White)',
    color: 'white',
  },
};

// Windows key fee added to every CUSTOM build (daily PCs already include it)
export const WINDOWS_KEY_FEE = 15;

// Daily PC set prices (Windows already included — no extra fee)
export const DAILY_PC_PRICES = {
  'ZTB-1': 999.99,
  'ZTW-2': 1299.99,
  'ZTB-3': 1749.99,
  'ZTB-4': 2199.99,
};

// Cases available per form factor, with color variants
export const CASES = {
  mATX: [
    { name: 'GAMDIAS mATX', color: 'black', displayName: 'GAMDIAS mATX (Black)' },
    { name: 'Thermaltake View 170 mATX (White)', color: 'white', displayName: 'Thermaltake View 170 mATX (White)' },
  ],
  ATX: [
    { name: 'Montech XR ATX', color: 'black', displayName: 'Montech XR ATX (Black)' },
    { name: 'Antec C5 ATX', color: 'black', displayName: 'Antec C5 ATX (Black)' },
    { name: 'Antec C5 ATX (White)', color: 'white', displayName: 'Antec C5 ATX (White)' },
  ],
};

export function getPartPrice(category, partName) {
  const list = PARTS_DB[category] || [];
  const found = list.find(p => p.name === partName);
  return found ? found.price : 0;
}

export function getCompatibleParts(category, platform, ramType, caseSize) {
  const list = PARTS_DB[category] || [];
  return list.filter(part => {
    const tags = part.tags || [];
    if (category === 'cpu') return tags.includes(platform);
    if (category === 'ram') return tags.includes(ramType);
    if (category === 'motherboard') {
      const platformMatch = tags.includes(platform);
      const ramMatch = tags.includes(ramType);
      const sizeMatch = caseSize === 'ATX_Case' ? true : tags.includes('mATX');
      return platformMatch && ramMatch && sizeMatch;
    }
    if (category === 'cooler') {
      // 360mm AIO needs ATX, 240mm and air fit in mATX too
      return tags.includes(caseSize === 'ATX_Case' ? 'ATX' : 'mATX');
    }
    return true;
  });
}

export function calculateUpgradePrice(category, basePart, selectedPart) {
  const basePrice = getPartPrice(category, basePart);
  const selectedPrice = getPartPrice(category, selectedPart);
  return selectedPrice - basePrice;
}

// calculateTotalPrice for the configurator on PCDetail
// basePrice is the DAILY_PC_PRICES value (Windows already included), no extra fee
export function calculateTotalPrice(basePrice, baseBuild, currentConfig) {
  let total = basePrice;
  const categories = ['cpu', 'gpu', 'ram', 'storage', 'cooler', 'psu', 'motherboard', 'cables'];
  for (const cat of categories) {
    if (currentConfig[cat] && currentConfig[cat] !== baseBuild[cat]) {
      total += calculateUpgradePrice(cat, baseBuild[cat], currentConfig[cat]);
    }
  }
  return total;
}