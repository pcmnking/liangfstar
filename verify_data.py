import json
import re

file_path = r'e:\AI\githup\liangfstar\assets\js\ziwei_data_P.js'

def run_verification():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract JSON-like object by counting braces
        start_index = content.find('const ZIWEI_DATA_P = {')
        if start_index == -1:
             print("FAIL: Could not find ZIWEI_DATA_P start.")
             return
        
        start_index += len('const ZIWEI_DATA_P = ')
        
        brace_count = 0
        end_index = -1
        in_string = False
        escape = False
        
        for i in range(start_index, len(content)):
            char = content[i]
            if escape: escape = False; continue
            if char == '\\': escape = True; continue
            if char == '"' and not escape: in_string = not in_string; continue
            
            if not in_string:
                if char == '{': brace_count += 1
                elif char == '}': 
                    brace_count -= 1
                    if brace_count == 0:
                        end_index = i + 1
                        break
        
        if end_index == -1:
            print("FAIL: Could not find end of ZIWEI_DATA_P object.")
            return

        json_str = content[start_index:end_index]
        
        # Remove trailing commas
        json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
        # Escape newlines
        def escape_newlines(match):
            s = match.group(0)
            return s.replace('\n', '\\n').replace('\r', '')
        json_str = re.sub(r'"(?:[^"\\]|\\.)*"', escape_newlines, json_str)

        data = json.loads(json_str)
        print("SUCCESS: Data loaded successfully.")
        
        # Check Keys
        palaces = ['命宮', '兄弟宮', '夫妻宮', '子女宮', '財帛宮', '疾厄宮', '遷移宮', '交友宮', '事業宮', '田宅宮', '福德宮', '父母宮']
        
        # 1. Check Top Level Keys
        errors = []
        for key in data.keys():
            if not key.endswith('宮'):
                errors.append(f"Top Level Key '{key}' does not end with '宮'")
            if key not in palaces:
                 # It might be ok if it's a normalized traditional text not in the list?
                 # But we expect strictly these 12 for the outer keys.
                 errors.append(f"Top Level Key '{key}' is not a standard palace name.")

        # 2. Check Second Level (Transformations)
        trans_types = ['祿', '權', '科', '忌']
        for p_key, p_val in data.items():
            for t_key in p_val.keys():
                if t_key not in trans_types:
                    errors.append(f"Transformation Key '{t_key}' in '{p_key}' is invalid.")

            # 3. Check Third Level (Target Palaces)
            for t_key, t_val in p_val.items():
                for target_key in t_val.keys():
                    if not target_key.endswith('宮'):
                         errors.append(f"Target Key '{target_key}' in '{p_key}->{t_key}' does not end with '宮'")

        if errors:
            print(f"FAIL: Found {len(errors)} errors:")
            for err in errors[:10]:
                print("  - " + err)
            if len(errors) > 10:
                print("  ... and more.")
        else:
            print("SUCCESS: All keys are normalized correctly.")
            
    except Exception as e:
        print(f"FAIL: Exception during verification: {e}")

if __name__ == "__main__":
    run_verification()
