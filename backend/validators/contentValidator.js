const fetch = require('node-fetch');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Strip HTML tags from a rich-text string and check if meaningful text remains.
 */
function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Validate a HEX color string (3 or 6 digit, with leading #).
 */
function isValidHex(value = '') {
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(value.trim());
}

/**
 * Validate that a string looks like an absolute URL.
 */
function isValidUrl(value = '') {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Check if an image URL is reachable via HEAD (falls back to GET if HEAD is
 * blocked by the server) and returns a 2xx status code.
 */
async function isImageReachable(url) {
  const TIMEOUT_MS = 7000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // First try HEAD request
    let res = await fetch(url, { method: 'HEAD', signal: controller.signal });

    // Some servers reject HEAD — fall back to GET range request
    if (!res.ok) {
      clearTimeout(timer);
      const controller2 = new AbortController();
      const timer2 = setTimeout(() => controller2.abort(), TIMEOUT_MS);
      res = await fetch(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
        signal: controller2.signal,
      });
      clearTimeout(timer2);
    } else {
      clearTimeout(timer);
    }

    return res.ok || res.status === 206; // 206 = Partial Content (range request)
  } catch {
    clearTimeout(timer);
    return false;
  }
}

// ── Main Validator ────────────────────────────────────────────────────────────

/**
 * Validates the incoming content payload.
 * Returns { valid: true } or { valid: false, errors: { field: message } }
 */
async function validateContent({ heading, paragraph, backgroundImage, textColor }) {
  const errors = {};

  // 1. Heading — required
  if (!heading || !heading.trim()) {
    errors.heading = 'Heading is required.';
  }

  // 2. Paragraph — required (strip HTML before checking)
  if (!paragraph || !stripHtml(paragraph)) {
    errors.paragraph = 'Paragraph content is required.';
  }

  // 3. Text Color — required + valid HEX
  if (!textColor || !textColor.trim()) {
    errors.textColor = 'Text color is required.';
  } else if (!isValidHex(textColor)) {
    errors.textColor = 'Text color must be a valid HEX code (e.g. #FF5733 or #F53).';
  }

  // 4. Background Image — required + valid URL format + reachable
  if (!backgroundImage || !backgroundImage.trim()) {
    errors.backgroundImage = 'Background image URL is required.';
  } else if (!isValidUrl(backgroundImage)) {
    errors.backgroundImage = 'Background image must be a valid URL starting with http:// or https://.';
  } else {
    const reachable = await isImageReachable(backgroundImage);
    if (!reachable) {
      errors.backgroundImage =
        'Background image URL is not reachable or returned an error. Please check the URL.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

module.exports = { validateContent };
