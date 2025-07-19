const tf = document.getElementById("jsonFields"); // левая 65 %
const tp = document.getElementById("jsonPH");     // правая 35 %
const save = document.getElementById("save");
const reset = document.getElementById("reset");

/* ------------------------------------------------------------------ */
/* 1.  Базовые словари и карта, уже созданы скриптами dicts.js, …      */
const defaultFields = window.autofillData || {};
const defaultPlaceholders = window.placeholderMap || {};

/* 2.  Ключи, у которых есть генераторы – исключаем из дефолтов */
const generatorKeys = Object.keys(window.autofillGenerators || {});

function withoutGenerators(obj) {
    const clone = { ...obj };
    generatorKeys.forEach(k => { if (!(k in clone)) return; delete clone[k]; });
    return clone;
}

/* 3.  Подкачиваем кастом и выводим МЕРЖ = (дефолт-без-ген) + кастом */
chrome.storage.sync.get(["fields", "placeholders"], conf => {
    const mergedFields = {
        ...withoutGenerators(defaultFields),
        ...(conf.fields || {})
    };

    const mergedPH = {
        ...defaultPlaceholders,
        ...(conf.placeholders || {})
    };

    tf.value = JSON.stringify(mergedFields, null, 2);
    tp.value = JSON.stringify(mergedPH, null, 2);
});

/* ------------------------------------------------------------------ */
/*                     СОХРАНИТЬ / СБРОСИТЬ                           */
save.onclick = () => {
    try {
        const fields = JSON.parse(tf.value || "{}");
        const placeholders = JSON.parse(tp.value || "{}");
        chrome.storage.sync.set({ fields, placeholders }, () => alert("Сохранено"));
    } catch { alert("Некорректный JSON"); }
};

reset.onclick = () => {
    if (confirm("Очистить все кастомные настройки?"))
        chrome.storage.sync.remove(["fields", "placeholders"], () => location.reload());
};
