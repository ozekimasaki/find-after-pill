import * as XLSX from 'xlsx';
import * as cheerio from 'cheerio';
import type { Pharmacy } from '../../src/types/pharmacy';

const MHLW_PAGE_URL = 'https://www.mhlw.go.jp/stf/kinnkyuuhininnyaku_00005.html';

/**
 * 厚労省ページからExcelファイルのURLを取得
 */
async function findExcelUrl(): Promise<string> {
  console.log('Fetching MHLW page to find Excel URL...');
  
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

  // Excelファイルへのリンクを探す
  // 厚労省のページでは通常 .xlsx または .xls ファイルへのリンクがある
  let excelUrl: string | null = null;

  $('a').each((_, element) => {
    const href = $(element).attr('href');
    if (href && (href.includes('.xlsx') || href.includes('.xls'))) {
      // 「薬局等の一覧」を含むリンクを優先
      const text = $(element).text();
      if (text.includes('一覧') || text.includes('薬局')) {
        excelUrl = href;
        return false; // break
      }
      // 最初に見つかったExcelリンクを保持
      if (!excelUrl) {
        excelUrl = href;
      }
    }
  });

  if (!excelUrl) {
    throw new Error('Excel file URL not found on MHLW page');
  }

  // 相対URLを絶対URLに変換
  if (excelUrl.startsWith('/')) {
    excelUrl = `https://www.mhlw.go.jp${excelUrl}`;
  } else if (!excelUrl.startsWith('http')) {
    excelUrl = new URL(excelUrl, MHLW_PAGE_URL).href;
  }

  console.log('Found Excel URL:', excelUrl);
  return excelUrl;
}

/**
 * ExcelファイルをダウンロードしてパースしてPharmacyの配列を返す
 */
export async function fetchAndParseExcel(): Promise<{
  pharmacies: Pharmacy[];
  fileName: string;
  sourceUrl: string;
}> {
  const excelUrl = await findExcelUrl();
  const fileName = excelUrl.split('/').pop() || 'unknown.xlsx';

  console.log('Downloading Excel file...');
  const response = await fetch(excelUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; NorlevoPortal/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download Excel: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  console.log('Parsing Excel file...');

  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // シートをJSONに変換
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    header: 1,
    defval: '',
  }) as unknown[][];

  // ヘッダー行を探す（都道府県、薬局名などを含む行）
  let headerRowIndex = -1;
  let columnMapping: Record<string, number> = {};

  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i];
    if (!row) continue;

    const rowStr = row.map(cell => String(cell || '').toLowerCase()).join(' ');
    
    // ヘッダー行の特定
    if (rowStr.includes('都道府県') || rowStr.includes('薬局') || rowStr.includes('店舗')) {
      headerRowIndex = i;
      
      // カラムマッピングを作成
      row.forEach((cell, colIndex) => {
        const cellStr = String(cell || '');
        if (cellStr.includes('都道府県')) {
          columnMapping.prefecture = colIndex;
        } else if (cellStr.includes('薬局') || cellStr.includes('店舗') || cellStr.includes('名称')) {
          if (!columnMapping.name) {
            columnMapping.name = colIndex;
          }
        } else if (cellStr.includes('住所') || cellStr.includes('所在地')) {
          columnMapping.address = colIndex;
        } else if (cellStr.includes('電話') || cellStr.includes('TEL')) {
          columnMapping.phone = colIndex;
        } else if (cellStr.includes('備考') || cellStr.includes('その他')) {
          columnMapping.notes = colIndex;
        }
      });
      
      break;
    }
  }

  // ヘッダーが見つからない場合はデフォルトのマッピングを使用
  if (headerRowIndex === -1) {
    console.warn('Header row not found, using default column mapping');
    headerRowIndex = 0;
    columnMapping = {
      prefecture: 0,
      name: 1,
      address: 2,
      phone: 3,
      notes: 4,
    };
  }

  console.log('Column mapping:', columnMapping);

  // データ行をパース
  const pharmacies: Pharmacy[] = [];
  
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const prefecture = String(row[columnMapping.prefecture] || '').trim();
    const name = String(row[columnMapping.name] || '').trim();
    const address = String(row[columnMapping.address] || '').trim();
    const phone = String(row[columnMapping.phone] || '').trim();
    const notes = columnMapping.notes !== undefined 
      ? String(row[columnMapping.notes] || '').trim() 
      : undefined;

    // 必須フィールドがない行はスキップ
    if (!name || !address) continue;

    // 都道府県が空の場合、住所から推測
    let finalPrefecture = prefecture;
    if (!finalPrefecture && address) {
      const prefMatch = address.match(/^(北海道|東京都|大阪府|京都府|.{2,3}県)/);
      if (prefMatch) {
        finalPrefecture = prefMatch[1];
      }
    }

    pharmacies.push({
      id: `pharmacy-${i}`,
      prefecture: finalPrefecture,
      name,
      address,
      phone: formatPhoneNumber(phone),
      lat: null,
      lng: null,
      notes: notes || undefined,
    });
  }

  console.log(`Parsed ${pharmacies.length} pharmacies`);
  return { pharmacies, fileName, sourceUrl: excelUrl };
}

/**
 * 電話番号をフォーマット
 */
function formatPhoneNumber(phone: string): string {
  // 数字とハイフンのみを抽出
  const cleaned = phone.replace(/[^\d\-]/g, '');
  return cleaned;
}
