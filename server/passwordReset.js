import db from './db/db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function resetPassword() {
    try {
        console.log('🔄 Starting password reset...');
        
        // Hash the new password
        const newPassword = 'pass123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        console.log(`📝 Hashing password: ${newPassword}`);
        console.log(`🔐 Hashed result: ${hashedPassword}`);
        
        // Update Kevin's password
        const [result] = await db.execute(
            'UPDATE users SET password = ? WHERE username = ?',
            [hashedPassword, 'kevin']
        );
        
        if (result.affectedRows > 0) {
            console.log('✅ Password reset successful for user: kevin');
            console.log(`✅ New password is: ${newPassword}`);
            console.log('📋 You can now log in with kevin / pass123');
        } else {
            console.log('❌ User not found: kevin');
        }
        
        // Optional: Reset all demo users to password123
        console.log('\n🔄 Resetting all demo users to password123...');
        const demoUsers = ['admin', 'teacher1', 'teacher2', 'aurora', 'kevin'];
        const demoPassword = 'password123';
        const demoHashedPassword = await bcrypt.hash(demoPassword, 10);
        
        for (const username of demoUsers) {
            await db.execute(
                'UPDATE users SET password = ? WHERE username = ?',
                [demoHashedPassword, username]
            );
            console.log(`✅ Reset ${username} to password123`);
        }
        
        console.log('\n✨ All passwords have been reset!');
        console.log('Demo credentials:');
        console.log('  Admin: admin / password123');
        console.log('  Teacher: teacher1 / password123');
        console.log('  Student: aurora / password123');
        console.log('  Student: kevin / password123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting password:', error);
        process.exit(1);
    }
}

resetPassword();
