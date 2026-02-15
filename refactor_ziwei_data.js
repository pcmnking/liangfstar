const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'assets/js/ziwei_data_P.js'); // Adjust path as needed

// 1. Simplified to Traditional Mapping (Common Ziwei terms)
const charMap = {
    '禄': '祿',
    '权': '權',
    '门': '門',
    '机': '機',
    '迁': '遷',
    '艺': '藝',
    '属': '屬',
    '参': '參',
    '昼': '晝',
    '财': '財',
    '车': '車',
    '马': '馬',
    '宫': '宮',
    '罗': '羅',
    '贝': '貝',
    '见': '見',
    '页': '頁',
    '气': '氣',
    '鱼': '魚',
    '鸟': '鳥',
    '龙': '龍',
    '龟': '龜',
    '农': '農',
    '长': '長',
    '个': '個',
    '们': '們',
    '伦': '倫',
    '仓': '倉',
    '伟': '偉',
    '侧': '側',
    '备': '備',
    '杰': '傑',
    '传': '傳',
    '伤': '傷',
    '仪': '儀',
    '优': '優',
    '偿': '償',
    '元': '元', // No change
    '园': '園',
    '团': '團',
    '图': '圖',
    '国': '國',
    '圆': '圓',
    '土': '土', // No change
    '地': '地', // No change
    '场': '場',
    '块': '塊',
    '坏': '壞',
    '墙': '牆',
    '增': '增', // No change
    '声': '聲',
    '处': '處',
    '备': '備',
    '复': '復',
    '头': '頭',
    '夸': '誇',
    '夹': '夾',
    '夺': '奪',
    '奋斗': '奮鬥',
    '奸': '姦',
    '妇': '婦',
    '妈': '媽',
    '孙': '孫',
    '实': '實',
    '宁': '寧',
    '宽': '寬',
    '导': '導',
    '寿': '壽',
    '将': '將',
    '专': '專',
    '寻': '尋',
    '对': '對',
    '导': '導',
    '层': '層',
    '届': '屆',
    '属': '屬',
    '冈': '岡',
    '岩': '巖',
    '岛': '島',
    '峡': '峽',
    '峦': '巒',
    '师': '師',
    '帅': '帥',
    '帐': '帳',
    '带': '帶',
    '帮': '幫',
    '干': '乾', // Context dependent, usually Qian in divination
    '广': '廣',
    '庆': '慶',
    '庐': '廬',
    '库': '庫',
    '应': '應',
    '庙': '廟',
    '庞': '龐',
    '废': '廢',
    '异': '異',
    '弑': '弒',
    '张': '張',
    '强': '強',
    '归': '歸',
    '录': '錄',
    '彻': '徹',
    '征': '徵',
    '德': '德', // No change
    '忆': '憶',
    '忧': '憂',
    '怀': '懷',
    '态': '態', // No change
    '总': '總',
    '恋': '戀',
    '恳': '懇',
    '恶': '惡',
    '恼': '惱',
    '悬': '懸',
    '惊': '驚',
    '才': '才', // No change
    '扑': '撲',
    '执': '執',
    '扩': '擴',
    '扫': '掃',
    '扬': '揚',
    '护': '護',
    '报': '報',
    '损': '損',
    '换': '換',
    '据': '據',
    '捷': '捷', // No change
    '搀': '攙',
    '摄': '攝',
    '摆': '擺',
    '摇': '搖',
    '摊': '攤',
    '无': '無',
    '时': '時',
    '是': '是', //  No change
    '显': '顯',
    '晒': '曬',
    '晓': '曉',
    '晕': '暈',
    '暂': '暫',
    '术': '術',
    '机': '機',
    '杀': '殺',
    '杂': '雜',
    '权': '權',
    '条': '條',
    '来': '來',
    '杨': '楊',
    '标': '標',
    '树': '樹',
    '样': '樣',
    '档': '檔',
    '桥': '橋',
    '梁': '梁', // No change
    '梦': '夢',
    '检': '檢',
    '椭': '橢',
    '楼': '樓',
    '乐': '樂',
    '样': '樣',
    '概': '概', // No change
    '构': '構',
    '枪': '槍',
    '柜': '櫃',
    '台': '臺',
    '湾': '灣',
    '叹': '嘆',
    '团': '團',
    '园': '園',
    '围': '圍',
    '图': '圖',
    '圆': '圓',
    '圣': '聖',
    '场': '場',
    '坏': '壞',
    '块': '塊',
    '坚': '堅',
    '坛': '壇',
    '坝': '壩',
    '坞': '塢',
    '墳': '墳',
    '坠': '墜',
    '垄': '壟',
    '垒': '壘',
    '垦': '墾',
    '处': '處',
    '备': '備',
    '复': '復',
    '够': '夠',
    '夹': '夾',
    '夺': '奪',
    '奋': '奮',
    '奖': '獎',
    '奥': '奧',
    '妆': '妝',
};

// 2. Palace Names Definition
const palaceNames = [
    '命宮', '兄弟宮', '夫妻宮', '子女宮',
    '財帛宮', '疾厄宮', '遷移宮', '交友宮',
    '事業宮', '田宅宮', '福德宮', '父母宮'
];

