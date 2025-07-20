/* к нижнему регистру + очистка */
function norm(str = "") {
  return str
    .toLowerCase()
    .replace(/[-_]+/g, "")
    .replace(/[^a-zа-яё0-9]+/g, " ")
    .trim();
}

/* вытаскиваем чистое имя */
function nameToField(nameAttr = "") {
  return nameAttr
    .replace(/\[[^\]]*]/g, "")   // убираем [... ]
    .split(".").pop()            // берём часть после последней точки
    .trim();
}

/* меняем value так, чтобы React/Vue это заметил */
function setNativeValue(el, value) {
    const proto = el.constructor.prototype;
  const setter =
        Object.getOwnPropertyDescriptor(proto, 'value')?.set ||
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;

  setter ? setter.call(el, value) : (el.value = value);
}

/* экспорт */
window.helpers = { norm, nameToField, setNativeValue };