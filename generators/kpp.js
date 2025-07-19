/* Генерирует случайный КПП */

(function () {
    // Дополняем слева нулями до нужной длины
    const zeros = (str, len) => str.padStart(len, "0");

    function kpp() {
        var region = zeros(String(Math.floor((Math.random() * 92) + 1)), 2);
        var inspection = zeros(String(Math.floor((Math.random() * 99) + 1)), 2);
        var prichina = Math.floor((Math.random() * 4) + 1);
        switch (prichina) {
            case 1:
                prichina = '01';
                break
            case 2:
                prichina = '43';
                break
            case 3:
                prichina = '44';
                break
            case 4:
                prichina = '45';
                break
            default:
                prichina = '01';
                break
        }
        var numba = zeros(String(Math.floor((Math.random() * 999) + 1)), 3);
        var result = region + inspection + prichina + numba;
        return result;
    }

    window.autofillGenerators = window.autofillGenerators || {};
    window.autofillGenerators.kpp = kpp;
})();