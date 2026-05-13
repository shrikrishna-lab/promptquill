/**
 * Clean corrupted UTF-8 text caused by Latin-1 encoding mismatch
 * Handles emoji and punctuation mojibake patterns
 */
export function cleanText(input) {
  if (!input || typeof input !== 'string') return input;
  let text = input;
  
  // Comprehensive replacement patterns using String.fromCharCode
  const replacements = [
    // Punctuation (2-3 byte UTF-8 as Latin-1)
    [String.fromCharCode(0xe2, 0x80, 0xa2), '•'],     // bullet
    [String.fromCharCode(0xe2, 0x80, 0x94), '—'],     // em dash
    [String.fromCharCode(0xe2, 0x80, 0x93), '–'],     // en dash
    [String.fromCharCode(0xe2, 0x80, 0xa6), '…'],     // ellipsis
    [String.fromCharCode(0xe2, 0x86, 0x92), '→'],     // arrow
    [String.fromCharCode(0xe2, 0x87, 0x92), '⇒'],     // double arrow
    [String.fromCharCode(0xe2, 0x9c, 0x93), '✓'],     // check
    [String.fromCharCode(0xe2, 0x9c, 0x95), '✕'],     // cross
    [String.fromCharCode(0xe2, 0x98, 0x85), '★'],     // star
    [String.fromCharCode(0xe2, 0x99, 0xa5), '♥'],     // heart
    [String.fromCharCode(0xe2, 0x82, 0xb9), '₹'],     // rupee
    
    // Accents (2 byte UTF-8 as Latin-1)
    [String.fromCharCode(0xc3, 0x89), 'É'],
    [String.fromCharCode(0xc3, 0xa9), 'é'],
    [String.fromCharCode(0xc3, 0xa8), 'è'],
    [String.fromCharCode(0xc3, 0x80), 'À'],
    [String.fromCharCode(0xc3, 0xa0), 'à'],
    [String.fromCharCode(0xc3, 0xaa), 'ê'],
    [String.fromCharCode(0xc3, 0xac), 'ì'],
    [String.fromCharCode(0xc3, 0xb6), 'ö'],
    [String.fromCharCode(0xc3, 0xbc), 'ü'],
  ];
  
  // Apply replacements iteratively until no more matches
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 10) {
    changed = false;
    for (const [corrupted, clean] of replacements) {
      if (text.includes(corrupted)) {
        text = text.split(corrupted).join(clean);
        changed = true;
      }
    }
    iterations++;
  }
  
  // Clean up extra whitespace
  text = text.replace(/\s{2,}/g, ' ').trim();
  return text;
}

export function cleanObject(obj) {
  if (!obj) return obj;
  if (typeof obj === 'string') return cleanText(obj);
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'string') return cleanText(item);
      if (typeof item === 'object') return cleanObject(item);
      return item;
    });
  }
  if (typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        cleaned[key] = cleanText(value);
      } else if (Array.isArray(value)) {
        cleaned[key] = value.map(item => 
          typeof item === 'string' ? cleanText(item) : cleanObject(item)
        );
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = cleanObject(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }
  return obj;
}