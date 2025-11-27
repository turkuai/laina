import db from './db.js';
import bcrypt from 'bcrypt';

async function verifyUserCredentials(identifier, plainPassword) {
    // Select the user and their encrypted password
    const [rows] = await db.execute(
        'SELECT id, username, first_name, last_name, password, role FROM users WHERE username = ?',
        [identifier]
    );
    
    const user = rows[0];

    if (!user) {
        return null; // User not found
    }

    // SECURE: Compare plain password against bcrypt hash
    const isPasswordValid = await bcrypt.compare(plainPassword, user.password);
    
    if (isPasswordValid) {
        // Remove password before returning
        delete user.password;
        return user; 
    } else {
        return null; // Password doesn't match
    }
}

// --- INSERT (Updated to hash password) ---
async function insertUser(user) {
    const { username, first_name, last_name, password, role, email } = user;
    
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.execute(
        'INSERT INTO users (username, first_name, last_name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [username, first_name, last_name, email, hashedPassword, role]
    );
    return result.insertId;
}

// --- SELECT with pagination ---
async function selectUsers(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [[{ count }]] = await db.execute('SELECT COUNT(*) AS count FROM users');
    const totalPages = Math.ceil(count / limit);

    const [rows] = await db.execute(
        'SELECT id, username, first_name, last_name, email, role, created_at FROM users ORDER BY id LIMIT ? OFFSET ?',
        [limit, offset]
    );

    return { users: rows, currentPage: page, totalPages };
}

// --- SELECT single user (excludes password) ---
async function selectUserById(id) {
    const [rows] = await db.execute(
        'SELECT id, username, first_name, last_name, email, role, created_at FROM users WHERE id = ?',
        [id]
    );
    return rows[0];
}

// --- UPDATE (Updated to hash password if provided) ---
async function updateUser(user) {
    const { username, first_name, last_name, password, role, id, email } = user;
    
    let query, params;
    
    if (password) {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        query = 'UPDATE users SET username = ?, first_name = ?, last_name = ?, email = ?, password = ?, role = ? WHERE id = ?';
        params = [username, first_name, last_name, email, hashedPassword, role, id];
    } else {
        // Don't update password if not provided
        query = 'UPDATE users SET username = ?, first_name = ?, last_name = ?, email = ?, role = ? WHERE id = ?';
        params = [username, first_name, last_name, email, role, id];
    }
    
    const [result] = await db.execute(query, params);
    return result.affectedRows;
}

// --- DELETE ---
async function deleteUser(id) {
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
}

const users = { 
    insertUser,
    selectUsers,
    selectUserById,
    updateUser,
    deleteUser,
    verifyUserCredentials, 
};

export default users;