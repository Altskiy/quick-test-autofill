let enabled = true;

chrome.action.onClicked.addListener(() => {
    enabled = !enabled;

    chrome.action.setIcon({
        path: enabled
            ? { "16": "icons/icon_on_16.png", "32": "icons/icon_on_32.png" }
            : { "16": "icons/icon_off_16.png", "32": "icons/icon_off_32.png" }
    });

    chrome.storage.local.set({ qtEnabled: enabled });

    chrome.tabs.query({}, tabs => {
        for (const t of tabs) {
            chrome.tabs.sendMessage(t.id, { type: "qt-enable", enabled });
        }
    });
});
