import json
import os

log_path = "/Users/adnanjunaid/.gemini/antigravity/brain/127058b0-e70d-41b7-b303-3402895ab6b4/.system_generated/logs/overview.txt"
target_file = "/Users/adnanjunaid/Documents/OJT/frontend/frontend/src/pages/Landing.jsx"

with open(log_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get("step_index") == 262:
                # The raw JSON string from the log
                # data["tool_calls"][0]["args"]["CodeContent"] is the value of the "CodeContent" field
                # In the log file, it looks like: "CodeContent": "\"import React...\""
                # So data["tool_calls"][0]["args"]["CodeContent"] is the string "\"import React...\""
                # We need to unquote THIS string.
                code_str = data["tool_calls"][0]["args"]["CodeContent"]
                
                # Try to decode it as a JSON string
                # Wrap it in quotes if it's not already, or just use json.loads directly if it is
                if not code_str.startswith('"'):
                    code_str = '"' + code_str + '"'
                
                # json.loads handles the escaping (\n, \", etc)
                final_code = json.loads(code_str)
                
                os.makedirs(os.path.dirname(target_file), exist_ok=True)
                with open(target_file, 'w') as out:
                    out.write(final_code)
                print(f"Successfully recovered {target_file}")
                break
        except Exception as e:
            print(f"Error at step {data.get('step_index')}: {e}")
            continue
