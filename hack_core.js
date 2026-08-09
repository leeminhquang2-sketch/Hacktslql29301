// hack_core.js - Logic Hack Core
const axios = require('axios');
const CryptoJS = require('crypto-js');

const STATIC_KEY = CryptoJS.enc.Utf8.parse("a454dfdb578edfed");
const STATIC_IV = CryptoJS.enc.Utf8.parse("42938ksk2s394030");

const HEADERS = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "el_webview tizen",
    "Accept": "*/*",
    "X-Requested-With": "busidol.mobile.eldorado",
};

const BASE_URLS = {
    AMO: "http://211.253.26.47:8092/ELDORADO_M_2025/",
    ATV: "http://14.63.197.40:8022/ELDORADO_ATV_2025/",
    LG: "http://211.253.26.47:8081/ELDORADO_LG/",
    SS: "http://211.253.26.47:8089/ELDORADO_SSVN/",
};

const CHAR_7S = [
    { id: 63, name: "Ace" }, { id: 66, name: "Echo" }, { id: 67, name: "Smartie" }, { id: 68, name: "Khan" },
    { id: 49, name: "Lucy(thần)" }, { id: 64, name: "Bebee" }, { id: 65, name: "Ruby" }, { id: 48, name: "Goldman" },
    { id: 56, name: "Gingerman" }, { id: 62, name: "Bensi" }, { id: 75, name: "Jey" }, { id: 81, name: "Koo" },
    { id: 99, name: "Thrue" }, { id: 50, name: "Lucy(xe)" },
];

function getCharName(n) {
    const found = CHAR_7S.find(c => c.id === Number(n));
    return found ? found.name : `Char${n}`;
}

function encryptForce(t) {
    return CryptoJS.AES.encrypt(typeof t != "string" ? JSON.stringify(t) : t, STATIC_KEY, { iv: STATIC_IV }).toString();
}

function decryptForce(c) {
    try {
        if (c.includes("%")) c = decodeURIComponent(c);
        return CryptoJS.AES.decrypt(c, STATIC_KEY, { iv: STATIC_IV }).toString(CryptoJS.enc.Utf8) || null;
    } catch { return null; }
}

function genKey(ts, td, d2) {
    const u = String(ts) + String(td) + (d2 || ""), k = CryptoJS.enc.Utf8.parse(u.slice(0, 16));
    let i = u.slice(16, 32);
    while (i.length < 16) i += ":";
    return { key: k, iv: CryptoJS.enc.Utf8.parse(i) };
}

async function getHost(hostId, platform) {
    const isAtv = platform === "ATV";
    const p = {
        HOST_ID: hostId, MODE: "PACKAGE", VER_DATE: "20260615",
        VERSION: isAtv ? "EL_ATV_20260615" : "EL_AMO_20260615",
        SDK_VERSION: "0", MODEL_NAME: "", TARGET_PLATFORM: 12,
        EMAIL: "", COMMENT: "CANCEL_AUTH_NUMBER", USER_KEY: "",
        LANG: 1, IS_SYNC: "false", RUN_COUNT: 0
    };
    const enc = encryptForce(JSON.stringify(p));
    const res = await axios.post(
        BASE_URLS[platform] + "cnm_exist_host_in_server.php",
        `ID=${encodeURIComponent(hostId)}&CRY_DATA=${encodeURIComponent(enc)}`,
        { headers: HEADERS, timeout: 15000 }
    );
    let d = res.data;
    if (typeof d == "string") { try { d = JSON.parse(d) } catch {} }
    if (d && d.CRY_DATA) { const dec = decryptForce(d.CRY_DATA); if (dec) return JSON.parse(dec); }
    return d;
}

async function getRun(hostId, platform) {
    const isAtv = platform === "ATV", ver = isAtv ? "EL_ATV_20260727" : "EL_AMO_20260727";
    const res = await axios.post(
        BASE_URLS[platform] + "Mobile_Link/get_cur_run_count.php",
        new URLSearchParams({ HOST_ID: hostId, VER_DATE: "20260724", IS_SYNC: "false", USER_KEY: "", RUN_COUNT: "1", VERSION: ver }).toString(),
        { headers: HEADERS, timeout: 10000 }
    );
    return parseInt(String(res.data).trim(), 10) || 0;
}

async function hackChar(hostId, platform, charNum, lv, maxLv) {
    const info = await getHost(hostId, platform);
    const run = await getRun(hostId, platform);
    const isAtv = platform === "ATV";
    
    if (!lv) lv = 100;
    if (!maxLv) maxLv = 100;
    
    const nc = `${charNum}:${lv}:${maxLv}:0:0`;
    let d2 = info.DATA2 || "";
    const arr = d2.split(",").filter(c => c);
    const idx = arr.findIndex(c => c.startsWith(`${charNum}:`));
    
    if (idx >= 0) arr[idx] = nc;
    else arr.push(nc);
    
    d2 = arr.join(",");
    const keys = genKey(info.timestamp, info.today, d2);
    const etc = `캐릭터 잠금 캐릭터 번호 (${charNum})`;
    const payload = {
        HOST_ID: hostId, ITEM: info.item || "", DATA2: d2,
        SELECTED_USER: "1:2:0:0:0", MODE: "char_lock", ETC: etc,
        VER_DATE: "20260724", LANG: 3, IS_SYNC: "false",
        USER_KEY: "", RUN_COUNT: String(run),
        VERSION: isAtv ? "EL_ATV_20260727" : "EL_AMO_20260727"
    };
    
    const enc = CryptoJS.AES.encrypt(JSON.stringify(payload), keys.key, { iv: keys.iv }).toString();
    const res = await axios.post(
        BASE_URLS[platform] + "item/update_data2_item.php",
        `crypt=1&ID=${encodeURIComponent(hostId)}&CRY_DATA=${encodeURIComponent(enc)}`,
        { headers: HEADERS, timeout: 15000 }
    );
    return res.data;
}

module.exports = { hackChar, getCharName, CHAR_7S };