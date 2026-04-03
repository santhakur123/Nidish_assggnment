/* ============================================================
   ENV CONFIG
   On Vercel, both frontend and backend share the same domain,
   so API_BASE_URL is empty (relative URL). No change needed!
   For local dev, change to: 'http://localhost:5000'
   ============================================================ */
const API_BASE_URL = '';   // ← Empty = relative URL = works perfectly on Vercel

// ── DOM References ────────────────────────────────────────────────────────────
const form              = document.getElementById('content-form');
const inputHeading      = document.getElementById('input-heading');
const inputParagraph    = document.getElementById('input-paragraph');  // hidden
const inputBgImage      = document.getElementById('input-backgroundImage');
const inputTextColor    = document.getElementById('input-textColor');
const colorSwatch       = document.getElementById('color-swatch');
const submitBtn         = document.getElementById('submit-btn');
const formSuccess       = document.getElementById('form-success');

// Preview DOM
const previewCardInner  = document.getElementById('preview-card-inner');
const previewHeading    = document.getElementById('preview-heading');
const previewParagraph  = document.getElementById('preview-paragraph');
const previewBadge      = document.querySelector('.preview-badge');
const metaStatus        = document.getElementById('meta-status');
const metaColor         = document.getElementById('meta-color');
const metaUrl           = document.getElementById('meta-url');

