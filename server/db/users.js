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

    return { users: rows, currentPage: page, totalPages };
}

// SELECT single user
async function selectUserById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
}

// VERIFY USER for login
async function verifyUser(username, password) {
    // First get the user with their hashed password
    const [rows] = await db.execute(
        'SELECT id, username, password, displayName, role, disabled FROM users WHERE username = ? AND disabled = 0',
        [username]
    );
    
    if (rows.length === 0) {
        return null;
    }
    
    const user = rows[0];
    
    // Compare the provided password with the hashed password
    const bcrypt = await import('bcrypt');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
        return null;
    }
    
    // Return user without password field
    return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role
    };
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
    verifyUser,
    updateUser,
    deleteUser
};

export default users;