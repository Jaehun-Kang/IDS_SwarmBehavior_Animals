const resources = new Map();
const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

const dataUrl = (url, base = document.baseURI) => {
  if (url.startsWith('data:') || url.startsWith('#')) return Promise.resolve(url);
  const absolute = new URL(url, base).href;
  if (!resources.has(absolute)) {
    const pending = fetch(absolute).then(response => {
      if (!response.ok) throw new Error(`Book capture resource: ${response.status}`);
      return response.blob();
    }).then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    })).catch(error => { resources.delete(absolute); throw error; });
    resources.set(absolute, pending);
  }
  return resources.get(absolute);
};

async function embedUrls(text, base) {
  const matches = [...text.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/g)];
  const replacements = await Promise.all(matches.map(async match =>
    `url("${await dataUrl((match[1] ?? match[2] ?? match[3]).trim(), base)}")`));
  let index = 0;
  return text.replace(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/g, () => replacements[index++]);
}

function copyStyle(source, target) {
  for (const property of source) {
    // Other computed properties already resolve variables. Inherited texture URLs
    // must not be embedded again on every descendant of the book.
    if (property.startsWith('--') && !['--detail-range-accent', '--detail-range-progress', '--detail-animal-accent'].includes(property)) continue;
    target.setProperty(property, source.getPropertyValue(property));
  }
  target.setProperty('animation', 'none', 'important');
  target.setProperty('transition', 'none', 'important');
}

// Capture resolved styles in their original ancestor context, not a detached restyling.
export async function captureBookPage(node) {
  if (!node) throw new Error('Book capture node missing');
  await document.fonts.ready;
  const deadline = performance.now() + 1500;
  while ([...node.querySelectorAll('canvas')].some(c => c.dataset.bookFrameReady !== 'true')) {
    if (node.querySelector('[role="alert"]') || performance.now() > deadline) {
      throw new Error('Book preview was not ready for capture');
    }
    await nextFrame();
  }
  const rect = node.getBoundingClientRect();
  const width = rect.width, height = rect.height;
  const clone = node.cloneNode(true);
  const sources = [node, ...node.querySelectorAll('*')];
  const targets = [clone, ...clone.querySelectorAll('*')];
  const styles = [], jobs = [], families = new Set();

  sources.forEach((source, index) => {
    let target = targets[index];
    const computed = getComputedStyle(source);
    families.add(computed.fontFamily);
    copyStyle(computed, target.style);
    target.setAttribute('data-book-snapshot', String(index));
    for (const pseudo of ['::before', '::after']) {
      const resolved = getComputedStyle(source, pseudo);
      if (resolved.content === 'none' || resolved.content === 'normal' || resolved.display === 'none') continue;
      const style = document.createElement('span').style;
      copyStyle(resolved, style);
      jobs.push(embedUrls(style.cssText).then(css => {
        styles.push(`[data-book-snapshot="${index}"]${pseudo}{${css}}`);
      }));
    }
    if (source instanceof HTMLInputElement) {
      target.setAttribute('value', source.value);
      if (source.checked) target.setAttribute('checked', '');
      else target.removeAttribute('checked');
    }
    if (source instanceof HTMLCanvasElement) {
      const image = document.createElement('img');
      image.setAttribute('style', target.style.cssText);
      image.src = source.toDataURL('image/png');
      target.replaceWith(image);
      target = image;
    } else if (source instanceof HTMLImageElement) {
      target.removeAttribute('srcset');
      jobs.push(dataUrl(source.currentSrc || source.src).then(url => { target.src = url; }));
    }
    const styledTarget = target;
    jobs.push(embedUrls(target.style.cssText).then(css => { styledTarget.style.cssText = css; }));
  });

  const fontFamilies = [...families].join(',').toLowerCase();
  const visit = (rules, base) => {
    for (const rule of rules) {
      if (rule.type === CSSRule.FONT_FACE_RULE) {
        const family = rule.style.getPropertyValue('font-family').replace(/["']/g, '').trim();
        if (fontFamilies.includes(family.toLowerCase())) {
          jobs.push(embedUrls(rule.cssText, base).then(css => { styles.push(css); }));
        }
      } else if (rule.selectorText && /::-(webkit-slider|moz-range)/.test(rule.selectorText)) {
        // Range parts are browser pseudo-elements, not cloneable DOM children.
        styles.push(rule.cssText);
      } else if (rule.cssRules) visit(rule.cssRules, base);
    }
  };
  for (const sheet of document.styleSheets) {
    try { visit(sheet.cssRules, sheet.href || document.baseURI); }
    catch { /* Cross-origin sheets cannot be inspected; resolved element styles remain. */ }
  }
  await Promise.all(jobs);
  clone.style.margin = '0';
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.transform = 'none';
  clone.style.opacity = '1';
  const container = document.createElement('div');
  container.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  const style = document.createElement('style');
  style.textContent = styles.join('\n');
  container.append(style, clone);
  const html = new XMLSerializer().serializeToString(container);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${html}</foreignObject></svg>`;
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await image.decode();
  const canvas = document.createElement('canvas');
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  return { image: canvas, width, height, source: 'resolved-book-dom' };
}
