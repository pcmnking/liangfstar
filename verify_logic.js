const fs = require('fs');
const path = require('path');

// 1. Load Data
const dataPath = path.join(__dirname, 'assets/js/ziwei_data_P.js');
const dataContent = fs.readFileSync(dataPath, 'utf8');
// Extract object
let ZIWEI_DATA_P;
try {
    // Find start and end of object using regex or substring, 
    // assuming refactor script did its job and formatted it well or we can just eval it context-free?
    // The file has `const ZIWEI_DATA_P = { ... };`.
    // Let's strip the prefix and suffix.
    let jsonStr = dataContent.replace(/^const\s+ZIWEI_DATA_P\s*=\s*/, '');
    // Remove potential suffix like `;` or `const ...` if multiple objects
    // We only want the first object if there are multiple.
    // Use the same logic as refactor script to be safe? Or just eval?
    // Eval is easiest for JS files.
    ZIWEI_DATA_P = eval('(' + jsonStr.split('const ZIWEI_DATA_ZIHUA')[0].trim().replace(/;$/, '') + ')');
} catch (e) {
    console.error("Error loading data:", e);
    process.exit(1);
}

// 2. Load Logic (Mocking ZiWeiChart)
// We need the class definition. I will copy-paste the minimal class structure from app.js
// or read app.js and eval the class definition.
const appPath = path.join(__dirname, 'assets/js/app.js');
const appContent = fs.readFileSync(appPath, 'utf8');

// Extract ZiWeiChart class
// It starts with `class ZiWeiChart {` and ends before `document.addEventListener`.
// This is brittle but effective for a quick test.
const classStart = appContent.indexOf('class ZiWeiChart {');
const classEnd = appContent.indexOf('// UI Controller');
const classCode = appContent.substring(classStart, classEnd);

// Define Palace class shim if needed, or include it
const palaceClassStart = appContent.indexOf('class Palace {');
const palaceClassEnd = classStart;
const palaceClassCode = appContent.substring(palaceClassStart, palaceClassEnd);

// Eval class definitions
eval(palaceClassCode);
eval(classCode);

// 3. Setup Test
const chart = new ZiWeiChart();
// Inject data manually since we are in node
chart.interpretations = ZIWEI_DATA_P;

// 4. Test Cases
console.log("Starting Verification...");

const testCases = [
    { source: "命", trans: "禄", target: "兄弟", expected: "命宮" }, // Simplified inputs
    { source: "财帛", trans: "权", target: "夫妻", expected: "財帛宮" }, // Simplified + map
    { source: "迁移", trans: "科", target: "父母", expected: "遷移宮" }, // Simplified
    { source: "事业", trans: "忌", target: "交友", expected: "事業宮" }, // Simplified
    { source: "命宮", trans: "祿", target: "兄弟宮", expected: "命宮" }, // Traditional input
];

let passed = 0;
let failed = 0;

testCases.forEach((tc, idx) => {
    console.log(`Test ${idx + 1}: ${tc.source} -> ${tc.trans} -> ${tc.target}`);
    const result = chart.getInterpretation(tc.source, tc.trans, tc.target);

    // Check if result is valid (not the error message)
    if (result && result !== '(暫無此象義)' && result !== '(正在讀取象義資料...)') {
        console.log(`  PASSED: Found interpretation starting with: ${result.substring(0, 20)}...`);
        passed++;
    } else {
        console.log(`  FAILED: Got ${result}`);
        // Debug normalized keys
        console.log(`  Debug: Normalized Source: ${chart.normalizeKey(tc.source)}`);
        console.log(`  Debug: Normalized Trans: ${chart.normalizeKey(tc.trans)}`);
        console.log(`  Debug: Normalized Target: ${chart.normalizeKey(tc.target)}`);
        failed++;
    }
});

console.log(`\nVerification Complete. Passed: ${passed}, Failed: ${failed}`);
if (failed === 0) {
    console.log("All tests passed!");
} else {
    console.error("Some tests failed.");
    process.exit(1);
}
