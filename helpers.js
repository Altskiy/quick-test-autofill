function norm(str) {
    return str
        .toLowerCase()
        .replace(/[-_]+/g, "")
        .replace(/[^a-zа-яё0-9]+/g, " ")
        .trim();
}

function nameToField(nameAttr) {
    if (!nameAttr) return "";

    const clean = nameAttr
        .replace(/\[[^\]]*]/g, "")
        .split(".").pop()
        .trim();

    return clean;
}

/* helper: меняем value так, чтобы React это заметил */
function setNativeValue(el, value) {
    const proto = el.constructor.prototype;
    const setter =
        Object.getOwnPropertyDescriptor(proto, 'value')?.set ||
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;

    setter ? setter.call(el, value) : (el.value = value);
}