(function () {
    const pad = n => String(n).padStart(2, "0");

    const today = new Date(); // граница «от»
    const startMs = Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() + 1); // завтрашний полдень UTC
    const endMs = Date.UTC(2099, 11, 31);        // 31-12-2099

    function futuredate() {
        const ms = startMs + Math.floor(Math.random() * (endMs - startMs + 1));
        const d = new Date(ms);
        return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`;
    }

    window.autofillGenerators = window.autofillGenerators || {};
    window.autofillGenerators.futuredate = futuredate;
})();
