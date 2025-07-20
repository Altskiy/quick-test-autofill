(function () {
    const pad = n => String(n).padStart(2, "0");

    // фиксируем границы (UTC-полночь, чтобы не ловить «сдвиг часового пояса»)
    const start = Date.UTC(1970, 0, 1);  // 01.01.1970
    const end = Date.UTC(2000, 0, 1);  // 01.01.2000

    function birthdate() {
        const ms = start + Math.floor(Math.random() * (end - start + 1));
        const d = new Date(ms);

        const dd = pad(d.getUTCDate());
        const mm = pad(d.getUTCMonth() + 1); // getUTCMonth() → 0-based
        const yy = d.getUTCFullYear();

        return `${dd}.${mm}.${yy}`;
    };

    window.autofillGenerators = window.autofillGenerators || {};
    window.autofillGenerators.birthdate = birthdate;
})();