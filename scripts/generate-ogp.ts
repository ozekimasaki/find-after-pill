import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

const WIDTH = 1200;
const HEIGHT = 630;

// Google Fonts から Noto Sans JP を Base64 で埋め込むためのSVGを生成
const generateSvg = () => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&amp;display=swap');
      .title { font-family: 'Noto Sans JP', sans-serif; font-weight: 700; }
      .subtitle { font-family: 'Noto Sans JP', sans-serif; font-weight: 700; }
      .description { font-family: 'Noto Sans JP', sans-serif; font-weight: 400; }
      .url { font-family: sans-serif; font-weight: 400; }
    </style>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#EBF6FC"/>
      <stop offset="100%" style="stop-color:#FFFFFF"/>
    </linearGradient>
    <linearGradient id="pillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#65BBE9"/>
      <stop offset="100%" style="stop-color:#4AA8D9"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgGradient)"/>
  
  <!-- Decorative circles -->
  <circle cx="100" cy="100" r="150" fill="#65BBE9" opacity="0.1"/>
  <circle cx="1100" cy="530" r="200" fill="#65BBE9" opacity="0.1"/>
  <circle cx="900" cy="100" r="100" fill="#65BBE9" opacity="0.08"/>
  
  <!-- Pill icon -->
  <g transform="translate(200,315)">
    <circle cx="0" cy="0" r="80" fill="url(#pillGradient)"/>
    <g transform="rotate(-30)">
      <rect x="-45" y="-18" width="90" height="36" rx="18" ry="18" fill="white"/>
      <line x1="0" y1="-18" x2="0" y2="18" stroke="#65BBE9" stroke-width="3"/>
      <path d="M-45,0 a18,18 0 0,1 18,-18 h27 v36 h-27 a18,18 0 0,1 -18,-18" fill="#EBF6FC"/>
    </g>
    <g transform="translate(55,-45)">
      <circle cx="0" cy="0" r="20" fill="white"/>
      <rect x="-10" y="-3" width="20" height="6" rx="2" fill="#65BBE9"/>
      <rect x="-3" y="-10" width="6" height="20" rx="2" fill="#65BBE9"/>
    </g>
  </g>
  
  <!-- Text content -->
  <text x="350" y="280" class="title" font-size="72" fill="#333333">緊急避妊薬ナビ</text>
  <text x="350" y="370" class="subtitle" font-size="48" fill="#65BBE9">販売薬局検索</text>
  <text x="350" y="440" class="description" font-size="28" fill="#666666">近くの緊急避妊薬販売薬局を探せます</text>
  <text x="350" y="520" class="url" font-size="24" fill="#4AA8D9">find-after-pill.com</text>
  
  <!-- Bottom bar -->
  <rect x="0" y="610" width="${WIDTH}" height="20" fill="url(#pillGradient)"/>
</svg>`;

// sharpはGoogle Fontsを直接読み込めないため、テキストをパスに変換したSVGを使用
// 代替案: フォントなしでシンプルなデザインにするか、テキストをパスに変換
const generateSvgWithoutExternalFonts = () => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#EBF6FC"/>
      <stop offset="100%" style="stop-color:#FFFFFF"/>
    </linearGradient>
    <linearGradient id="pillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#65BBE9"/>
      <stop offset="100%" style="stop-color:#4AA8D9"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgGradient)"/>
  
  <!-- Decorative circles -->
  <circle cx="100" cy="100" r="150" fill="#65BBE9" opacity="0.1"/>
  <circle cx="1100" cy="530" r="200" fill="#65BBE9" opacity="0.1"/>
  <circle cx="900" cy="100" r="100" fill="#65BBE9" opacity="0.08"/>
  
  <!-- Pill icon - larger and centered -->
  <g transform="translate(600,315)">
    <circle cx="0" cy="0" r="120" fill="url(#pillGradient)"/>
    <g transform="rotate(-30)">
      <rect x="-68" y="-27" width="136" height="54" rx="27" ry="27" fill="white"/>
      <line x1="0" y1="-27" x2="0" y2="27" stroke="#65BBE9" stroke-width="4"/>
      <path d="M-68,0 a27,27 0 0,1 27,-27 h41 v54 h-41 a27,27 0 0,1 -27,-27" fill="#EBF6FC"/>
    </g>
    <g transform="translate(82,-68)">
      <circle cx="0" cy="0" r="30" fill="white"/>
      <rect x="-15" y="-4.5" width="30" height="9" rx="3" fill="#65BBE9"/>
      <rect x="-4.5" y="-15" width="9" height="30" rx="3" fill="#65BBE9"/>
    </g>
  </g>
  
  <!-- Site name - English fallback -->
  <text x="600" y="520" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#333333">Emergency Pill Pharmacy Search</text>
  <text x="600" y="570" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#4AA8D9">find-after-pill.com</text>
  
  <!-- Bottom bar -->
  <rect x="0" y="610" width="${WIDTH}" height="20" fill="url(#pillGradient)"/>
</svg>`;

async function main() {
  const outputDir = path.join(process.cwd(), 'public');
  const outputPath = path.join(outputDir, 'og-image.png');

  console.log('Generating OGP image...');

  // sharpはSVG内の外部フォントを読み込めないため、
  // システムフォントを使用するか、英語テキストを使用
  // ここではシステムにインストールされている日本語フォントを試す
  
  const svgBuffer = Buffer.from(generateSvg());

  try {
    await sharp(svgBuffer)
      .resize(WIDTH, HEIGHT)
      .png()
      .toFile(outputPath);
    
    console.log(`✅ OGP image generated: ${outputPath}`);
  } catch (error) {
    console.log('External font failed, trying system font approach...');
    
    // フォールバック: 英語テキストバージョン
    const fallbackSvg = Buffer.from(generateSvgWithoutExternalFonts());
    await sharp(fallbackSvg)
      .resize(WIDTH, HEIGHT)
      .png()
      .toFile(outputPath);
    
    console.log(`✅ OGP image generated (fallback): ${outputPath}`);
  }

  // ファイルサイズを確認
  const stats = fs.statSync(outputPath);
  console.log(`📦 File size: ${(stats.size / 1024).toFixed(2)} KB`);
}

main().catch(console.error);
