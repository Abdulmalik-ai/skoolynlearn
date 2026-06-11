import re

with open('prisma/schema.prisma', 'r') as f:
    content = f.read()

# 1. Extract and remove enum definitions, mapping them to strings
enum_map = {}
enum_pattern = r'enum (\w+) \{[^}]*\}'
for match in re.finditer(enum_pattern, content, re.DOTALL):
    enum_name = match.group(1)
    enum_map[enum_name] = True

# Remove enum blocks
content = re.sub(enum_pattern, '', content, flags=re.DOTALL)

# 2. Replace enum field types with String (avoid replacing enum-like words inside other strings)
for enum_name in enum_map:
    pattern = r'\b' + enum_name + r'\b(?!\s*\{)'
    content = re.sub(pattern, 'String', content)

# 3. Replace String[] with String (store as comma-separated)
content = re.sub(r'\bString\[\]', 'String', content)

# 4. Replace Json with String
content = re.sub(r'\bJson\b', 'String', content)

# Clean up extra blank lines
content = re.sub(r'\n{3,}', '\n\n', content)

with open('prisma/schema.prisma', 'w') as f:
    f.write(content)

print("Schema fixed for SQLite")
