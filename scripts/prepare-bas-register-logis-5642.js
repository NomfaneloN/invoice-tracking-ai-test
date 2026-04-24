const XLSX = require('xlsx');
const path = require('path');

const templatePath = path.join(__dirname, '..', 'test-data', 'bas-registers', 'BAS Payment Register E2E-20260421B3.xlsx');
const outPath = path.join(__dirname, '..', 'test-data', 'bas-registers', 'BAS Payment Register LOGIS-5642.xlsx');

const wb = XLSX.readFile(templatePath, { cellDates: false });
const wsName = wb.SheetNames[0];
const ws = wb.Sheets[wsName];

const serial = Math.floor((new Date('2026-04-23') - new Date('1899-12-30')) / 86400000);

ws['C10'] = { t: 'n', v: 5642 };
ws['H10'] = { t: 'n', v: serial };
ws['I10'] = { t: 's', v: 'ITS-LOGIS-20260423' };
ws['N10'] = { t: 's', v: 'GR442' };
ws['O10'] = { t: 'n', v: serial };
ws['P10'] = { t: 'n', v: serial };
ws['Q10'] = { t: 'n', v: serial };
ws['R10'] = { t: 's', v: 'INV' };
ws['T10'] = { t: 'n', v: 3000 };

XLSX.writeFile(wb, outPath);

console.log('Wrote', outPath);
console.log('Serial:', serial);
['C10','H10','I10','O10','P10','Q10','T10'].forEach(c => {
  console.log(c, '=', JSON.stringify(ws[c]));
});
