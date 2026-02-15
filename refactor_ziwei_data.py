import json
import os
import re

file_path = r'e:\AI\githup\liangfstar\assets\js\ziwei_data_P.js'

# 1. Simplified to Traditional Mapping
char_map = {
    '禄': '祿', '权': '權', '门': '門', '机': '機', '迁': '遷',
    '艺': '藝', '属': '屬', '参': '參', '昼': '晝', '财': '財',
    '车': '車', '马': '馬', '宫': '宮', '罗': '羅', '贝': '貝',
    '见': '見', '页': '頁', '气': '氣', '鱼': '魚', '鸟': '鳥',
    '龙': '龍', '龟': '龜', '农': '農', '长': '長', '个': '個',
    '们': '們', '伦': '倫', '仓': '倉', '伟': '偉', '侧': '側',
    '备': '備', '杰': '傑', '传': '傳', '伤': '傷', '仪': '儀',
    '优': '優', '偿': '償', '元': '元', '园': '園', '团': '團',
    '图': '圖', '国': '國', '圆': '圓', '土': '土', '地': '地',
    '场': '場', '块': '塊', '坏': '壞', '墙': '牆', '增': '增',
    '声': '聲', '处': '處', '备': '備', '复': '復', '头': '頭',
    '夸': '誇', '夹': '夾', '夺': '奪', '奋斗': '奮鬥', '奸': '姦',
    '妇': '婦', '妈': '媽', '孙': '孫', '实': '實', '宁': '寧',
    '宽': '寬', '导': '導', '寿': '壽', '将': '將', '专': '專',
    '寻': '尋', '对': '對', '导': '導', '层': '層', '届': '屆',
    '属': '屬', '冈': '岡', '岩': '巖', '岛': '島', '峡': '峽',
    '峦': '巒', '师': '師', '帅': '帥', '帐': '帳', '带': '帶',
    '帮': '幫', '干': '乾', '广': '廣', '庆': '慶', '庐': '廬',
    '库': '庫', '应': '應', '庙': '廟', '庞': '龐', '废': '廢',
    '异': '異', '弑': '弒', '张': '張', '强': '強', '归': '歸',
    '录': '錄', '彻': '徹', '征': '徵', '德': '德', '忆': '憶',
    '忧': '憂', '怀': '懷', '态': '態', '总': '總', '恋': '戀',
    '恳': '懇', '恶': '惡', '恼': '惱', '悬': '懸', '惊': '驚',
    '才': '才', '扑': '撲', '执': '執', '扩': '擴', '扫': '掃',
    '扬': '揚', '护': '護', '报': '報', '损': '損', '换': '換',
    '据': '據', '捷': '捷', '搀': '攙', '摄': '攝', '摆': '擺',
    '摇': '搖', '摊': '攤', '无': '無', '时': '時', '是': '是',
    '显': '顯', '晒': '曬', '晓': '曉', '晕': '暈', '暂': '暫',
    '术': '術', '机': '機', '杀': '殺', '杂': '雜', '权': '權',
    '条': '條', '来': '來', '杨': '楊', '标': '標', '树': '樹',
    '样': '樣', '档': '檔', '桥': '橋', '梁': '梁', '梦': '夢',
    '检': '檢', '椭': '橢', '楼': '樓', '乐': '樂', '样': '樣',
    '概': '概', '构': '構', '枪': '槍', '柜': '櫃', '台': '臺',
    '湾': '灣', '叹': '嘆', '团': '團', '园': '園', '围': '圍',
    '图': '圖', '圆': '圓', '圣': '聖', '场': '場', '坏': '壞',
    '块': '塊', '坚': '堅', '坛': '壇', '坝': '壩', '坞': '塢',
    '墳': '墳', '坠': '墜', '垄': '壟', '垒': '壘', '垦': '墾',
    '处': '處', '备': '備', '复': '復', '够': '夠', '夹': '夾',
    '夺': '奪', '奋': '奮', '奖': '獎', '奥': '奧', '妆': '妝',
}

palace_names = [
    '命宮', '兄弟宮', '夫妻宮', '子女宮',
    '財帛宮', '疾厄宮', '遷移宮', '交友宮',
    '事業宮', '田宅宮', '福德宮', '父母宮'
]

def to_traditional(text):
    if not text:
        return text
    return ''.join(char_map.get(char, char) for char in text)

