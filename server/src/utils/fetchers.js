import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false, keepAlive: false, family: 4 });

const axiosInstance = axios.create({
    httpsAgent,
    timeout: 60000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Connection': 'close'
    }
});

// Central fetchWithPuppeteer using dynamic import for stealth
const fetchWithPuppeteer = async (url, evaluateFn) => {
    try {
        const puppeteer = (await import('puppeteer-extra')).default;
        const StealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default;
        puppeteer.use(StealthPlugin());

        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36');
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            await new Promise(r => setTimeout(r, 2000)); // wait for hydration
            const result = await page.evaluate(evaluateFn);
            return result;
        } finally {
            await browser.close();
        }
    } catch (e) {
        console.error(`Puppeteer failed for ${url}: ${e.message}`);
        return null;
    }
};

export async function fetchAllStats(handles) {
    if (!handles) return aggregateStats({});
    const results = {};

    const safeFetch = async (promise) => {
        try { return await promise; }
        catch (e) { return null; }
    };

    const fetchers = [
        safeFetch(fetchLeetCode(handles.leetcode)).then(res => results.leetcode = res),
        safeFetch(fetchCodeforces(handles.codeforces)).then(res => results.codeforces = res),
        safeFetch(fetchCodeChef(handles.codechef)).then(res => results.codechef = res),
        safeFetch(fetchGFGWithPuppeteer(handles.gfg)).then(res => results.gfg = res),
        safeFetch(fetchAtCoderWithPuppeteer(handles.atcoder)).then(res => results.atcoder = res),
        safeFetch(fetchSPOJWithPuppeteer(handles.spoj)).then(res => results.spoj = res),
        safeFetch(fetchHackerRankWithPuppeteer(handles.hackerrank)).then(res => results.hackerrank = res),
        safeFetch(fetchHackerEarthWithPuppeteer(handles.hackerearth)).then(res => results.hackerearth = res)
    ];

    await Promise.all(fetchers);

    return aggregateStats(results);
}

// LeetCode
async function fetchLeetCode(username) {
    if (!username) return null;
    const query = `
    query userProfile($username: String!) {
        matchedUser(username: $username) {
            submitStats: submitStatsGlobal {
                acSubmissionNum { difficulty count }
            }
            submissionCalendar
        }
        userContestRanking(username: $username) { rating }
    }`;
    const response = await axiosInstance.post("https://leetcode.com/graphql", { query, variables: { username } }, {
        headers: { "Content-Type": "application/json", "Referer": "https://leetcode.com" }
    });

    const data = response.data.data;
    if (!data || !data.matchedUser) return null;

    const stats = data.matchedUser.submitStats.acSubmissionNum;
    const totalSolved = stats.find(s => s.difficulty === "All")?.count || 0;
    const easy = stats.find(s => s.difficulty === "Easy")?.count || 0;
    const medium = stats.find(s => s.difficulty === "Medium")?.count || 0;
    const hard = stats.find(s => s.difficulty === "Hard")?.count || 0;
    const contestRating = data.userContestRanking ? Math.round(data.userContestRanking.rating) : 0;

    let activeDays = 0;
    let activityHeatmap = [];
    try {
        const calendar = JSON.parse(data.matchedUser.submissionCalendar || '{}');
        activeDays = Object.keys(calendar).length;
        activityHeatmap = Object.entries(calendar).map(([timestamp, count]) => ({
            date: new Date(timestamp * 1000).toISOString().split('T')[0],
            count
        })).slice(-100); // Last 100 days
    } catch (e) { }

    return { totalSolved, easy, medium, hard, activeDays, contestRating, activityHeatmap };
}

// Codeforces
async function fetchCodeforces(handle) {
    if (!handle) return null;
    const [userResponse, statusResponse] = await Promise.all([
        axiosInstance.get(`https://codeforces.com/api/user.info?handles=${handle}`),
        axiosInstance.get(`https://codeforces.com/api/user.status?handle=${handle}`)
    ]);

    const userInfo = userResponse.data.result[0];
    const submissions = statusResponse.data.result;

    const solvedProblems = new Set();
    submissions.forEach(sub => {
        if (sub.verdict === "OK") solvedProblems.add(`${sub.problem.contestId}-${sub.problem.index}`);
    });

    return { totalSolved: solvedProblems.size, contestRating: userInfo.rating || 0 };
}

