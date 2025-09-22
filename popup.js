const extensionToggle = document.getElementById("toggleExtension");
const autoSelectToggle = document.getElementById("toggleAutoSelect");

function applyInitialState() {
    chrome.storage.local.get(["qtEnabled", "qtAutoSelect"], (data) => {
        const enabled = data.qtEnabled;
        extensionToggle.checked = enabled !== false;
        autoSelectToggle.checked = !!data.qtAutoSelect;
    });
}

function handleExtensionChange() {
    const desired = extensionToggle.checked;
    chrome.runtime.sendMessage({ type: "qt-extension-toggle", enabled: desired }, () => {
        if (chrome.runtime.lastError) {
            chrome.storage.local.set({ qtEnabled: desired });
        }
    });
}

function handleAutoSelectChange() {
    chrome.storage.local.set({ qtAutoSelect: autoSelectToggle.checked });
}

extensionToggle.addEventListener("change", handleExtensionChange);
autoSelectToggle.addEventListener("change", handleAutoSelectChange);

chrome.storage.onChanged?.addListener((changes, areaName) => {
    if (areaName !== "local") return;

    if (Object.prototype.hasOwnProperty.call(changes, "qtEnabled")) {
        const value = changes.qtEnabled.newValue;
        extensionToggle.checked = value !== false;
    }

    if (Object.prototype.hasOwnProperty.call(changes, "qtAutoSelect")) {
        autoSelectToggle.checked = !!changes.qtAutoSelect.newValue;
    }
});

applyInitialState();