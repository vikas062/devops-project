import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const userSchema = new mongoose.Schema({
    handles: {
        leetcode: String,
        codechef: String,
        codeforces: String,
        hackerrank: String,
        spoj: String,
        atcoder: String,
        gfg: String
    }
}, { strict: false });

const User = mongoose.model('User', userSchema);

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({});
    users.forEach(u => console.log(`User ID: ${u._id} | Handles:`, u.handles));
    process.exit(0);
}
check();
