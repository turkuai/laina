const fs = require('fs');
const path = require('path');

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomElement(arr) { return arr[randomInt(0, arr.length - 1)]; }

let sql = `SET FOREIGN_KEY_CHECKS = 0;\n\n`;
sql += `DELETE FROM borrow_history WHERE id >= 10;\n`;
sql += `DELETE FROM products WHERE id >= 10;\n`;
sql += `DELETE FROM users WHERE id >= 10;\n\n`;

const firstNames = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Charles", "Joseph", "Thomas", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Mohamed", "Ahmed", "Ali", "Fatima", "Aisha", "Alex", "Sam", "Charlie", "Taylor"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez"];
const roles = ['student', 'student', 'student', 'student', 'teacher', 'admin'];

sql += `-- Users (Exactly 2000 records)\n`;
const userIdStart = 10; 
for (let i = 0; i < 2000; i++) {
  const id = userIdStart + i;
  const fn = randomElement(firstNames);
  const ln = randomElement(lastNames);
  const username = `${fn.toLowerCase()}.${ln.toLowerCase()}${id}`;
  const email = `${username}@edu.turku.fi`;
  const role = randomElement(roles);
  const pass = '$2y$10$YourHashedPasswordHere';
  const phone = `040${randomInt(1000000, 9999999)}`;
  sql += `INSERT INTO users (id, username, password, email, first_name, last_name, phone_number, role, email_verified, flag) VALUES (${id}, '${username}', '${pass}', '${email}', '${fn}', '${ln}', '${phone}', '${role}', 1, 'visible');\n`;
}
sql += '\n';

sql += `-- Products (Exactly 2000 records)\n`;
const productIdStart = 10;
const devices = [
  {type: 1, name: 'Canon EOS Camera'},{type: 2, name: 'DJI Drone Model'},{type: 3, name: 'Studio Light Pro'},{type: 4, name: 'Sennheiser Mic'},
  {type: 5, name: 'Manfrotto Tripod'},{type: 6, name: 'Sony E-Mount Lens'},{type: 7, name: 'Zoom Audio Recorder'},{type: 8, name: 'Blackmagic Video Eq'}
];
for (let i = 0; i < 2000; i++) {
  const id = productIdStart + i;
  const dev = randomElement(devices);
  const typeId = dev.type;
  const name = `${dev.name} v${randomInt(1, 10)} - Unit ${id}`;
  const year = randomInt(2015, 2025);
  const locId = randomInt(1, 5); 
  const qr = `QR_DUMMY_${id}_${randomInt(1000, 9999)}`;
  const status = randomElement(['available', 'available', 'available', 'borrowed']);
  sql += `INSERT INTO products (id, device_type_id, product_name, purchase_date, location_id, status, details, qr_code) VALUES (${id}, ${typeId}, '${name}', '${year}', ${locId}, '${status}', 'Dummy details for testing.', '${qr}');\n`;
}
sql += '\n';

sql += `-- Borrow History (Exactly 2000 records)\n`;
const borrowIdStart = 10;
for (let i = 0; i < 2000; i++) {
  const id = borrowIdStart + i;
  const productId = randomInt(productIdStart, productIdStart + 1999);
  const borrowerId = randomInt(userIdStart, userIdStart + 1999);
  const lenderId = randomElement([1, 2, 3]); 
  
  const baseDate = new Date(Date.now() - randomInt(1, 365) * 24 * 60 * 60 * 1000);
  const bDateStr = baseDate.toISOString().slice(0, 19).replace('T', ' ');
  const estRetDate = new Date(baseDate.getTime() + randomInt(1, 14) * 24 * 60 * 60 * 1000);
  const estRetStr = estRetDate.toISOString().slice(0, 10);
  
  const isReturned = Math.random() > 0.2;
  const actRetDate = isReturned ? new Date(estRetDate.getTime() + randomInt(-2, 2) * 24 * 60 * 60 * 1000) : null;
  const actRetStr = isReturned ? `'${actRetDate.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL';
  
  const snapshotName = `Student ${borrowerId}`;
  sql += `INSERT INTO borrow_history (id, product_id, borrower_id, borrower_name_snapshot, lender_id, borrow_date, estimated_return_date, actual_return_date) VALUES (${id}, ${productId}, ${borrowerId}, '${snapshotName}', ${lenderId}, '${bDateStr}', '${estRetStr}', ${actRetStr});\n`;
}
sql += '\nSET FOREIGN_KEY_CHECKS = 1;\n';

fs.writeFileSync(path.join(__dirname, 'database', 'dummy.sql'), sql);
console.log('dummy.sql generated successfully with EXACTLY 2000 records per table.');
