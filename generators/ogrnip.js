/* Генерирует случайный ОГРНИП */

(function () {
    const zeros = (str, len) => str.padStart(len, "0");

    /* одна случайная строка-ОГРНИП */
    function ogrnip() {
        const priznak = String(Math.floor(Math.random() * 2) + 3);     // 3‒4
        const godreg = zeros(String(Math.floor(Math.random() * 23) + 1), 2); // 01‒23
        const region = zeros(String(Math.floor(Math.random() * 92) + 1), 2); // 01‒92
        const inspection = zeros(String(Math.floor(Math.random() * 99) + 1), 2); // 01‒99
        const zapis = zeros(String(Math.floor(Math.random() * 9_999_999) + 1), 7);

        let result = priznak + godreg + region + inspection + zapis; // 14 цифр
        const ctrl = ((Number(result) % 13) % 10).toString();
        return result + ctrl;                                        // 15 цифр
    }

    window.autofillGenerators = window.autofillGenerators || {};
    window.autofillGenerators.ogrnip = ogrnip;
})();
