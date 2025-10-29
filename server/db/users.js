import db from './db.js';

export async function getUsers() {
    const [rows] = await db.query('SELECT * FROM users');
    return rows;
}