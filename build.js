const fs = require('fs');
const path = require('path');

const dir = __dirname;
const template = fs.readFileSync(path.join(dir, 'template.html'), 'utf8');
const content = JSON.parse(fs.readFileSync(path.join(dir, 'content.json'), 'utf8'));

function resolve(obj, key) {
  return key.split('.').reduce((o, k) => (o != null ? o[k] : undefined), obj);
}

function render(tmpl, data) {
  // Handle sections: {{#key}}...{{/key}}
  tmpl = tmpl.replace(/\{\{#([\w.]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, block) => {
    const val = resolve(data, key);
    if (Array.isArray(val)) {
      return val.map(item => {
        if (typeof item === 'string') {
          // For simple arrays, {{.}} refers to the item itself
          return block.replace(/\{\{\.\}\}/g, item);
        }
        // For object arrays, merge item into data for nested resolution
        return render(block, { ...data, ...item });
      }).join('');
    }
    return '';
  });

  // Handle simple placeholders: {{key}}
  tmpl = tmpl.replace(/\{\{([\w.]+)\}\}/g, (match, key) => {
    const val = resolve(data, key);
    return val !== undefined ? val : match;
  });

  return tmpl;
}

const output = render(template, content);
fs.writeFileSync(path.join(dir, 'index.html'), output, 'utf8');
console.log('Built index.html');
