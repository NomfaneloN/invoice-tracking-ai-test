const XLSX = require('xlsx');
const path = require('path');

const templatePath = path.join(__dirname, '..', 'test-data', 'bas-registers', 'BAS Payment Register LOGIS-20260422-REJ.xlsx');
const outPath = path.join(__dirname, '..', 'test-data', 'bas-registers', 'BAS Payment Register LOGIS-5705.xlsx');

const wb = XLSX.readFile(templatePath, { cellDates: false });
const ws = wb.Sheets[wb.SheetNames[0]];

const serial = Math.floor((new Date('2026-04-24') - new Date('1899-12-30')) / 86400000);

ws['C10'] = { t: 'n', v: 5705 };
ws['H10'] = { t: 'n', v: serial };
ws['I10'] = { t: 's', v: 'ITS-LOGIS-20260424' };
ws['O10'] = { t: 'n', v: serial };
ws['P10'] = { t: 'n', v: serial };
ws['Q10'] = { t: 'n', v: serial };
ws['T10'] = { t: 'n', v: 3000 };

XLSX.writeFile(wb, outPath);

console.log('Wrote', outPath);
console.log('Serial:', serial);
['B10','C10','H10','I10','J10','K10','L10','M10','N10','O10','P10','Q10','R10','S10','T10'].forEach(c => {
  console.log(c, '=', JSON.stringify(ws[c]));
});