def normalize_palace_name(name):
    trad_name = to_traditional(name)
    
    # Check if it's a known palace
    for full_palace in palace_names:
        # Check if trad_name matches full name or name without '宮'
        prefix = full_palace.replace('宮', '')
        if trad_name == full_palace:
            return full_palace
        if trad_name == prefix:
            return full_palace
            
    # Common prefixes fallback
    common_prefixes = ['命', '兄弟', '夫妻', '子女', '財帛', '疾厄', '遷移', '交友', '事業', '田宅', '福德', '父母']
    
    # Mapping for special cases
    if trad_name in ['官祿', '官祿宮']:
        return '事業宮'
    if trad_name in ['僕役', '僕役宮']:
        return '交友宮'
        
    if trad_name in common_prefixes:
        return trad_name + '宮'
        
    return trad_name

def normalize_trans_key(key):
    trad_key = to_traditional(key)
    if trad_key in ['祿', '權', '科', '忌']:
        return trad_key
    if key == '禄': return '祿'
    if key == '权': return '權'
    return trad_key

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract JSON-like object by counting braces
    start_index = content.find('const ZIWEI_DATA_P = {')
    if start_index == -1:
         print("Could not find ZIWEI_DATA_P start.")
         exit(1)
    
    start_index += len('const ZIWEI_DATA_P = ')
    
    # Iterate and count braces
    brace_count = 0
    end_index = -1
    in_string = False
    escape = False
    
    for i in range(start_index, len(content)):
        char = content[i]
        
        if escape:
            escape = False
            continue
            
        if char == '\\':
            escape = True
            continue
            
        if char == '"' and not escape:
            in_string = not in_string
            continue
            
        if not in_string:
            if char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0:
                    end_index = i + 1
                    break
    
    if end_index == -1:
        print("Could not find end of ZIWEI_DATA_P object.")
        exit(1)
        
    json_str = content[start_index:end_index]
    
    # Remove trailing commas
    # This regex matches a comma followed by whitespace and a closing brace or bracket
    json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)

    # Escape newlines inside strings
    # We find all double groups, then replace \n with \\n inside them
    def escape_newlines(match):
        s = match.group(0)
        return s.replace('\n', '\\n').replace('\r', '')

    # Regex for double-quoted strings (handling escaped quotes)
    json_str = re.sub(r'"(?:[^"\\]|\\.)*"', escape_newlines, json_str)

    # Dump for debug
    with open('debug_json.txt', 'w', encoding='utf-8') as f:
        f.write(json_str)

    # Parse JSON
    try:
        data = json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        # Debug: print the context of the error
        start = max(0, e.pos - 50)
        end = min(len(json_str), e.pos + 50)
        print(f"Error Context: ...{json_str[start:end]}...")
        exit(1)

    new_data = {}

    # Level 1: Source Palace
    for key1, val1 in data.items():
        new_key1 = normalize_palace_name(key1)
        if new_key1 not in new_data:
            new_data[new_key1] = {}
            
        # Level 2: Transformation
        for key2, val2 in val1.items():
            new_key2 = normalize_trans_key(key2)
            if new_key2 not in new_data[new_key1]:
                new_data[new_key1][new_key2] = {}
                
            # Level 3: Target Palace
            for key3, val3 in val2.items():
                new_key3 = normalize_palace_name(key3)
                if new_key3 == '命': new_key3 = '命宮'
                
                # Merge content
                if new_key3 in new_data[new_key1][new_key2]:
                    # Check for duplication to avoid repeat appending
                    existing_val = new_data[new_key1][new_key2][new_key3]
                    if val3 not in existing_val:
                         new_data[new_key1][new_key2][new_key3] += '\n' + val3
                else:
                    new_data[new_key1][new_key2][new_key3] = val3

    # Write back to file, preserving other content
    # We replace the original JSON string with the new JSON string in the ORIGINAL content
    # json_str was extracted from content[start_index:end_index]
    
    new_json_str = json.dumps(new_data, indent=2, ensure_ascii=False)
    
    new_file_content = content[:start_index] + new_json_str + content[end_index:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_file_content)
        
    print("Successfully refactored ziwei_data_P.js while preserving other content.")

except Exception as e:
    print(f"Error: {e}")
    exit(1)
