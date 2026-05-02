import express from 'express';
import { User } from '../models/User.js';
import { fetchAllStats } from '../utils/fetchers.js';
import { requireAuth } from '../utils/authMiddleware.js'; // optionally protect

const router = express.Router();

router.post('/sync', async (req, res) => {
    try {
        const { username } = req.body;
        // Optionally map email/ID from token if username is not provided
        const userQuery = username ? { username } : { _id: req.user?.id };
        const user = await User.findOne(userQuery);

        if (!user) return res.status(404).json({ error: 'User not found' });

        const newStats = await fetchAllStats(user.handles);
        user.stats = { ...user.stats, ...newStats, lastSynced: new Date() };
        await user.save();

        res.json({ success: true, stats: user.stats });
    } catch (err) {
        console.error("Sync error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
