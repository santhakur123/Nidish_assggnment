const fetch = require('node-fetch');

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').trim();
}

function isValidHex(value = '') {
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(value.trim());
}

function isValidUrl(value = '') {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

async function isImageReachable(url) {
  const TIMEOUT_MS = 7000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    if (!res.ok) {
      clearTimeout(timer);
      const ctrl2 = new AbortController();
      const t2 = setTimeout(() => ctrl2.abort(), TIMEOUT_MS);
      res = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' }, signal: ctrl2.signal });
      clearTimeout(t2);
    } else {
      clearTimeout(timer);
    }
    return res.ok || res.status === 206;
  } catch {
    clearTimeout(timer);
    return false;
  }
}

// ── Serverless Handler ────────────────────────────────────────────────────────

module.exports = async (req, res) => {
  // CORS headers (needed when testing locally or from different origins)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
    const { heading, paragraph, backgroundImage, textColor } = req.body || {};
    const errors = {};

    // 1. Heading
    if (!heading || !heading.trim()) {
      errors.heading = 'Heading is required.';
    }

    // 2. Paragraph
    if (!paragraph || !stripHtml(paragraph)) {
      errors.paragraph = 'Paragraph content is required.';
    }

    // 3. Text Color
    if (!textColor || !textColor.trim()) {
      errors.textColor = 'Text color is required.';
    } else if (!isValidHex(textColor)) {
      errors.textColor = 'Text color must be a valid HEX code (e.g. #FF5733 or #F53).';
    }

    // 4. Background Image URL
    if (!backgroundImage || !backgroundImage.trim()) {
      errors.backgroundImage = 'Background image URL is required.';
    } else if (!isValidUrl(backgroundImage)) {
      errors.backgroundImage = 'Background image must be a valid URL starting with http:// or https://.';
    } else {
      const reachable = await isImageReachable(backgroundImage);
      if (!reachable) {
        errors.backgroundImage = 'Background image URL is not reachable. Please check the URL.';
      }
    }

    // Return errors if any
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please fix the errors below.',
        errors,
      });
    }

    // All valid — return sanitised data
    return res.status(200).json({
      success: true,
      message: 'Content saved successfully!',
      data: {
        heading: heading.trim(),
        paragraph,
        backgroundImage: backgroundImage.trim(),
        textColor: textColor.trim().toUpperCase(),
      },
    });
  } catch (err) {
    console.error('[/api/content] Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
      errors: {},
    });
  }
};
