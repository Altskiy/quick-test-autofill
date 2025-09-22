const ICON_ON = {
    "16": "icons/icon_on_16.png",
    "32": "icons/icon_on_32.png"
};

const ICON_OFF = {
    "16": "icons/icon_off_16.png",
    "32": "icons/icon_off_32.png"
};

let enabled = true;

function updateIcon(state) {
    chrome.action.setIcon({ path: state ? ICON_ON : ICON_OFF });
}

function broadcast(state) {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            chrome.tabs.sendMessage(tab.id, { type: "qt-enable", enabled: state });
        });
    });
}

function applyState(state, { notify = false } = {}) {
    enabled = !!state;
    updateIcon(enabled);
    if (notify) {
        broadcast(enabled);
    }
}

chrome.storage.local.get("qtEnabled", (data) => {
    if (Object.prototype.hasOwnProperty.call(data, "qtEnabled")) {
        applyState(data.qtEnabled !== false, { notify: data.qtEnabled === false });
    } else {
        chrome.storage.local.set({ qtEnabled: true });
        applyState(true);
    }
});

chrome.storage.onChanged?.addListener((changes, areaName) => {
    if (areaName !== "local" || !Object.prototype.hasOwnProperty.call(changes, "qtEnabled")) {
        return;
    }

    const nextState = changes.qtEnabled.newValue !== false;
    if (nextState === enabled) {
        return;
    }

    applyState(nextState, { notify: true });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.type === "qt-extension-toggle") {
        const desired = !!msg.enabled;
        applyState(desired, { notify: true });
        chrome.storage.local.set({ qtEnabled: desired }, () => sendResponse?.({ ok: true }));
        return true;
    }

    if (msg?.type === "qt-force-refresh") {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                chrome.tabs.sendMessage(tab.id, { type: "qt-refresh" });
            });
            sendResponse?.({ ok: true });
        });
        return true;
    }
});
