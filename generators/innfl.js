/* Генерирует случайный ИНН физлица */

(function () {
    const zeros = (str, len) => str.padStart(len, "0");

    function innfl() {
        const region = zeros(String(Math.floor(Math.random() * 92) + 1), 2);
        const inspection = zeros(String(Math.floor(Math.random() * 99) + 1), 2);
        const number = zeros(String(Math.floor(Math.random() * 999999) + 1), 6);

        let result = region + inspection + number;

        // 1-я контрольная цифра (11-й разряд)
        let k = ((7 * result[0] + 2 * result[1] + 4 * result[2] +
            10 * result[3] + 3 * result[4] + 5 * result[5] +
            9 * result[6] + 4 * result[7] + 6 * result[8] +
            8 * result[9]) % 11) % 10;
        result += k === 10 ? "0" : String(k);

        // 2-я контрольная цифра (12-й разряд)
        k = ((3 * result[0] + 7 * result[1] + 2 * result[2] +
            4 * result[3] + 10 * result[4] + 3 * result[5] +
            5 * result[6] + 9 * result[7] + 4 * result[8] +
            6 * result[9] + 8 * result[10]) % 11) % 10;
        result += k === 10 ? "0" : String(k);

        return result;
    }

    window.autofillGenerators = window.autofillGenerators || {};
    window.autofillGenerators.innfl = innfl;
})();
