const express = require('express');
const { validateContent } = require('../validators/contentValidator');

const router = express.Router();

// ── POST /api/content ─────────────────────────────────────────────────────────
router.post('/content', async (req, res) => {
  try {
    const { heading, paragraph, backgroundImage, textColor } = req.body;

    // Run server-side validation (async because of image URL check)
    const result = await validateContent({ heading, paragraph, backgroundImage, textColor });

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please fix the errors below.',
        errors: result.errors,
      });
    }

    // All valid — return the sanitised data back to the frontend
    return res.status(200).json({
      success: true,
      message: 'Content saved successfully!',
      data: {
        heading: heading.trim(),
        paragraph,                          // keep HTML for rich-text
        backgroundImage: backgroundImage.trim(),
        textColor: textColor.trim().toUpperCase(),
      },
    });
  } catch (err) {
    console.error('[POST /api/content] Unexpected error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      errors: {},
    });
  }
});

module.exports = router;
