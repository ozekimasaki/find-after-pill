/**
 * 厚労省からExcelデータを取得してJSONに変換するスクリプト
 * 使用方法: npx tsx scripts/fetch-data.ts
 */

import * as XLSX from 'xlsx';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const MHLW_PAGE_URL = 'https://www.mhlw.go.jp/stf/kinnkyuuhininnyaku_00005.html';
const GSI_GEOCODE_API = 'https://msearch.gsi.go.jp/address-search/AddressSearch';

/**
 * 都道府県ごとの緯度範囲（大まかな値）
 * ジオコーディング結果の妥当性検証に使用
 */
const PREFECTURE_LAT_RANGES: Record<string, [number, number]> = {
  '北海道': [41.3, 45.6],
  '青森県': [40.2, 41.6],
  '岩手県': [38.7, 40.5],
  '宮城県': [37.8, 39.0],
  '秋田県': [39.0, 40.5],
  '山形県': [37.7, 39.2],
  '福島県': [36.8, 37.9],
  '茨城県': [35.7, 36.9],
  '栃木県': [36.2, 37.2],
  '群馬県': [36.0, 37.1],
  '埼玉県': [35.7, 36.3],
  '千葉県': [34.9, 36.0],
  '東京都': [35.5, 35.9],
  '神奈川県': [35.1, 35.7],
  '新潟県': [37.0, 38.6],
  '富山県': [36.3, 36.9],
  '石川県': [36.1, 37.5],
  '福井県': [35.4, 36.3],
  '山梨県': [35.2, 35.9],
  '長野県': [35.2, 37.0],
  '岐阜県': [35.1, 36.5],
  '静岡県': [34.6, 35.6],
  '愛知県': [34.6, 35.4],
  '三重県': [33.7, 35.2],
  '滋賀県': [34.8, 35.7],
  '京都府': [34.7, 35.8],
  '大阪府': [34.3, 35.0],
  '兵庫県': [34.2, 35.7],
  '奈良県': [33.9, 34.8],
  '和歌山県': [33.4, 34.4],
  '鳥取県': [35.1, 35.6],
  '島根県': [34.3, 36.3],
  '岡山県': [34.4, 35.3],
  '広島県': [34.0, 35.1],
  '山口県': [33.7, 34.8],
  '徳島県': [33.7, 34.3],
  '香川県': [34.1, 34.5],
  '愛媛県': [32.9, 34.1],
  '高知県': [32.7, 33.9],
  '福岡県': [33.0, 33.9],
  '佐賀県': [33.0, 33.6],
  '長崎県': [32.5, 34.7],
  '熊本県': [32.0, 33.2],
  '大分県': [32.7, 33.8],
  '宮崎県': [31.4, 32.9],
  '鹿児島県': [27.0, 32.3],
  '沖縄県': [24.0, 27.9],
};

/**
 * 座標が都道府県の緯度範囲内かチェック
 */
function isCoordInPrefecture(lat: number, prefecture: string): boolean {
  const range = PREFECTURE_LAT_RANGES[prefecture];
  if (!range) return true; // 範囲が定義されていない場合はスキップ
  return lat >= range[0] && lat <= range[1];
}

interface Pharmacy {
  id: string;
  pharmacyNumber?: string;
  prefecture: string;
  name: string;
  address: string;
  phone: string;
  lat: number | null;
  lng: number | null;
  pharmacistFemale?: number;
  pharmacistMale?: number;
  pharmacistOther?: number;
  website?: string;
  businessHours?: string;
  afterHoursService?: string;
  afterHoursPhone?: string;
  privacyMeasures?: string;
  advanceCallRequired?: string;
  notes?: string;
}

interface PharmacyMeta {
  lastUpdated: string;
  totalCount: number;
  sourceUrl: string;
  fileName?: string;
}

/**
 * 厚労省ページからExcelファイルのURLを取得
 */