// CodeChef
async function fetchCodeChef(handle) {
    if (!handle) return null;
    const response = await axiosInstance.get(`https://www.codechef.com/users/${handle}`);
    const $ = cheerio.load(response.data);

    const bodyText = $('body').text().replace(/\s+/g, ' ');
    const solvedMatch = bodyText.match(/Total Problems Solved:\s*(\d+)/i);
    const totalSolved = solvedMatch ? parseInt(solvedMatch[1]) : 0;
    const contestRating = parseInt($(".rating-number").text()) || 0;

    return { totalSolved, contestRating };
}

// Puppeteer Fetchers
async function fetchGFGWithPuppeteer(handle) {
    if (!handle) return null;
    return await fetchWithPuppeteer(`https://auth.geeksforgeeks.org/user/${handle}/practice`, () => {
        let total = 0;
        document.querySelectorAll('.problem-count, .stat-value').forEach(el => {
            total += parseInt(el.innerText.trim()) || 0;
        });
        const rating = parseInt(document.querySelector('.coding-score, .score-value')?.innerText.trim()) || 0;
        return { totalSolved: total, contestRating: rating };
    });
}

async function fetchAtCoderWithPuppeteer(handle) {
    if (!handle) return null;
    try {
        // Since AtCoder has a reliable unofficial API, try it first to save time
        const response = await axiosInstance.get(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/ac_rank?user=${handle}`);
        if (response.data && response.data.count) {
            return { totalSolved: response.data.count, contestRating: 0 };
        }
    } catch (e) { }

    return await fetchWithPuppeteer(`https://atcoder.jp/users/${handle}`, () => {
        return { totalSolved: 0 }; // AtCoder doesn't easily show total solved on profile
    });
}

async function fetchSPOJWithPuppeteer(handle) {
    if (!handle) return null;
    try {
        const response = await axiosInstance.get(`http://www.spoj.com/users/${handle}/`);
        const $ = cheerio.load(response.data);
        let totalSolved = 0;
        $("dt").each((i, el) => {
            if ($(el).text().includes("Problems solved")) totalSolved = parseInt($(el).next("dd").text());
        });
        return { totalSolved };
    } catch (e) {
        return await fetchWithPuppeteer(`https://www.spoj.com/users/${handle}/`, () => {
            const els = Array.from(document.querySelectorAll('dt'));
            const el = els.find(x => x.innerText.includes('Problems solved'));
            return { totalSolved: el ? parseInt(el.nextElementSibling.innerText) : 0 };
        });
    }
}

async function fetchHackerRankWithPuppeteer(handle) {
    if (!handle) return null;
    return await fetchWithPuppeteer(`https://www.hackerrank.com/${handle}`, () => {
        if (document.title.includes("Page Not Found") || document.title.includes("404")) return { totalSolved: 0 };
        const badges = document.querySelectorAll('.badge-title').length || 0;
        return { totalSolved: badges * 5 }; // Rough estimate
    });
}

async function fetchHackerEarthWithPuppeteer(handle) {
    if (!handle) return null;
    return await fetchWithPuppeteer(`https://www.hackerearth.com/@${handle}`, () => {
        return { totalSolved: 0 };
    });
}

// Aggregator
function aggregateStats(results) {
    let totalSolved = 0, easy = 0, medium = 0, hard = 0, activeDays = 0;
    let dsaTopics = { "Arrays": 12, "Strings": 8, "DP": 5, "Graphs": 2 }; // Mocking some general topics
    let contestRatings = {};
    let awards = ["Problem Solver", "Consistent Coder"];
    let cScore = 500;
    let activityHeatmap = [];

    Object.entries(results).forEach(([platform, s]) => {
        if (s) {
            totalSolved += s.totalSolved || 0;
            easy += s.easy || 0;
            medium += s.medium || 0;
            hard += s.hard || 0;
            if (s.activeDays && s.activeDays > activeDays) activeDays = s.activeDays;
            if (s.contestRating) contestRatings[platform] = s.contestRating;
            if (s.activityHeatmap && s.activityHeatmap.length > 0) {
                // simple merge of heatmap could be complex, we just take leetcode's for now as representative
                if (activityHeatmap.length === 0) activityHeatmap = s.activityHeatmap;
            }
            cScore += (s.totalSolved || 0) * 5;
            if (s.contestRating) cScore += s.contestRating * 0.1;
        }
    });

    return {
        totalSolved, easy, medium, hard, activeDays,
        dsaTopics, contestRatings, awards, cScore, activityHeatmap
    };
}
