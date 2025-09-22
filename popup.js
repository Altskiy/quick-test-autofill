const extensionToggle = document.getElementById("toggleExtension");
const autoSelectToggle = document.getElementById("toggleAutoSelect");
const forceRefreshBtn = document.getElementById("forceRefresh");

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

if (forceRefreshBtn) {
    const resetState = () => {
        forceRefreshBtn.disabled = false;
        forceRefreshBtn.textContent = "Обновить кнопки";
    };

    forceRefreshBtn.addEventListener("click", () => {
        if (forceRefreshBtn.disabled) return;
        forceRefreshBtn.disabled = true;
        forceRefreshBtn.textContent = "Обновляем...";

        const fallback = setTimeout(resetState, 2000);

        chrome.runtime.sendMessage({ type: "qt-force-refresh" }, () => {
            clearTimeout(fallback);

            if (chrome.runtime.lastError) {
                resetState();
                return;
            }

            forceRefreshBtn.textContent = "Готово";
            setTimeout(resetState, 800);
        });
    });
}

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