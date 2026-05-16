import express from 'express';
import { User } from '../models/User.js';
import { fetchAllStats } from '../utils/fetchers.js';
import { requireAuth } from '../utils/authMiddleware.js';

const router = express.Router();

router.post('/sync', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const newStats = await fetchAllStats(user.handles);

        // Persist both stats and lastSynced
        user.stats = {
            ...user.stats.toObject ? user.stats.toObject() : user.stats,
            ...newStats,
            lastSynced: new Date()
        };
        user.markModified('stats');
        await user.save();

        res.json({ success: true, stats: user.stats });
    } catch (err) {
        console.error("Sync error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
