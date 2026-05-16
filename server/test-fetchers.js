import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

const agent = new https.Agent({
    rejectUnauthorized: false,
    keepAlive: false,
    family: 4
});

const axiosInstance = axios.create({
    httpsAgent: agent,
    timeout: 30000,
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }
});

async function testGFG(handle) {
    try {
        const res = await axiosInstance.get(`https://www.geeksforgeeks.org/user/${handle}/`);
        const $ = cheerio.load(res.data);
        const text = $("body").text();
        const scoreMatch = text.match(/Overall Coding Score\s*(\d+)/i);
        const solvedMatch = text.match(/Problems Solved\s*(\d+)/i) || text.match(/Total Problem Solved\s*(\d+)/i);
        console.log("GFG Scraped:", {
            codingScore: scoreMatch ? parseInt(scoreMatch[1]) : 0,
            totalSolved: solvedMatch ? parseInt(solvedMatch[1]) : 0
        });
        
        // Let's print out some elements to see the structure
        console.log("GFG Profile score class:", $(".score_cards_container").text().replace(/\s+/g, ' '));
    } catch (e) {
        console.log("GFG Axios failed", e.message);
    }
}

async function testHackerEarth(handle) {
    console.log(`Testing HackerEarth for ${handle}`);
    try {
        const res = await axiosInstance.get(`https://www.hackerearth.com/@${handle}`);
        const $ = cheerio.load(res.data);
        console.log("HE page title:", $("title").text());
        // find numbers
        console.log("HE metrics:", $(".track-space .weight-700").text());
    } catch (e) {
        console.log("HackerEarth failed", e.message);
    }
}

async function run() {
    await testGFG("vikas062");
    await testHackerEarth("vikassinghgkp62"); // assuming this handle
}

run();
