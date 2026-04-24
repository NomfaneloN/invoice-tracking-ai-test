const XLSX = require('xlsx');
const path = require('path');

const templatePath = path.join(__dirname, '..', 'test-data', 'bas-registers', 'BAS Payment Register E2E-20260423.xlsx');
const outPath = path.join(__dirname, '..', 'test-data', 'bas-registers', 'BAS Payment Register E2E-20260424.xlsx');

const wb = XLSX.readFile(templatePath, { cellDates: false });
const wsName = wb.SheetNames[0];
const ws = wb.Sheets[wsName];

const serial = 46136;

ws['C10'] = { t: 'n', v: 5699 };
ws['H10'] = { t: 'n', v: serial };
ws['I10'] = { t: 's', v: 'ITS-E2E-20260424' };
ws['O10'] = { t: 'n', v: serial };
ws['P10'] = { t: 'n', v: serial };
ws['Q10'] = { t: 'n', v: serial };
ws['T10'] = { t: 'n', v: 2500 };

XLSX.writeFile(wb, outPath);

console.log('Wrote', outPath);
console.log('Row 10 cells:');
['B10','C10','H10','I10','N10','O10','P10','Q10','R10','T10'].forEach(c => {
  console.log(c, '=', JSON.stringify(ws[c]));
});
