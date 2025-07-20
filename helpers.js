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