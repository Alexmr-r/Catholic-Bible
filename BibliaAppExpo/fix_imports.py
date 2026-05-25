import os
import re

directories = ['src']
for directory in directories:
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()

                changed = False
                # If Platform is used in the file
                if 'Platform.OS' in content or 'Platform' in content:
                    # check if Platform is imported
                    if not re.search(r'Platform[,\s\}]', content[:content.find("from 'react-native'")]):
                        # Find the react-native import
                        match = re.search(r'import\s+\{([^}]+)\}\s+from\s+[\'\"`]react-native[\'\"`];', content)
                        if match:
                            imports = match.group(1).split(',')
                            imports = [i.strip() for i in imports if i.strip()]
                            if 'Platform' not in imports:
                                imports.append('Platform')
                                new_imports = ',\n  '.join(imports)
                                new_import_str = f"import {{\n  {new_imports}\n}} from 'react-native';"
                                content = content.replace(match.group(0), new_import_str)
                                changed = True
                
                if changed:
                    with open(filepath, 'w') as f:
                        f.write(content)
                    print(f'Fixed {filepath}')
