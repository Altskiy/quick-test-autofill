/* Генерирует случайный ОГРН */

(function () {
    const zeros = (str, len) => str.padStart(len, "0");

    function ogrn() {
        var priznak = String(Math.floor((Math.random() * 9) + 1));
        var godreg = zeros(String(Math.floor((Math.random() * 16) + 1)), 2);
        var region = zeros(String(Math.floor((Math.random() * 92) + 1)), 2);
        var inspection = zeros(String(Math.floor((Math.random() * 99) + 1)), 2);
        var zapis = zeros(String(Math.floor((Math.random() * 99999) + 1)), 5);
        var result = priznak + godreg + region + inspection + zapis;
        var kontr = String(((result) % 11) % 10);
        kontr == 10 ? kontr = 0 : kontr = kontr;
        result = result + kontr;
        return result;
    }

    window.autofillGenerators = window.autofillGenerators || {};
    window.autofillGenerators.ogrn = ogrn;
})();