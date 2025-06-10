// content.js
const styleId = 'static-elementizer-styles';

const applyRules = (sites) => {
  // Remove existing styles to prevent duplication
  const existingStyleElement = document.getElementById(styleId);
  if (existingStyleElement) {
    existingStyleElement.remove();
  }

  const hostname = window.location.hostname;
  const rules = sites[hostname];

  if (!rules || !Array.isArray(rules)) {
    return;
  }

  // Generate the CSS rules string
  const cssRules = rules
    .filter(rule => rule.enabled && rule.selector)
    .map(rule => `
      ${rule.selector} {
        opacity: 0 !important;
        transition: opacity 0.2s ease-in-out !important;
      }
      ${rule.selector}:hover {
        opacity: 1 !important;
      }
    `)
    .join('\n');

  if (cssRules) {
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = cssRules;
    document.head.appendChild(styleElement);
  }
};

// Load sites from storage and apply rules
chrome.storage.sync.get('sites', (data) => {
  if (data.sites) {
    applyRules(data.sites);
  }
});

// Listen for storage changes to update styles dynamically
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.sites) {
    applyRules(changes.sites.newValue);
  }
});