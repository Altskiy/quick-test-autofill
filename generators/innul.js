/* Генерирует случайный ИНН юрлица */

(function () {
    const zeros = (str, len) => str.padStart(len, "0");

    function innul() {
        var region = zeros(String(Math.floor((Math.random() * 92) + 1)), 2);
        var inspection = zeros(String(Math.floor((Math.random() * 99) + 1)), 2);
        var numba = zeros(String(Math.floor((Math.random() * 99999) + 1)), 5);
        var result = region + inspection + numba;
        var kontr = String(((
            2 * result[0] + 4 * result[1] + 10 * result[2] +
            3 * result[3] + 5 * result[4] + 9 * result[5] +
            4 * result[6] + 6 * result[7] + 8 * result[8]
        ) % 11) % 10);
        kontr == 10 ? kontr = 0 : kontr = kontr;
        result = result + kontr;
        return result;
    }

    window.autofillGenerators = window.autofillGenerators || {};
    window.autofillGenerators.innul = innul;
})();