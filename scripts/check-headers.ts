import * as XLSX from 'xlsx';

async function main() {
  console.log('Excelをダウンロード中...');
  const response = await fetch('https://www.mhlw.go.jp/content/11120000/001635220.xlsx', {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, defval: '' });
  
  console.log('\n=== 最初の5行（ヘッダー確認）===');
  for (let i = 0; i < 5; i++) {
    console.log(`\nRow ${i}:`);
    const row = rows[i] as unknown[];
    row.forEach((cell, idx) => {
      const val = String(cell || '').trim();
      if (val) {
        console.log(`  [${idx}] ${val}`);
      }
    });
  }
  
  // サンプルデータ行も確認
  console.log('\n=== サンプルデータ行（Row 2）===');
  const dataRow = rows[2] as unknown[];
  dataRow.forEach((cell, idx) => {
    const val = String(cell || '').trim();
    console.log(`  [${idx}] ${val}`);
  });
}

main();
