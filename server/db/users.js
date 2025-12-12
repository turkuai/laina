import db from './db.js';

// INSERT
async function insertUser(user) {
    const { username, displayName, password, role, disabled } = user;
    const [result] = await db.execute(
        'INSERT INTO users (username, displayName, password, role, disabled, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [username, displayName, password, role, disabled]
    );
    return result.insertId;
}

// SELECT with pagination
async function selectUsers(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [[{ count }]] = await db.execute('SELECT COUNT(*) AS count FROM users');
    const totalPages = Math.ceil(count / limit);

    const [rows] = await db.execute(
        'SELECT * FROM users ORDER BY id LIMIT ? OFFSET ?',
        [limit, offset]
    );

    return { data: rows, currentPage: page, totalPages };
}

// SELECT single user
async function selectUserById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
}

// UPDATE
async function updateUser(user) {
    const { username, displayName, password, role, disabled, id } = user;
    const [result] = await db.execute(
        'UPDATE users SET username = ?, displayName = ?, password = ?, role = ?, disabled = ? WHERE id = ?',
        [username, displayName, password, role, disabled, id]
    );
    return result.affectedRows;
}

// DELETE
async function deleteUser(id) {
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
}



const users = { 
    insertUser,
    selectUsers,
    selectUserById,
    updateUser,
    deleteUser
};

export default users;