// ── Quill Rich-Text Editor ────────────────────────────────────────────────────
const quill = new Quill('#quill-editor', {
  theme: 'snow',
  placeholder: 'Write your paragraph content here…',
  modules: {
    toolbar: [
      [{ header: [2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strip HTML tags and return plain text */
function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/** Validate a HEX color string (3 or 6 digits with # prefix) */
function isValidHex(value) {
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(value.trim());
}

/** Basic URL format check */
function isValidUrl(value) {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// ── Error Helpers ─────────────────────────────────────────────────────────────

function setError(fieldName, message) {
  const group = document.getElementById(`group-${fieldName}`);
  const errorEl = document.getElementById(`error-${fieldName}`);
  group.classList.add('has-error');
  errorEl.textContent = message;
  errorEl.classList.add('visible');
}

function clearError(fieldName) {
  const group = document.getElementById(`group-${fieldName}`);
  const errorEl = document.getElementById(`error-${fieldName}`);
  group.classList.remove('has-error');
  errorEl.textContent = '';
  errorEl.classList.remove('visible');
}

function clearAllErrors() {
  ['heading', 'paragraph', 'backgroundImage', 'textColor'].forEach(clearError);
  formSuccess.classList.remove('visible');
  formSuccess.textContent = '';
}

/** Apply server-side error map { field: message } to the UI */
function applyServerErrors(errors) {
  Object.entries(errors).forEach(([field, message]) => {
    setError(field, message);
  });
}

// ── Live Color Swatch ─────────────────────────────────────────────────────────
inputTextColor.addEventListener('input', () => {
  const val = inputTextColor.value.trim();
  if (isValidHex(val)) {
    colorSwatch.style.background = val;
    colorSwatch.classList.add('active');
    clearError('textColor');
  } else {
    colorSwatch.style.background = '';
    colorSwatch.classList.remove('active');
  }
});

// Clear error on any change
inputHeading.addEventListener('input',   () => clearError('heading'));
inputBgImage.addEventListener('input',   () => clearError('backgroundImage'));
quill.on('text-change', ()               => clearError('paragraph'));

// ── Client-Side Validation ────────────────────────────────────────────────────

function validateClient() {
  const errors = {};
  const paragraphHtml = quill.root.innerHTML;
  const paragraphText = stripHtml(paragraphHtml).trim();

  if (!inputHeading.value.trim()) {
    errors.heading = 'Heading is required.';
  }

  if (!paragraphText) {
    errors.paragraph = 'Paragraph content is required.';
  }

  const bgVal = inputBgImage.value.trim();
  if (!bgVal) {
    errors.backgroundImage = 'Background image URL is required.';
  } else if (!isValidUrl(bgVal)) {
    errors.backgroundImage = 'Please enter a valid URL starting with http:// or https://';
  }

  const colorVal = inputTextColor.value.trim();
  if (!colorVal) {
    errors.textColor = 'Text color is required.';
  } else if (!isValidHex(colorVal)) {
    errors.textColor = 'Must be a valid HEX code, e.g. #FF5733 or #F53';
  }

  return Object.keys(errors).length === 0
    ? { valid: true }
    : { valid: false, errors };
}

// ── Button State Helpers ──────────────────────────────────────────────────────

function setButtonLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle('loading', isLoading);
}

function shakeButton() {
  submitBtn.classList.remove('shake');
  void submitBtn.offsetWidth;
  submitBtn.classList.add('shake');
  submitBtn.addEventListener('animationend', () => submitBtn.classList.remove('shake'), { once: true });
}

// ── Preview Update ────────────────────────────────────────────────────────────

function updatePreview({ heading, paragraph, backgroundImage, textColor }) {
  previewCardInner.classList.remove('updating');
  void previewCardInner.offsetWidth;
  previewCardInner.classList.add('updating');

  previewCardInner.style.backgroundImage = `
    linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 60%, transparent 100%),
    url("${backgroundImage}")
  `;
  previewCardInner.style.backgroundSize     = 'cover';
  previewCardInner.style.backgroundPosition = 'center';

  previewHeading.textContent = heading;
  previewHeading.style.color = textColor;

  previewParagraph.innerHTML = paragraph;
  previewParagraph.style.color = textColor;

  if (previewBadge) {
    previewBadge.textContent = 'Live Content';
    previewBadge.style.background = 'rgba(16, 185, 129, 0.2)';
    previewBadge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    previewBadge.style.color = '#6ee7b7';
  }

  metaStatus.textContent = '✅ Updated';
  metaStatus.style.color = '#10b981';
  metaColor.textContent  = textColor.toUpperCase();
  metaColor.style.color  = textColor;
  metaUrl.textContent    = backgroundImage;
  metaUrl.title          = backgroundImage;
}

// ── Form Submit ───────────────────────────────────────────────────────────────

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAllErrors();

  const paragraphHtml = quill.root.innerHTML;
  inputParagraph.value = paragraphHtml;

  // Step 1: Client-side validation
  const clientResult = validateClient();
  if (!clientResult.valid) {
    applyServerErrors(clientResult.errors);
    shakeButton();
    const firstErrorGroup = document.querySelector('.field-group.has-error');
    if (firstErrorGroup) firstErrorGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Step 2: POST to API
  const payload = {
    heading:         inputHeading.value.trim(),
    paragraph:       paragraphHtml,
    backgroundImage: inputBgImage.value.trim(),
    textColor:       inputTextColor.value.trim().toUpperCase(),
  };

  setButtonLoading(true);

  try {
    const res = await fetch(`${API_BASE_URL}/api/content`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      if (json.errors && Object.keys(json.errors).length > 0) {
        applyServerErrors(json.errors);
      } else {
        formSuccess.textContent = json.message || 'Something went wrong. Please try again.';
        formSuccess.style.background = 'rgba(244, 63, 94, 0.12)';
        formSuccess.style.borderColor = 'rgba(244, 63, 94, 0.3)';
        formSuccess.style.color = '#f43f5e';
        formSuccess.classList.add('visible');
      }
      shakeButton();
      return;
    }

    // Step 3: Success — update preview
    updatePreview(json.data);

    formSuccess.textContent    = `✅ ${json.message}`;
    formSuccess.style.background  = 'rgba(16, 185, 129, 0.12)';
    formSuccess.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    formSuccess.style.color       = '#10b981';
    formSuccess.classList.add('visible');

    setTimeout(() => formSuccess.classList.remove('visible'), 4000);

  } catch (err) {
    console.error('[Submit] Network error:', err);
    formSuccess.textContent    = '❌ Unable to reach the server. Please try again.';
    formSuccess.style.background  = 'rgba(244, 63, 94, 0.12)';
    formSuccess.style.borderColor = 'rgba(244, 63, 94, 0.3)';
    formSuccess.style.color       = '#f43f5e';
    formSuccess.classList.add('visible');
    shakeButton();
  } finally {
    setButtonLoading(false);
  }
});
