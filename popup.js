document.addEventListener('DOMContentLoaded', () => {
    const sitesList = document.getElementById('sites-list');
    const addRuleBtn = document.getElementById('add-rule-btn');
    const newSiteHostnameInput = document.getElementById('new-site-hostname');
    const newRuleNameInput = document.getElementById('new-rule-name');
    const newRuleSelectorInput = document.getElementById('new-rule-selector');

    let currentSites = {};

    const saveSites = () => {
        chrome.storage.sync.set({ sites: currentSites });
    };

    const render = () => {
        sitesList.innerHTML = '';
        for (const hostname in currentSites) {
            const siteRules = currentSites[hostname];
            if (siteRules.length === 0) continue;

            const siteContainer = document.createElement('div');
            siteContainer.className = 'site-container';
            siteContainer.innerHTML = `<h3>${hostname}</h3>`;

            const rulesList = document.createElement('ul');
            rulesList.className = 'rules-list';

            siteRules.forEach((rule, index) => {
                const ruleItem = document.createElement('li');
                ruleItem.innerHTML = `
                    <label class="toggle">
                        <input type="checkbox" ${rule.enabled ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                    <span class="rule-name">${rule.name}</span>
                    <button class="delete-btn" data-hostname="${hostname}" data-index="${index}">×</button>
                `;

                // Event listener for toggling rule
                ruleItem.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
                    currentSites[hostname][index].enabled = e.target.checked;
                    saveSites();
                });

                rulesList.appendChild(ruleItem);
            });

            siteContainer.appendChild(rulesList);
            sitesList.appendChild(siteContainer);
        }
    };

    // Set active tab's hostname in the input field
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url) {
            const url = new URL(tabs[0].url);
            newSiteHostnameInput.value = url.hostname;
        }
    });

    chrome.storage.sync.get('sites', (data) => {
        if (data.sites) {
            currentSites = data.sites;
            render();
        }
    });

    addRuleBtn.addEventListener('click', () => {
        const hostname = newSiteHostnameInput.value.trim();
        const name = newRuleNameInput.value.trim();
        const selector = newRuleSelectorInput.value.trim();

        if (!hostname || !name || !selector) {
            alert('Please fill in all fields.');
            return;
        }

        if (!currentSites[hostname]) {
            currentSites[hostname] = [];
        }

        currentSites[hostname].push({ name, selector, enabled: true });
        saveSites();
        render();

        // Clear input fields
        newRuleNameInput.value = '';
        newRuleSelectorInput.value = '';
    });

    sitesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const { hostname, index } = e.target.dataset;
            currentSites[hostname].splice(index, 1);
            if (currentSites[hostname].length === 0) {
                delete currentSites[hostname];
            }
            saveSites();
            render();
        }
    });
});