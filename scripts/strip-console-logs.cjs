/**
 * Remove console.log, console.debug e console.info de .ts e .tsx em src.
 * Mantém console.error e console.warn.
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function stripFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  const lines = content.split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trimStart();
    // Remover linhas que são só comentário com console.log/debug/info
    if (/^\s*\/\/\s*console\.(log|debug|info)\s*\(/.test(trimmed)) {
      i++;
      continue;
    }
    if (/^\s*console\.(log|debug|info)\s*\(/.test(trimmed)) {
      let depth = 0;
      let inString = null;
      let escape = false;
      const fullLine = line;
      for (const c of fullLine) {
        if (escape) { escape = false; continue; }
        if (inString) {
          if (c === '\\') escape = true;
          else if (c === inString) inString = null;
          continue;
        }
        if (c === '"' || c === "'" || c === '`') inString = c;
        else if (c === '(') depth++;
        else if (c === ')') depth--;
      }
      i++;
      while (i < lines.length && depth > 0) {
        const nextLine = lines[i];
        for (const c of nextLine) {
          if (escape) { escape = false; continue; }
          if (inString) {
            if (c === '\\') escape = true;
            else if (c === inString) inString = null;
            continue;
          }
          if (c === '"' || c === "'" || c === '`') inString = c;
          else if (c === '(') depth++;
          else if (c === ')') depth--;
        }
        i++;
      }
      continue;
    }
    out.push(line);
    i++;
  }

  content = out.join('\n');
  content = content.replace(/\n{3,}/g, '\n\n');
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function walk(dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== 'node_modules' && e.name !== 'dist') count += walk(full);
    } else if (/\.(ts|tsx)$/.test(e.name)) {
      if (stripFile(full)) count++;
    }
  }
  return count;
}

walk(srcDir);
