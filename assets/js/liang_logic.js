
/**
 * Liang Pai Flying Star Analysis Logic
 * 梁派飛星深度分析模組
 */

const LiangLogic = {
    // Helper: Determine where a specific transformation from a source stem lands
    // type: 'Lu', 'Quan', 'Ke', 'Ji' (0, 1, 2, 3)
    // Returns: The target Palace object or null
    getFlyingStarTarget: function (chart, sourceStem, transTypeIndex) {
        if (!chart.fourTransMap || !chart.fourTransMap[sourceStem]) return null;
        const starName = chart.fourTransMap[sourceStem][transTypeIndex];

        // Find which palace contains this star
        const targetBranch = Object.keys(chart.palaces).find(b =>
            chart.palaces[b].stars.includes(starName)
        );

        return targetBranch ? chart.palaces[targetBranch] : null;
    },

    // Helper: Check for Self-Transformation (Self-Ji) in a specific palace
    hasSelfTrans: function (chart, palace, typeIndex) {
        if (!palace) return false;
        const stem = palace.celestial;
        if (!chart.fourTransMap[stem]) return false;

        const starName = chart.fourTransMap[stem][typeIndex];
        // Check if the star transformed is INSIDE the palace itself
        return palace.stars.includes(starName);
    },

    // Theme Colors for Palaces (Mapping Original Palette Nature)
    PALACE_THEME_COLORS: {
        '命宮': '#1a237e', '兄弟': '#00695c', '夫妻': '#c2185b', '子女': '#f57c00',
        '財帛': '#1565c0', '疾厄': '#e53935', '遷移': '#7b1fa2', '交友': '#00838f',
        '事業': '#2e7d32', '田宅': '#795548', '福德': '#9e9d24', '父母': '#455a64'
    },

    getThemeColor: function(title) {
        if (!title) return '#777';
        // Match the core original palace name
        for (const key in this.PALACE_THEME_COLORS) {
            if (title.includes(key)) return this.PALACE_THEME_COLORS[key];
        }
        return '#777';
    },

    // Helper: Get Palace by Title (e.g., '命宮')
    getPalaceByTitle: function (chart, title) {
        const branch = Object.keys(chart.palaces).find(b => chart.palaces[b].title === title);
        return branch ? chart.palaces[branch] : null;
    },

    // 1. 財運模組：【祿入庫】判定 (The Wealth Vault)
    analyzeWealthVault: function (chart) {
        const mingPalace = this.getPalaceByTitle(chart, '命宮');
        if (!mingPalace) return null;

        // Ming Lu -> Target
        const transLuIndex = 0; // 祿
        const targetPalace = this.getFlyingStarTarget(chart, mingPalace.celestial, transLuIndex);

        if (!targetPalace) return null;

        const isWealthVault = targetPalace.title === '田宅' || targetPalace.title === '兄弟';

        if (isWealthVault) {
            // Get Star Name for Trace
            const starName = chart.fourTransMap[mingPalace.celestial][0];

            // Check for Self-Ji in the target palace (Self-Ji = Leak)
            const hasSelfJi = this.hasSelfTrans(chart, targetPalace, 3); // 3 is Ji

            if (!hasSelfJi) {
                return {
                    title: "【財運評估】",
                    stars: "⭐⭐⭐⭐⭐",
                    result: "大富格/聚寶盆",
                    advice: "命格顯示您是天生的『築巢專家』。您對家庭與置產有極高的熱情（命祿入庫），且幸運的是您的財庫非常穩固（無自化）。建議您有錢就買房，這是您最穩賺不賠的投資，命主將畢生心力投注於置產與家庭，適合透過不動產累積豐厚財富，屬實質富有之人。",
                    reason: `命宮(${mingPalace.celestial}) ${starName}化祿 ➜ ${targetPalace.title}<br>${targetPalace.title} 無自化忌 (庫穩)`
                };
            } else {
                return {
                    title: "【財運評估】",
                    stars: "⭐⭐",
                    result: "過路財神",
                    advice: "雖有心置產或存錢（命祿入庫），但庫底有漏（該宮自化忌）。錢財易因突發狀況或過度開銷而流失。這不是你賺不到錢，而是『留不住』。建議強制儲蓄或以『定存/保險/房產信託』鎖住資金，不要讓現金留在手上。",
                    reason: `命宮(${mingPalace.celestial}) ${starName}化祿 ➜ ${targetPalace.title}<br>${targetPalace.title} 自化忌 (漏財)`
                };
            }
        }

        return null;
    },

    // 2. 精神/福德模組：【祿忌交戰】判定 (The Mental Struggle)
    analyzeMentalState: function (chart) {
        const fudePalace = this.getPalaceByTitle(chart, '福德');
        const mingPalace = this.getPalaceByTitle(chart, '命宮');
        if (!fudePalace || !mingPalace) return null;

        // Check Birth Year Lu/Ji in Fude
        // chart.palaces[branch].trans contains birth year trans objects {star, type}
        const hasBirthLu = fudePalace.trans.some(t => t.type === '祿');
        const hasBirthJi = fudePalace.trans.some(t => t.type === '忌');

        // Check Ming Ji -> Fude
        const mingJiTarget = this.getFlyingStarTarget(chart, mingPalace.celestial, 3); // Ji
        const mingJiInFude = mingJiTarget && mingJiTarget.name === fudePalace.name;

        // Logic A: Mental Struggle (Conflict)
        // If Fude has (Birth Lu AND Birth Ji) OR (Ming Ji into Fude finding Birth Lu)
        if ((hasBirthLu && hasBirthJi) || (mingJiInFude && hasBirthLu)) {
            let reason = "";
            if (hasBirthLu && hasBirthJi) reason = "福德宮內坐 生年祿 + 生年忌 (祿忌同宮)";
            else reason = `福德宮坐生年祿 + 命宮(${mingPalace.celestial})化忌入福德 (祿忌交戰)`;

            return {
                title: "【心靈處方】",
                stars: "⭐⭐",
                type: "祿忌交戰",
                advice: "雖然物質富足或看似樂觀，但您的內心戲非常多。福德宮的『祿忌交戰』顯示您常在『興奮』與『焦慮』中拉扯。命主大腦運轉極快，但也因此容易鑽牛角尖。您的成就是用腦力換來的，請務必學習『鈍感力』，放過自己，不要事事求完美，需注意神經系統保養與睡眠品質。",
                reason: reason
            };
        }

        // Logic B: Obsession (Ji into Fude)
        if (mingJiInFude) {
            const starName = chart.fourTransMap[mingPalace.celestial][3];
            return {
                title: "【心靈處方】",
                stars: "⭐⭐⭐",
                type: "執著煩惱",
                advice: "您容易過於執著於自己的精神世界或嗜好，命宮化忌入福德，代表『我執』於享樂或精神層面，但也容易因此自尋煩惱。易有固執己見或情緒內耗的傾向。建議多接觸大自然或宗教哲學，轉移注意焦點。",
                reason: `命宮(${mingPalace.celestial}) ${starName}化忌 ➜ 福德宮 (命忌入福德)`
            };
        }

        return null;
    },

    // 4. Advanced Insight Modules (D, E, F)
    // 4. Advanced Insight Modules (D, E, F) - NOW POWERED BY PSYCHOLOGY ENGINE
    getPsychologicalInsight: function (chart) {
        if (!window.PsychologyEngine || !window.PSYCHOLOGY_RULES) {
            console.warn("PsychologyEngine or Rules not found. Falling back to internal logic or empty.");
            return [];
        }

        const engine = new window.PsychologyEngine(chart);
        const results = engine.evaluate(window.PSYCHOLOGY_RULES);

        // Map results to the format expected by generateLiangStyleReport
        return results.map(r => {
            // Check triggers to generate a reason string
            let reasonStr = "";
            r.triggers.forEach((t, idx) => {
                if (idx > 0) reasonStr += "<br>+ ";
                if (t.type === 'fly') {
                    if (t.check_collision) reasonStr += "(沖) ";
                    // Compact format: Source化Transform入Target
                    reasonStr += `${t.source}化${t.transform}入${t.target || '...'}`;
                } else if (t.type === 'self') {
                    reasonStr += `${t.source}自化${t.transform}`;
                } else if (t.type === 'exist') {
                    reasonStr += `${t.source}坐${t.has_birth_transform}`;
                }
            });

            // Make the reason string more readable (Chinese translation)
            reasonStr = reasonStr
                .replace(/ming/g, "命宮").replace(/tian_zhai/g, "田宅")
                .replace(/fude/g, "福德").replace(/wealth/g, "財帛")
                .replace(/career/g, "事業").replace(/health/g, "疾厄")
                .replace(/friends/g, "交友").replace(/spouse/g, "夫妻")
                .replace(/children/g, "子女").replace(/brother/g, "兄弟")
                .replace(/migration/g, "遷移").replace(/parents/g, "父母")
                .replace(/lu/g, "祿").replace(/quan/g, "權")
                .replace(/ke/g, "科").replace(/ji/g, "忌");

            return {
                tag: r.name ? r.name.split(' (')[0] : "心理洞察", // Use name until first bracket
                insight: r.content.insight,
                advice: r.content.advice,
                reason: reasonStr
            };
        });
    },

    // 5. Yearly Fortune Analysis (Traffic Light)
    analyzeYearlyFortune: function (chart) {
        const yearBranch = chart.liuNianMingGongBranch;
        const decadeBranch = chart.daYunMingGongBranch;

        if (!yearBranch || !decadeBranch) return null;

        const yearPalace = chart.palaces[yearBranch];
        const decadePalace = chart.palaces[decadeBranch];
        const decadeStem = decadePalace.celestial;

        // 1. Overlap (Theme)
        const overlapTitle = yearPalace.title.replace('宮', ''); // e.g., "事業"
        const theme = `流年命宮 重疊 本命${overlapTitle}宮`;

        // 2. Traffic Light Logic (Decade -> Year)
        // Decade Lu and Ji stars
        if (!chart.fourTransMap[decadeStem]) return null;

        const daYunLuStar = chart.fourTransMap[decadeStem][0]; // Lu
        const daYunJiStar = chart.fourTransMap[decadeStem][3]; // Ji

        // Check where Da Yun Lu flies
        const luTargetBranch = Object.keys(chart.palaces).find(b => chart.palaces[b].stars.includes(daYunLuStar));
        const luTargetPalace = chart.palaces[luTargetBranch];

        // Check where Da Yun Ji flies
        const jiTargetBranch = Object.keys(chart.palaces).find(b => chart.palaces[b].stars.includes(daYunJiStar));
        const jiTargetPalace = chart.palaces[jiTargetBranch];

        let trafficLight = "Yellow";
        let score = 70;
        let summary = "【耕耘年】一分耕耘，一分收穫。今年運勢平穩，沒有天上掉下來的禮物，也沒有太大的坑。成敗全看你自己。適合進修、考證照、調理身體，為明年做準備。";
        let detailedAdvice = ""; // Will be populated based on overlap

        // Green Light Logic: Da Yun Lu -> Year Ming (Sit or Shine/Opposite)
        // Shine/Opposite check: Opposite branch index difference is 6
        const yearIdx = chart.branches.indexOf(yearBranch);
        const luIdx = chart.branches.indexOf(luTargetBranch);
        const isLuEnter = luTargetBranch === yearBranch;
        const isLuShine = Math.abs(yearIdx - luIdx) === 6; // Opposite

        if (isLuEnter || isLuShine) {
            trafficLight = "Green";
            score = 90;
            summary = "【衝刺年】大運氣流助攻！今年是事半功倍的一年。大運化祿進入你的流年命宮（或照），代表機會主動找上門。適合創業、求職、擴大投資。請大膽行動，不要浪費好運。";
        }

        // Red Light Logic: Da Yun Ji -> Opposite of Year Ming (Clash Year Ming)
        const jiIdx = chart.branches.indexOf(jiTargetBranch);
        const isJiClash = Math.abs(yearIdx - jiIdx) === 6;

        if (isJiClash) {
            trafficLight = "Red";
            score = 50;
            summary = "【防守年】警報響起！今年你站在大運化忌的『靶心』上。環境充滿變數與排斥力。建議『多看少做』，嚴禁重大投資、借貸或隨意離職。安分守己，保平安就是最大的獲利。";
        }

        // Special Logic: Overlap Advice
        if (overlapTitle === '財帛' || overlapTitle === '田宅') {
            detailedAdvice = trafficLight === 'Green' ?
                "今年重點在『錢』。流年重疊財庫且亮綠燈，財運極佳，投資置產獲利機率高。" :
                (trafficLight === 'Red' ? "今年重點在『錢』。流年重疊財庫但亮紅燈，務必守成，嚴禁大額投資，慎防破財。" : "今年重點在『錢』。財運平穩，宜多儲蓄。");
        } else if (overlapTitle === '夫妻' || overlapTitle === '子女' || overlapTitle === '交友') { // Adding Friends for broader relationship coverage
            detailedAdvice = trafficLight === 'Green' ?
                "今年重點在『情』。流年重疊桃花位且亮綠燈，單身者有良緣，人際關係順遂。" :
                (trafficLight === 'Red' ? "今年重點在『情』。流年重疊桃花位但亮紅燈，注意感情爭吵或人際是非。" : "今年重點在『情』。人際平順，多陪伴家人。");
        } else if (overlapTitle === '疾厄' || overlapTitle === '父母') { // Parents often relates to body/appearance
            detailedAdvice = trafficLight === 'Green' ?
                "今年重點在『身』。身體狀況良好，適合健身或進行健康檢查。" :
                (trafficLight === 'Red' ? "今年重點在『身』。抵抗力較弱，需留意老毛病復發或意外，請多保重。" : "今年重點在『身』。平平安安，注意作息。");
        } else {
            detailedAdvice = `流年重疊本命${overlapTitle}，今年生活重心將圍繞在該領域展開。${score >= 80 ? "吉星高照，諸事順遂。" : "步步為營，持盈保泰。"}`;
        }

        return {
            yearLabel: `流年 ${yearBranch}宮`, // Simplify as we assume branch
            theme: theme,
            overlapTitle: overlapTitle,
            trafficLight: trafficLight,
            score: score,
            summary: summary,
            detailedAdvice: detailedAdvice,
            reason: trafficLight === 'Green' ?
                `大運${decadeStem}干 ${daYunLuStar}<span style="color:#1e88e5; font-weight:bold;">化祿</span> ${(isLuEnter ? "入" : "照")} 流年命宮(${yearBranch})` :
                (trafficLight === 'Red' ?
                    `大運${decadeStem}干 ${daYunJiStar}<span style="color:#e53935; font-weight:bold;">化忌</span> 沖 流年命宮(${yearBranch})` :
                    `大運${decadeStem}干 祿忌皆未沖照流年命宮`
                )
        };
    },


    // 6. Family Relation Mapping Module (借盤論六親 1-6-10)
    analyzeFamilyMember: function (chart, relationType) {
        // 1. Define Relative's Taiji (Mapping Table)
        const relationMap = {
            "Father": { palace: "父母", label: "父親" },
            "Mother": { palace: "兄弟", label: "母親" },
            "Spouse": { palace: "夫妻", label: "配偶" },
            "Child_1": { palace: "子女", label: "長子/長女" },
            "Child_2": { palace: "財帛", label: "次子/次女" },
            "Child_3": { palace: "疾厄", label: "三子/三女" },
            "Sibling_1": { palace: "兄弟", label: "長兄/長姊" },
            "Sibling_2": { palace: "夫妻", label: "二哥/二姊" }
        };

        const targetInfo = relationMap[relationType];
        if (!targetInfo) return null;

        const targetPalace = this.getPalaceByTitle(chart, targetInfo.palace);
        if (!targetPalace) return null;

        // 2. Perform Vital Scan ("1-6-10" Theory relative to New Ming)
        // Determine New Taiji Positions based on sequence offset
        // Standard Sequence: Ming(0), Brother(1), Spouse(2), Children(3), Wealth(4), Health(5), Migration(6), Friends(7), Career(8), Property(9), Fude(10), Parents(11)
        const palaceSequence = ['命宮', '兄弟', '夫妻', '子女', '財帛', '疾厄', '遷移', '交友', '事業', '田宅', '福德', '父母'];
        const startIdx = palaceSequence.indexOf(targetInfo.palace);

        // New Health (Jie) is +5 positions (1 -> 6)
        const newHealthTitle = palaceSequence[(startIdx + 5) % 12];
        const newHealthPalace = this.getPalaceByTitle(chart, newHealthTitle);

        // New Vault (Tian Zhai) is +9 positions (1 -> 10)
        const newVaultTitle = palaceSequence[(startIdx + 9) % 12];
        const newVaultPalace = this.getPalaceByTitle(chart, newVaultTitle);

        let findings = [];

        // Risk A (財庫破洞): IF [New Vault] has Self-Ji
        if (newVaultPalace && this.hasSelfTrans(chart, newVaultPalace, 3)) {
            const starJi = chart.fourTransMap[newVaultPalace.celestial][3];
            findings.push({
                icon: "💰",
                text: `庫位(${newVaultTitle})自化忌，代表${targetInfo.label}理財能力較弱，或較難存錢（財庫破洞）。`,
                reason: `${newVaultTitle}(${newVaultPalace.celestial}) ${starJi}自化忌`
            });
        }
        // Wealth Bonus: Self-Lu
        else if (newVaultPalace && this.hasSelfTrans(chart, newVaultPalace, 0)) {
            const starLu = chart.fourTransMap[newVaultPalace.celestial][0];
            findings.push({
                icon: "💰",
                text: `庫位(${newVaultTitle})自化祿，代表${targetInfo.label}現金流充裕，花錢大方。`,
                reason: `${newVaultTitle}(${newVaultPalace.celestial}) ${starLu}自化祿`
            });
        }

        // Risk B (健康/情緒): IF [New Health] has Self-Ji
        if (newHealthPalace && this.hasSelfTrans(chart, newHealthPalace, 3)) {
            const starJi = chart.fourTransMap[newHealthPalace.celestial][3];
            findings.push({
                icon: "💊",
                text: `疾厄位(${newHealthTitle})自化忌，代表${targetInfo.label}體質較弱或情緒起伏大。`,
                reason: `${newHealthTitle}(${newHealthPalace.celestial}) ${starJi}自化忌`
            });
        }

        // Risk C (與我關係): IF [New Ming] fly Ji to [Original Ming]
        const newMingJiTarget = this.getFlyingStarTarget(chart, targetPalace.celestial, 3);
        const newMingJiStar = chart.fourTransMap[targetPalace.celestial][3];
        const newMingLuTarget = this.getFlyingStarTarget(chart, targetPalace.celestial, 0);
        const newMingLuStar = chart.fourTransMap[targetPalace.celestial][0];

        if (newMingJiTarget && newMingJiTarget.title === '命宮') {
            findings.push({
                icon: "⚡",
                text: `該親屬化忌入本命，代表${targetInfo.label}會給你帶來壓力或責任（他是你的債主）。`,
                reason: `${targetInfo.label}(${targetInfo.palace}) ${newMingJiStar}化忌 入 命宮`
            });
        }
        else if (newMingJiTarget && newMingJiTarget.title === '遷移') {
            findings.push({
                icon: "⚡",
                text: `該親屬化忌沖本命，代表${targetInfo.label}與你緣分較薄或容易起衝突。`,
                reason: `${targetInfo.label}(${targetInfo.palace}) ${newMingJiStar}化忌 沖 命宮`
            });
        }

        // Lu to Me?
        if (newMingLuTarget && newMingLuTarget.title === '命宮') {
            findings.push({
                icon: "❤️",
                text: `該親屬化祿入本命，代表${targetInfo.label}對你很好，是你命中的貴人。`,
                reason: `${targetInfo.label}(${targetInfo.palace}) ${newMingLuStar}化祿 入 命宮`
            });
        }


        // Risk D (我對他好): IF [Original Ming] fly Lu to [New Ming]
        const mingPalace = this.getPalaceByTitle(chart, '命宮');
        const myLuTarget = this.getFlyingStarTarget(chart, mingPalace.celestial, 0); // Lu
        const myLuStar = chart.fourTransMap[mingPalace.celestial][0];

        if (myLuTarget && myLuTarget.title === targetInfo.palace) {
            findings.push({
                icon: "❤️",
                text: `你化祿入${targetInfo.palace}，代表你對${targetInfo.label}特別疼愛或照顧。`,
                reason: `命宮(${mingPalace.celestial}) ${myLuStar}化祿 入 ${targetInfo.palace}`
            });
        }

        // Default if empty
        if (findings.length === 0) {
            findings.push({
                icon: "✨",
                text: "關係與運勢平穩，無明顯沖剋或重大變動。",
                reason: "相關宮位無自化忌，互無忌沖"
            });
        }

        return {
            target: targetInfo.label,
            palaceUsed: targetInfo.palace,
            findings: findings
        };
    },

    // Main Report Generation Loop
    generateLiangStyleReport: function (chart) {
        let html = '<div class="liang-report-container" style="padding: 20px; background: #fff8f8; border: 1px solid #e0e0e0; border-radius: 8px; margin-top:20px;">';
        html += '<h3 style="color: #c62828; border-bottom: 2px solid #c62828; padding-bottom: 10px; margin-top: 0;">梁派飛星・深度命盤解碼</h3>';

        // 0. Yearly Fortune (Traffic Light) - NEW
        const yearlyFortune = this.analyzeYearlyFortune(chart);
        if (yearlyFortune) {
            const lightColor = yearlyFortune.trafficLight === 'Green' ? '#4caf50' : (yearlyFortune.trafficLight === 'Red' ? '#f44336' : '#ffc107');
            const themeColor = this.getThemeColor(yearlyFortune.overlapTitle) || lightColor;
            const lightBg = yearlyFortune.trafficLight === 'Green' ? '#f1f8e9' : (yearlyFortune.trafficLight === 'Red' ? '#ffebee' : '#fffde7');
            const lightIcon = yearlyFortune.trafficLight === 'Green' ? '🟢' : (yearlyFortune.trafficLight === 'Red' ? '🔴' : '🟡');

            html += `<div class="report-section" style="margin-bottom: 25px; border: 2px solid ${lightColor}; border-radius: 12px; padding: 20px; background-color: ${lightBg}; box-shadow: 0 4px 15px rgba(0,0,0,0.05); position: relative; overflow: hidden;">`;
            html += `<div style="position: absolute; top: -10px; right: -10px; font-size: 80px; opacity: 0.1; color: ${lightColor}; pointer-events: none;">${lightIcon}</div>`;
            html += `<h4 style="margin: 0 0 15px 0; color: #333; font-size: 1.3em; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.2em;">${lightIcon}</span> ${yearlyFortune.yearLabel} 運勢紅綠燈
                    </h4>`;
            html += `<p style="margin: 8px 0; font-size: 1.05em; color: #555;"><strong>年度主題：</strong><span style="color:${themeColor}; font-weight:bold;">${yearlyFortune.theme}</span></p>`;
            html += `<p style="margin: 15px 0; font-size: 1.15em; font-weight: bold; color: ${lightColor}; border-left: 4px solid ${lightColor}; padding-left: 12px; background: rgba(255,255,255,0.5);">${yearlyFortune.summary.split('。')[0]}。</p>`; 
            html += `<p style="line-height: 1.7; color: #444; font-size: 1em; margin-bottom: 20px;">${yearlyFortune.summary}</p>`;
            
            html += `<div style="margin-top: 15px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #eee; display: flex; gap: 12px; align-items: flex-start;">`;
            html += `<span style="font-size: 1.5em; line-height: 1; color:${themeColor};">🎯</span>`;
            html += `<div><strong style="color:${themeColor}; display:block; margin-bottom:4px;">重點建議：</strong><span style="color:#555; line-height:1.5;">${yearlyFortune.detailedAdvice}</span></div>`;
            html += `</div>`;

            if (yearlyFortune.reason) {
                html += `<div style="margin-top:12px; padding: 10px 15px; background: rgba(0,0,0,0.03); border-radius: 8px; font-size: 0.9em; color: #777; display: flex; gap: 8px; align-items: center;">`;
                html += `<span style="color:${themeColor}">🔍</span> <strong>飛化應期：</strong>${yearlyFortune.reason}`;
                html += `</div>`;
            }
            html += `</div>`;
        }



        // 1. Wealth
        const wealthAnalysis = this.analyzeWealthVault(chart);
        const wealthThemeColor = this.getThemeColor('田宅'); 
        if (wealthAnalysis) {
            html += `<div class="report-section" style="margin-bottom: 20px; padding: 15px; background: #fff; border-radius: 8px; border: 1px solid ${wealthThemeColor}44;">`;
            html += `<h4 style="margin: 0 0 10px 0; color: ${wealthThemeColor}; font-size: 1.2em; display: flex; align-items: center; gap: 8px;">
                        <span>💰</span> ${wealthAnalysis.title} <span style="font-size: 0.9em; color: #ffca28; letter-spacing: 2px;">${wealthAnalysis.stars}</span>
                    </h4>`;
            html += `<p style="margin: 8px 0;"><strong>判定：</strong>${wealthAnalysis.result}</p>`;
            html += `<p style="line-height: 1.7; color: #444; font-size: 0.95em;">${wealthAnalysis.advice}</p>`;
            if (wealthAnalysis.reason) {
                html += `<div style="margin-top:10px; padding:8px 12px; background:#fcfcfc; border-left: 4px solid ${wealthThemeColor}; border-radius: 4px; font-size:0.85em; color:#888;">🔍 <strong>飛化軌跡：</strong>${wealthAnalysis.reason}</div>`;
            }
            html += `</div>`;
        } else {
            // Default safe response if no specific structure found
            html += `<div class="report-section" style="margin-bottom: 20px; padding: 15px; background: #fff; border-radius: 8px; border: 1px solid #f0f0f0;">`;
            html += `<h4 style="margin: 0 0 10px 0; color: ${wealthThemeColor}; font-size: 1.2em; display: flex; align-items: center; gap: 8px;">
                        <span>💰</span> 【財運評估】 <span style="font-size: 0.9em; color: #ffca28; letter-spacing: 2px;">⭐⭐⭐</span>
                    </h4>`;
            html += `<p style="line-height: 1.7; color: #444; font-size: 0.95em;">您的財運走勢較為平穩。建議多關注本命事業宮與財帛宮的星性互動，以專業技能穩步求財為佳。</p>`;
            html += `</div>`;
        }

        // 2. Mental
        const mentalAnalysis = this.analyzeMentalState(chart);
        if (mentalAnalysis) {
            html += `<div class="report-section" style="margin-bottom: 20px;">`;
            html += `<h4 style="margin: 10px 0; color: #5e35b1;">${mentalAnalysis.title} ${mentalAnalysis.stars}</h4>`;
            html += `<p style="line-height: 1.6; color: #424242;">${mentalAnalysis.advice}</p>`;
            if (mentalAnalysis.reason) {
                html += `<div style="margin-top:8px; padding:8px; background:#eeeeee; border-radius:4px; font-size:0.9em; color:#666;">🔍 <strong>飛化軌跡：</strong><br>${mentalAnalysis.reason}</div>`;
            }
            html += `</div>`;
        }

        // 3. Advanced Insights (D, E, F)
        const advancedInsights = this.getPsychologicalInsight(chart);
        if (advancedInsights.length > 0) {
            html += `<div class="report-section" style="margin-bottom: 10px;">`;
            html += `<h4 style="margin: 10px 0; color: #0277bd;">【深層讀心與行為建議】</h4>`;
            html += `<ul style="list-style-type: none; padding-left: 0;">`;

            advancedInsights.forEach(item => {
                html += `<li style="background: white; padding: 15px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 15px;">`;
                html += `<strong style="color: #0277bd; display:block; margin-bottom:5px;">➤ ${item.tag}：</strong>`;
                html += `<span style="display:block; margin-bottom:8px; color:#555;">${item.insight}</span>`;
                html += `<span style="display:block; background:#e1f5fe; padding:8px; border-radius:4px; color:#01579b; font-size:0.95em;">💡 <strong>處方：</strong>${item.advice}</span>`;
                if (item.reason) {
                    html += `<div style="margin-top:8px; padding-top:8px; border-top:1px dashed #ccc; font-size:0.9em; color:#888;">🔍 <strong>軌跡：</strong>${item.reason}</div>`;
                }
                html += `</li>`;
            });

            html += `</ul>`;
            html += `</div>`;
        }

        // 4. Family Analysis (Six Relations)
        // Check typical relations
        const familyRelations = ["Spouse", "Child_1", "Father", "Mother"];
        let familyHtml = "";

        familyRelations.forEach(rel => {
            const analysis = this.analyzeFamilyMember(chart, rel);
            if (analysis && analysis.findings && analysis.findings.length > 0) {
                const relColor = this.getThemeColor(analysis.palaceUsed);
                familyHtml += `<div style="margin-bottom:12px; padding:10px; background:#f9f9f9; border-radius:6px; border-left: 3px solid ${relColor};">`;
                familyHtml += `<strong style="color:${relColor};">${analysis.target}</strong> <span style="font-size:0.85em; color:#888;">(借${analysis.palaceUsed}宮)</span>`;
                familyHtml += `<ul style="margin:5px 0 0 20px; padding:0; font-size:0.95em; color:#444;">`;

                analysis.findings.forEach(f => {
                    familyHtml += `<li style="margin-bottom:6px;">${f.icon} ${f.text}<br>`;
                    if (f.reason) {
                        familyHtml += `<span style="font-size:0.85em; color:#888; background-color:#eee; padding:1px 4px; border-radius:3px;">🔍 飛化：${f.reason}</span>`;
                    }
                    familyHtml += `</li>`;
                });

                familyHtml += `</ul></div>`;
            }
        });

        // Always render section now as there is consistent feedback
        if (familyHtml) {
            html += `<div class="report-section" style="margin-bottom: 20px;">`;
            html += `<h4 style="margin: 10px 0; color: #00796b;">【六親緣分掃描】</h4>`;
            html += familyHtml;
            html += `</div>`;
        }

        html += '</div>';
        return html;
    },

    // 梁式飛星：祿轉忌 / 忌轉忌 追蹤核心
    tracePath: function (chart, startBranch, startType = '祿', depth = 0, maxDepth = 12, paths = [], multiLuNodes = []) {
        if (depth > maxDepth) return { paths, multiLuNodes };

        const pObj = chart.palaces[startBranch];
        if (!pObj) return { paths, multiLuNodes };

        const stem = pObj.celestial;
        
        // 決定此步的化星：若是首傳(depth=0)，依照 startType；若大於 0 (轉忌階段)，一律為「忌」(3)
        const currentTypeStr = depth === 0 ? startType : '忌';
        const typeIndex = currentTypeStr === '祿' ? 0 : 3;

        const transStars = chart.fourTransMap[stem];
        if (!transStars) return { paths, multiLuNodes };

        const starName = transStars[typeIndex];
        const targetPalace = this.getFlyingStarTarget(chart, stem, typeIndex);
        if (!targetPalace) return { paths, multiLuNodes };

        const targetBranch = Object.keys(chart.palaces).find(b => chart.palaces[b].name === targetPalace.name);
        if (!targetBranch) return { paths, multiLuNodes };

        paths.push({
            source: startBranch,
            target: targetBranch,
            type: currentTypeStr,
            star: starName,
            depth: depth
        });

        // 掃描匯聚 (祿轉忌看誰化祿，忌轉忌看誰化忌)
        // 核心邏輯：整個路線的主軸由 startType 決定 (祿線 / 忌線)
        const checkTypeIndex = startType === '祿' ? 0 : 3;
        
        let providers = [];
        Object.keys(chart.palaces).forEach(b => {
             // 避免與當前發射宮位重複算 (特別是在 depth=0 時)
            if (b === startBranch && depth === 0) return; 
            
            const bStem = chart.palaces[b].celestial;
            const bTransStars = chart.fourTransMap[bStem];
            if (!bTransStars) return;

            const checkStar = bTransStars[checkTypeIndex];
            const checkTarget = this.getFlyingStarTarget(chart, bStem, checkTypeIndex);
            
            // 是否飛入同一個宮位？
            if (checkTarget && checkTarget.name === targetPalace.name) {
                providers.push({
                    branch: b,
                    title: chart.palaces[b].title,
                    star: checkStar
                });
            }
        });

        // 檢查生年四化 (生年祿 或 生年忌)
        const targetPObj = chart.palaces[targetBranch];
        const hasBirthTrans = targetPObj.trans.some(t => t.type === startType);

        let eCount = providers.length + (depth === 0 ? 1 : 0) + (hasBirthTrans ? 1 : 0);
        
        // 如果是在轉忌節點 (depth >= 1)，本身帶來的這條線也算入總能量
        let totalDisplayCount = eCount + (depth >= 1 ? 1 : 0);

        if (providers.length > 0 || hasBirthTrans) {
            multiLuNodes.push({
                target: targetBranch,
                providers: providers,
                energyCount: totalDisplayCount,
                hasBirthTrans: hasBirthTrans,
                traceType: startType // 標記是多祿還是多忌
            });
        }

        // Automatic Zhuan Ji (轉忌)
        // 梁式核心：祿轉忌，忌轉忌。To prevent infinite loop on Ji returning to same node
        const loop = paths.filter(p => p.source === targetBranch && p.type === '忌').length > 0;
        
        // 【新增條件】第2轉(含)之後，必須有對應的飛化(providers) 或「生年四化」才能繼續轉忌
        let canContinue = true;
        if (depth >= 1) {
             if (providers.length === 0 && !hasBirthTrans) {
                 canContinue = false;
             }
        }

        if (!loop && canContinue) {
            this.tracePath(chart, targetBranch, startType, depth + 1, maxDepth, paths, multiLuNodes);
        }

        return { 
            paths, 
            multiLuNodes, 
            themeColor: this.getThemeColor(chart.palaces[startBranch].title) 
        };
    },

    // 取得飛化路徑的深層象義
    getTraceMeaning: function(chart, result) {
        if (!result || !result.paths || result.paths.length < 2) return [];
        
        const internalPalaces = ['命宮', '財帛', '事業', '疾厄', '田宅', '兄弟'];
        
        const p1 = chart.palaces[result.paths[0].source];
        const p2 = chart.palaces[result.paths[0].target]; // 中繼點
        const p3 = chart.palaces[result.paths[1].target]; // 轉忌終點
        
        const type = result.paths[0].type; // 首傳是 '祿' 或 '忌'
        const isP1Internal = internalPalaces.includes(p1.title);
        const isP2Internal = internalPalaces.includes(p2.title);
        const isP3Internal = internalPalaces.includes(p3.title);
        
        const isOneOf = (title, list) => list.includes(title);
        const getOpposite = (branch) => {
            let idx = chart.branches.indexOf(branch);
            return chart.palaces[chart.branches[(idx + 6) % 12]].title;
        };
        const p3OppositeTitle = getOpposite(result.paths[1].target);

        // 產生路徑字串
        let pArray = [p1.title];
        result.paths.forEach(p => pArray.push(chart.palaces[p.target].title));
        const pathStr = `<span style="font-size:0.85em; color:#888; font-weight:normal; margin-left: 8px;">(${pArray.join(' ➔ ')})</span>`;

        let meanings = [];
        
        // 封裝 push 函數以自動加入路徑
        const addMeaning = (title, desc, color) => {
            meanings.push({ title: title + pathStr, desc, color });
        };
        
        // 特殊象義：絕命忌
        if (type === '忌') {
            if (isOneOf(p1.title, ['命宮', '疾厄'])) {
                if (p3OppositeTitle === '命宮' || p3OppositeTitle === '疾厄' || p3.title === '命宮' || p3.title === '疾厄') {
                    addMeaning("【絕命忌】", "這是嚴重的能量回扣，代表過度執著於某事，最終導致自我毀滅或重大意外，務必保守。", "#c62828");
                }
            }
        }

        // 特殊象義：進馬忌 / 退馬忌 (同天干引動)
        if (p2.celestial === p3.celestial) {
             addMeaning("【退馬/進馬】", "事情會反覆發生，或者能量會產生跳躍式位移，這是一場宿命的輪迴。", "#7b1fa2");
        }
        
        // 核心象義：祿轉忌
        if (type === '祿') {
            if (isP1Internal && isP2Internal && isP3Internal) {
                addMeaning("【大吉：肥水不落外人田】", "錢財與機會在內部循環，能自給自足，財庫豐盈。", "#2e7d32");
            } else if (isP1Internal && !isP2Internal && isP3Internal) {
                addMeaning("【貴人助旺】", "透過他人（朋友、客戶）賺錢，最終錢財能回到自己手中。", "#2e7d32");
            } else if (isP1Internal && isP2Internal && !isP3Internal) {
                 addMeaning("【祿入忌出：慷慨虛花】", "雖然有賺錢機會，但守不住，錢財最後流向他人或外面。", "#f57c00");
            } else if (!isP1Internal && isP2Internal && isP3Internal) {
                 addMeaning("【受人恩惠】", "他人帶來的機會，經過你的努力，成功轉化為實質資產。", "#2e7d32");
            } else if (isOneOf(p2.title, ['遷移', '子女']) && isOneOf(p3OppositeTitle, ['命宮', '田宅'])) {
                 addMeaning("【出外消耗】", "為了機會奔波勞碌，結果反而讓家底或元氣受損。", "#f57c00");
            }
        } 
        // 核心象義：忌轉忌
        else if (type === '忌') {
            if (isOneOf(p1.title, ['命宮', '疾厄']) && isOneOf(p2.title, ['財帛', '事業']) && p3OppositeTitle === '田宅') {
                 addMeaning("【傾家蕩產】", "因為自己的失誤或身體問題影響工作，最後賠掉家產。", "#c62828");
            } else if (p1.title === '夫妻' && isOneOf(p2.title, ['命宮', '疾厄']) && p3.title === '財帛') {
                 addMeaning("【因情背債】", "配偶給的壓力讓你身心俱疲，還得為對方花錢填坑。", "#c62828");
            } else if (p1.title === '交友' && p2.title === '事業' && p3.title === '父母') {
                 addMeaning("【小人毀名】", "同儕或部屬犯錯影響你的事業，甚至造成法律官司。", "#c62828");
            } else if (p1.title === '財帛' && p2.title === '兄弟' && p3.title === '疾厄') {
                 addMeaning("【因財傷身】", "為了周轉資金或賺錢，導致身體健康出現大問題。", "#c62828");
            } else if (p1.title === '田宅' && p2.title === '子女' && p3OppositeTitle === '命宮') {
                 addMeaning("【家宅不寧】", "房地產或家運出問題，導致你個人運勢跌入谷底。", "#c62828");
            }
        }

        // 通用兜底判斷（如果沒符合特殊格局）
        if (meanings.length === 0) {
            if (type === '祿') {
                 if (isP1Internal && isP3Internal) addMeaning("【能量內循環】", "好處最終留給自己，屬於積累型。", "#388e3c");
                 else if (isP1Internal && !isP3Internal) addMeaning("【祿入忌出】", "雖然有進帳，但最後會流向他人或外面。", "#f57c00");
                 else if (isOneOf(p3OppositeTitle, ['命宮'])) addMeaning("【祿處逢沖】", "初期順利但結果受損，需防樂極生悲。", "#f57c00");
            } else {
                 if (isP3Internal) addMeaning("【壓力轉內】", "糾纏不清、深陷其中，壓力在內部打轉。", "#d32f2f");
                 else if (!isP3Internal) addMeaning("【災禍外溢】", "此問題會引發連鎖反應，導致更多困擾，恐有拋棄感。", "#d32f2f");
            }
        }

        return { 
            meanings, 
            themeColor: this.getThemeColor(p1.title) 
        };
    },

    // 【新增】流年運勢紅綠燈
    getAnnualFortuneReport: function(chart, liunianBranch) {
        if (!liunianBranch) return null;
        const palaces = Object.values(chart.palaces);
        const liunianPalace = chart.palaces[liunianBranch];
        const liunianMingTitle = liunianPalace.title;
        
        let score = 0; // 0=黃, >0=綠, <0=紅
        let items = [];

        // 1. 檢查流年命宮干飛化
        const stem = liunianPalace.celestial;
        const transStars = chart.fourTransMap[stem];
        if (transStars) {
            transStars.forEach((star, idx) => {
                const type = chart.transTypes[idx];
                const targetPalace = palaces.find(p => p.stars.includes(star));
                if (targetPalace) {
                    const isInternal = ['命宮', '財帛', '事業', '疾厄', '田宅', '兄弟'].includes(targetPalace.title);
                    if (type === '祿' && isInternal) {
                        score += 1;
                        items.push({ text: `祿入${targetPalace.title}`, type: 'good' });
                    } else if (type === '忌' && !isInternal) {
                        score -= 1;
                        items.push({ text: `忌出${targetPalace.title}`, type: 'bad' });
                    } else if (type === '忌' && isInternal) {
                        items.push({ text: `忌入${targetPalace.title}`, type: 'neutral' });
                    }
                }
            });
        }

        let status = 'yellow';
        let label = '運勢平穩 (黃燈)';
        if (score > 1) { status = 'green'; label = '運勢吉祥 (綠燈)'; }
        else if (score < -1) { status = 'red'; label = '運勢波折 (紅燈)'; }

        return { status, label, items };
    },

    // 【新增】財運評估
    getWealthAssessment: function(chart, branch) {
        if (!branch) return null;
        const p = chart.palaces[branch];
        const stem = p.celestial;
        const trans = chart.fourTransMap[stem];
        
        // 尋找祿入與忌入
        const luStar = trans[0];
        const jiStar = trans[3];
        const palaces = Object.values(chart.palaces);
        const luPalace = palaces.find(pl => pl.stars.includes(luStar));
        const jiPalace = palaces.find(pl => pl.stars.includes(jiStar));

        let analysis = `宮位：${p.title} (${p.name})`;
        let advice = "財源一般，宜守不宜攻。";
        let color = "#666";

        if (luPalace && ['命宮', '財帛', '田宅', '兄弟'].includes(luPalace.title)) {
            advice = "財源廣進，肥水不落外人田，利於投資或增加收入。";
            color = "#2e7d32";
        }
        if (jiPalace && ['遷移', '子女', '交友'].includes(jiPalace.title)) {
            advice = "財帛流向外部，開銷大或有損財風險，需注意守財。";
            color = "#c62828";
        }

        return { analysis, advice, color };
    }
};

// Expose to global window
window.LiangLogic = LiangLogic;
