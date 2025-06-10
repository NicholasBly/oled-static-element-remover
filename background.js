chrome.runtime.onInstalled.addListener(() => {
  const initialSites = {
    "www.youtube.com": [
      {
        name: "YouTube Logo",
        selector: "ytd-topbar-logo-renderer#logo",
        enabled: true
      },

      {
        name: "Voice Search Button",
        selector: "#voice-search-button",
        enabled: true
      }
    ]
  };

  chrome.storage.sync.get('sites', (data) => {
    if (!data.sites) {
      chrome.storage.sync.set({ sites: initialSites });
    }
  });
});