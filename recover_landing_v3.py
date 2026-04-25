import re
import os
import json

log_path = "/Users/adnanjunaid/.gemini/antigravity/brain/127058b0-e70d-41b7-b303-3402895ab6b4/.system_generated/logs/overview.txt"
target_file = "/Users/adnanjunaid/Documents/OJT/frontend/frontend/src/pages/Landing.jsx"

with open(log_path, 'r') as f:
    for line in f:
        if '"step_index":262' in line:
            # Try to find the CodeContent value
            # It starts after "CodeContent":" and ends before ","Description"
            match = re.search(r'"CodeContent":"(.*?)","Description"', line)
            if match:
                code_escaped = match.group(1)
                # Now we need to unescape it. 
                # It has \" for quotes and \\n for newlines
                # We can use codecs or just replace
                code = code_escaped.replace('\\n', '\n').replace('\\"', '"').replace('\\\\', '\\')
                
                os.makedirs(os.path.dirname(target_file), exist_ok=True)
                with open(target_file, 'w') as out:
                    out.write(code)
                print(f"Successfully recovered {target_file}")
                break
