const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'dziennik.ods');
console.log('Reading file:', filePath);

const workbook = XLSX.readFile(filePath);
console.log('Sheet names:', workbook.SheetNames);

const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const data = XLSX.utils.sheet_to_json(worksheet);
console.log('\nTotal rows:', data.length);
console.log('\nFirst row:');
console.log(JSON.stringify(data[0], null, 2));

if (data.length > 1) {
  console.log('\nSecond row:');
  console.log(JSON.stringify(data[1], null, 2));
}

console.log('\nColumn headers:', Object.keys(data[0] || {}));
