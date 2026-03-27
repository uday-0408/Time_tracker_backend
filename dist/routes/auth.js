import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/User.js';
const router = express.Router();
const SALT_ROUNDS = 10;
const loginSchema = z.object({
    name: z.string().trim().min(2).max(40),
    password: z.string().min(1).max(128),
});
// Register/Login (simple auth - just check if user exists, create if not)
router.post('/login', async (req, res) => {
    try {
        const { name, password } = loginSchema.parse(req.body);
        const normalizedName = name.toLowerCase();
        let user = await User.findOne({ nameNormalized: normalizedName });
        if (!user) {
            user = await User.findOne({ name }).collation({ locale: 'en', strength: 2 });
        }
        if (user) {
            const storedPassword = user.password;
            const isHash = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$');
            const isValid = isHash ? await bcrypt.compare(password, storedPassword) : storedPassword === password;
            if (!isValid) {
                return res.status(401).json({ success: false, message: 'Invalid password' });
            }
            // Seamless migration for legacy plaintext password records.
            if (!isHash) {
                user.password = await bcrypt.hash(password, SALT_ROUNDS);
                user.nameNormalized = normalizedName;
                await user.save();
            }
        }
        else {
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            user = await User.create({ name, nameNormalized: normalizedName, password: hashedPassword });
        }
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' });
    }
});
export default router;
