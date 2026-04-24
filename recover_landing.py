import json
import os

log_path = "/Users/adnanjunaid/.gemini/antigravity/brain/127058b0-e70d-41b7-b303-3402895ab6b4/.system_generated/logs/overview.txt"
target_file = "/Users/adnanjunaid/Documents/OJT/frontend/frontend/src/pages/Landing.jsx"

with open(log_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get("step_index") == 262:
                code = data["tool_calls"][0]["args"]["CodeContent"]
                # The code is a JSON string itself because of how it's logged
                # But it's actually double escaped in the raw log line sometimes
                # Let's try to unquote it
                if code.startswith('"') and code.endswith('"'):
                    # It's a quoted string in the JSON args
                    # We need to unescape the \n and \" etc.
                    # json.loads will handle it if we wrap it in a dummy object
                    code = json.loads(f'{{ "c": {code} }}')["c"]
                
                os.makedirs(os.path.dirname(target_file), exist_ok=True)
                with open(target_file, 'w') as out:
                    out.write(code)
                print(f"Successfully recovered {target_file}")
                break
        except Exception as e:
            continue
