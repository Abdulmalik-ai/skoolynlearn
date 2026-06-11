import re

with open('prisma/schema.prisma', 'r') as f:
    content = f.read()

# Remove output from generator
content = re.sub(r'output\s*=\s*"[^"]+"\s*\n', '', content)

# Change provider to sqlite
content = re.sub(r'provider = "postgresql"', 'provider = "sqlite"', content)

# Remove @db.Text
content = re.sub(r'\s+@db\.Text', '', content)

# Replace Decimal with Float
content = re.sub(r'\bDecimal\b', 'Float', content)

# Remove all enum blocks
enum_pattern = r'enum\s+\w+\s*\{[^}]*\}'
enum_names = re.findall(r'enum\s+(\w+)\s*\{', content)
content = re.sub(enum_pattern, '', content, flags=re.DOTALL)

# Replace enum types with String, avoiding model names that might match
for name in enum_names:
    # Replace field type references, not model names or map names
    content = re.sub(rf'(?<!model\s)(?<!@@map\()\b{name}\b(?!\s*\{{)', 'String', content)

# Replace String[] with String
content = re.sub(r'\bString\[\]', 'String', content)

# Replace Json with String
content = re.sub(r'\bJson\b', 'String', content)

# Fix enum defaults to quoted strings
for name in enum_names:
    content = re.sub(rf'@default\({name}\)', f'@default("{name}")', content)

# Clean up extra blank lines
content = re.sub(r'\n{3,}', '\n\n', content)

with open('prisma/schema.prisma', 'w') as f:
    f.write(content)

print("Schema fixed for SQLite")