async function findExcelUrl(): Promise<string> {
  console.log('厚労省ページからExcel URLを取得中...');
  
  const response = await fetch(MHLW_PAGE_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; NorlevoPortal/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch MHLW page: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  let excelUrl: string | null = null;

  $('a').each((_, element) => {
    const href = $(element).attr('href');
    if (href && (href.includes('.xlsx') || href.includes('.xls'))) {
      const text = $(element).text();
      if (text.includes('一覧') || text.includes('薬局')) {
        excelUrl = href;
        return false;
      }
      if (!excelUrl) {
        excelUrl = href;
      }
    }
  });

  if (!excelUrl) {
    throw new Error('Excel file URL not found on MHLW page');
  }

  if (excelUrl.startsWith('/')) {
    excelUrl = `https://www.mhlw.go.jp${excelUrl}`;
  } else if (!excelUrl.startsWith('http')) {
    excelUrl = new URL(excelUrl, MHLW_PAGE_URL).href;
  }

  console.log('Excel URL:', excelUrl);
  return excelUrl;
}

/**
 * 住所を正規化
 */
function normalizeAddress(address: string): string {
  return address
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    .replace(/[ー−―]/g, '-')
    .replace(/\s+/g, '')
    .replace(/丁目/g, '-')
    .replace(/番地?/g, '-')
    .replace(/号/g, '')
    .replace(/-+/g, '-')
    .replace(/-$/, '');
}

/**
 * 住所から緯度経度を取得
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const normalizedAddress = normalizeAddress(address);
    const url = `${GSI_GEOCODE_API}?q=${encodeURIComponent(normalizedAddress)}`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NorlevoPortal/1.0)' },
    });

    if (!response.ok) return null;

    const results = await response.json();
    
    if (results && results.length > 0) {
      const [lng, lat] = results[0].geometry.coordinates;
      return { lat, lng };
    }

    // 短い住所で再試行
    const match = address.match(/^(.+?[都道府県])(.+?[市区町村郡])/);
    if (match) {
      const shorterAddress = match[1] + match[2];
      const retryUrl = `${GSI_GEOCODE_API}?q=${encodeURIComponent(shorterAddress)}`;
      const retryResponse = await fetch(retryUrl);
      
      if (retryResponse.ok) {
        const retryResults = await retryResponse.json();
        if (retryResults && retryResults.length > 0) {
          const [lng, lat] = retryResults[0].geometry.coordinates;
          return { lat, lng };
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * 電話番号をフォーマット
 */
function formatPhoneNumber(phone: string): string {
  return phone.replace(/[^\d\-]/g, '');
}

/**
 * メイン処理
 */
async function main() {
  try {
    // Excel URLを取得
    const excelUrl = await findExcelUrl();
    const fileName = excelUrl.split('/').pop() || 'unknown.xlsx';

    // Excelをダウンロード
    console.log('Excelファイルをダウンロード中...');
    const response = await fetch(excelUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NorlevoPortal/1.0)' },
    });

    if (!response.ok) {
      throw new Error(`Failed to download Excel: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log('Excelファイルをパース中...');

    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      header: 1,
      defval: '',
    }) as unknown[][];

    // ヘッダー行を探す
    let headerRowIndex = -1;
    let columnMapping: Record<string, number> = {};

    for (let i = 0; i < Math.min(10, rows.length); i++) {
      const row = rows[i];
      if (!row) continue;

      const rowStr = row.map(cell => String(cell || '').toLowerCase()).join(' ');
      
      if (rowStr.includes('都道府県') || rowStr.includes('薬局') || rowStr.includes('店舗')) {
        headerRowIndex = i;
        
        row.forEach((cell, colIndex) => {
          const cellStr = String(cell || '').trim();
          
          // 完全一致または部分一致でマッピング
          if (cellStr === '薬局等番号') {
            columnMapping.pharmacyNumber = colIndex;
          } else if (cellStr === '都道府県') {
            columnMapping.prefecture = colIndex;
          } else if (cellStr === '薬局等名称' || cellStr.includes('薬局名') || cellStr.includes('店舗名')) {
            columnMapping.name = colIndex;
          } else if (cellStr === '住所') {
            columnMapping.address = colIndex;
          } else if (cellStr === '電話番号') {
            // 最初の「電話番号」カラムをメインの電話番号として使用
            if (columnMapping.phone === undefined) {
              columnMapping.phone = colIndex;
            }
          } else if (cellStr.includes('販売可能薬剤師数') || cellStr.includes('薬剤師数')) {
            // このカラムの次の行に「女性」「男性」「答えたくない」がある
            // 実際のデータは [5]=女性, [6]=男性, [7]=答えたくない
            columnMapping.pharmacistFemale = colIndex;
            columnMapping.pharmacistMale = colIndex + 1;
            columnMapping.pharmacistOther = colIndex + 2;
          } else if (cellStr === 'HP' || cellStr === 'ホームページ' || cellStr === 'URL') {
            columnMapping.website = colIndex;
          } else if (cellStr === '開局等時間' || cellStr.includes('開局時間') || cellStr.includes('営業時間')) {
            columnMapping.businessHours = colIndex;
          } else if (cellStr === '時間外対応') {
            columnMapping.afterHoursService = colIndex;
          } else if (cellStr === '時間外の電話番号') {
            columnMapping.afterHoursPhone = colIndex;
          } else if (cellStr === 'プライバシー確保策' || cellStr.includes('プライバシー')) {
            columnMapping.privacyMeasures = colIndex;
          } else if (cellStr === '事前電話連絡') {
            columnMapping.advanceCallRequired = colIndex;
          } else if (cellStr === '備考') {
            columnMapping.notes = colIndex;
          }
        });
        
        break;
      }
    }

    if (headerRowIndex === -1) {
      console.warn('ヘッダー行が見つかりません。デフォルトのマッピングを使用します。');
      headerRowIndex = 0;
      columnMapping = { prefecture: 0, name: 1, address: 2, phone: 3, notes: 4 };
    }

    console.log('カラムマッピング:', columnMapping);
    console.log('ヘッダー行:', rows[headerRowIndex]);
    
    // ヘッダーが複数行にまたがっている可能性があるので、前の行も確認
    if (headerRowIndex > 0) {
      console.log('ヘッダー前行:', rows[headerRowIndex - 1]);
    }

    // データ行をパース
    const pharmacies: Pharmacy[] = [];
    
    const getCell = (row: unknown[], key: string): string => {
      const idx = columnMapping[key];
      if (idx === undefined) return '';
      return String(row[idx] || '').trim();
    };

    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const pharmacyNumber = getCell(row, 'pharmacyNumber');
      const prefecture = getCell(row, 'prefecture');
      const name = getCell(row, 'name');
      const address = getCell(row, 'address');
      const phone = getCell(row, 'phone');
      const pharmacistFemaleStr = getCell(row, 'pharmacistFemale');
      const pharmacistMaleStr = getCell(row, 'pharmacistMale');
      const pharmacistOtherStr = getCell(row, 'pharmacistOther');
      const website = getCell(row, 'website');
      const businessHours = getCell(row, 'businessHours');
      const afterHoursService = getCell(row, 'afterHoursService');
      const afterHoursPhone = getCell(row, 'afterHoursPhone');
      const privacyMeasures = getCell(row, 'privacyMeasures');
      const advanceCallRequired = getCell(row, 'advanceCallRequired');
      const notes = getCell(row, 'notes');

      if (!name || !address) continue;

      let finalPrefecture = prefecture;
      if (!finalPrefecture && address) {
        const prefMatch = address.match(/^(北海道|東京都|大阪府|京都府|.{2,3}県)/);
        if (prefMatch) {
          finalPrefecture = prefMatch[1];
        }
      }

      // 住所が都道府県名で始まっていない場合、prefectureを先頭に追加
      let finalAddress = address;
      if (finalPrefecture && !address.startsWith(finalPrefecture)) {
        // 住所が「県」「府」「都」「道」で始まっていない場合
        const prefixPattern = /^(北海道|東京都|大阪府|京都府|.{2,3}県)/;
        if (!prefixPattern.test(address)) {
          finalAddress = finalPrefecture + address;
        }
      }

      // 薬剤師数をパース（数値に変換）
      const parseCount = (str: string): number | undefined => {
        const num = parseInt(str, 10);
        return isNaN(num) ? undefined : num;
      };

      pharmacies.push({
        id: `pharmacy-${i}`,
        pharmacyNumber: pharmacyNumber || undefined,
        prefecture: finalPrefecture,
        name,
        address: finalAddress,
        phone: formatPhoneNumber(phone),
        lat: null,
        lng: null,
        pharmacistFemale: parseCount(pharmacistFemaleStr),
        pharmacistMale: parseCount(pharmacistMaleStr),
        pharmacistOther: parseCount(pharmacistOtherStr),
        website: website || undefined,
        businessHours: businessHours || undefined,
        afterHoursService: afterHoursService || undefined,
        afterHoursPhone: afterHoursPhone ? formatPhoneNumber(afterHoursPhone) : undefined,
        privacyMeasures: privacyMeasures || undefined,
        advanceCallRequired: advanceCallRequired || undefined,
        notes: notes || undefined,
      });
    }

    console.log(`${pharmacies.length}件の薬局データをパースしました`);

    // ジオコーディング
    // 環境変数 GEOCODE_ALL=true で全件処理、それ以外は500件まで
    const geocodeAll = process.env.GEOCODE_ALL === 'true';
    const geocodeLimit = geocodeAll ? pharmacies.length : Math.min(500, pharmacies.length);
    console.log(`ジオコーディング中（${geocodeAll ? '全件' : '最初の500件'}）...`);
    
    let invalidCoordCount = 0;
    for (let i = 0; i < geocodeLimit; i++) {
      const pharmacy = pharmacies[i];
      const coords = await geocodeAddress(pharmacy.address);
      if (coords) {
        // 座標が都道府県の範囲内かチェック
        if (isCoordInPrefecture(coords.lat, pharmacy.prefecture)) {
          pharmacy.lat = coords.lat;
          pharmacy.lng = coords.lng;
        } else {
          // 座標が都道府県の範囲外の場合は無効とする
          console.warn(`座標が都道府県の範囲外: ${pharmacy.name} (${pharmacy.prefecture}) - lat: ${coords.lat}`);
          invalidCoordCount++;
        }
      }
      
      if ((i + 1) % 50 === 0) {
        console.log(`  ${i + 1}/${geocodeLimit} 完了`);
      }
      
      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const geocodedCount = pharmacies.filter(p => p.lat !== null).length;
    console.log(`${geocodedCount}件のジオコーディングが成功しました`);
    if (invalidCoordCount > 0) {
      console.log(`${invalidCoordCount}件の座標が都道府県の範囲外のため無効化されました`);
    }

    // JSONファイルを保存
    const outputDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const pharmaciesPath = path.join(outputDir, 'pharmacies.json');
    fs.writeFileSync(pharmaciesPath, JSON.stringify(pharmacies, null, 2));
    console.log(`薬局データを保存: ${pharmaciesPath}`);

    const meta: PharmacyMeta = {
      lastUpdated: new Date().toISOString(),
      totalCount: pharmacies.length,
      sourceUrl: excelUrl,
      fileName,
    };

    const metaPath = path.join(outputDir, 'meta.json');
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    console.log(`メタデータを保存: ${metaPath}`);

    console.log('\n完了!');

  } catch (error) {
    console.error('エラー:', error);
    process.exit(1);
  }
}

main();