// Helper: Convert Simplified to Traditional
function toTraditional(str) {
    if (!str) return str;
    return str.split('').map(char => charMap[char] || char).join('');
}

// Helper: Normalize Palace Name (Add '宮' if missing, ensure Traditional)
function normalizePalaceName(name) {
    let tradName = toTraditional(name);
    // If it's a known palace prefix without '宮', add it.
    // Check against palaceNames list (checking prefixes)
    for (const fullPalace of palaceNames) {
        const prefix = fullPalace.replace('宮', '');
        if (tradName === prefix) {
            return fullPalace;
        }
        if (tradName === fullPalace) {
            return fullPalace;
        }
    }
    // Fallback: if it ends with 宮, keep it, else might be something else
    // But be careful not to append 宮 to everything if it's not a palace
    // We assume the top-level keys and 3rd-level keys are palaces.

    // Check if it's likely a palace name (common 2-char prefixes)
    const commonPrefixes = ['命', '兄弟', '夫妻', '子女', '財帛', '疾厄', '遷移', '交友', '事業', '田宅', '福德', '父母'];
    // Handle '官祿' -> '事業' mapping if needed, or just normalize chars
    if (tradName === '官祿' || tradName === '官祿宮') return '事業宮';
    if (tradName === '僕役' || tradName === '僕役宮') return '交友宮';

    if (commonPrefixes.includes(tradName)) return tradName + '宮';

    return tradName;
}

// Helper: Normalize Transformation Key (禄, 权, 科, 忌)
function normalizeTransKey(key) {
    let tradKey = toTraditional(key);
    // Ensure it matches one of the 4 types exactly if possible
    if (['祿', '權', '科', '忌'].includes(tradKey)) return tradKey;
    // Handle simplified input mapping specifically for these 4
    if (key === '禄') return '祿';
    if (key === '权') return '權';
    return tradKey;
}


// Main logic
try {
    let fileContent = fs.readFileSync(filePath, 'utf8');

    // Extract the object part. Assuming format `const ZIWEI_DATA_P = { ... }`
    // We will use eval to get the object (safe context for this task)
    // Or simplified: remove 'const ZIWEI_DATA_P = ' and parse JSON if strictly JSON-like
    // But it's JS object, likely has comments/no-quotes keys? 
    // The provided file sample shows quoted keys and string values.
    // Let's use a sandboxed vm or just `eval` since it's local trusted code.

    // Remove the declaration to get the object literal
    let objectLiteralStr = fileContent.replace(/const\s+ZIWEI_DATA_P\s*=\s*/, '').trim();
    // Remove potential trailing semicolon
    if (objectLiteralStr.endsWith(';')) {
        objectLiteralStr = objectLiteralStr.slice(0, -1);
    }

    // Eval to get the object
    let ZIWEI_DATA_P;
    try {
        ZIWEI_DATA_P = eval('(' + objectLiteralStr + ')');
    } catch (e) {
        console.error("Error parsing ZIWEI_DATA_P object:", e);
        // Fallback or exit
        process.exit(1);
    }

    const NEW_DATA = {};

    // Level 1: Source Palace
    for (const [key1, val1] of Object.entries(ZIWEI_DATA_P)) {
        const newKey1 = normalizePalaceName(key1);
        if (!NEW_DATA[newKey1]) NEW_DATA[newKey1] = {};

        // Level 2: Transformation (Lu, Quan, Ke, Ji)
        for (const [key2, val2] of Object.entries(val1)) {
            const newKey2 = normalizeTransKey(key2);
            if (!NEW_DATA[newKey1][newKey2]) NEW_DATA[newKey1][newKey2] = {};

            // Level 3: Target Palace
            for (const [key3, val3] of Object.entries(val2)) {
                // Determine if key3 is a palace or 'self' (自化)
                // If val3 contains "自化", key3 is typically the same as Source Palace
                // But the structure maps Target Palace.

                // Normalizing key3
                let newKey3 = normalizePalaceName(key3);

                // Check for '命' special case if it's meant to be '命宮'
                if (newKey3 === '命') newKey3 = '命宮';

                // Merge content if matches
                if (NEW_DATA[newKey1][newKey2][newKey3]) {
                    console.log(`Merging content for ${newKey1} -> ${newKey2} -> ${newKey3}`);
                    // Concatenate with a newline separator if different
                    if (NEW_DATA[newKey1][newKey2][newKey3] !== val3) {
                        NEW_DATA[newKey1][newKey2][newKey3] += '\n' + val3;
                    }
                } else {
                    NEW_DATA[newKey1][newKey2][newKey3] = val3;
                }
            }
        }
    }

    // Convert back to string
    const newFileContent = `const ZIWEI_DATA_P = ${JSON.stringify(NEW_DATA, null, 2)};`;

    fs.writeFileSync(filePath, newFileContent, 'utf8');
    console.log('Successfully refactored ziwei_data_P.js');

} catch (err) {
    console.error('Error:', err);
}
