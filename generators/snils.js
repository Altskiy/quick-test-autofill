/* Генерирует случайный СНИЛС */

(function () {
    // Дополняем слева нулями до нужной длины
    const zeros = (str, len) => str.padStart(len, "0");

    function snils() {
        var rand1 = zeros(String(Math.floor((Math.random() * 998) + 2)), 3);
        var rand2 = zeros(String(Math.floor((Math.random() * 999) + 1)), 3);
        var rand3 = zeros(String(Math.floor((Math.random() * 999) + 1)), 3);
        var result = rand1 + rand2 + rand3;
        var kontr = String(9 * result[0] + 8 * result[1] + 7 * result[2] +
            6 * result[3] + 5 * result[4] + 4 * result[5] +
            3 * result[6] + 2 * result[7] + 1 * result[8]);
        if (kontr < 100) {
            kontr = kontr;
        }
        else if (kontr > 101) {
            kontr = String(kontr % 101);
            kontr = zeros(kontr, 2);
            if (kontr > 99) {
                kontr = '00';
            }
        }
        else {
            kontr = '00';
        }
        result = result + kontr;
        return result;
    }

    window.autofillGenerators = window.autofillGenerators || {};
    window.autofillGenerators.snils = snils;
})();