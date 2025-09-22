(() => {
    /* Подключаем утилиты из helpers.js */
    const { norm, nameToField, setNativeValue } = window.helpers;
    /* Данные */
    const defaultData = window.autofillData || {};
    const defaultPlaceholders = window.placeholderMap || {};
    let customData = {};
    let customPlaceholders = {};

    if (chrome?.storage?.sync) {
        chrome.storage.sync.get(["fields", "placeholders"], res => {
            if (res.fields) customData = res.fields;
            if (res.placeholders) customPlaceholders = res.placeholders;
            init();
        });
    } else init();

    // Включение-выключение расширения через кнопку в шапке браузера
    let isEnabled = true;
    chrome.storage.local.get("qtEnabled", ({ qtEnabled }) => {
        if (qtEnabled === false) {
            isEnabled = false;
        }
        if (isEnabled) init();
    });

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg?.type === "qt-enable") toggle(msg.enabled);
    });

    // Включение-выключение автоматического режима заполнения
    let autoSelect = false;
    chrome.storage.local.get("qtAutoSelect", ({ qtAutoSelect }) => {
        autoSelect = !!qtAutoSelect;
    });
    chrome.runtime.onMessage.addListener(msg => {
        if (msg?.type === "qt-auto-select") autoSelect = !!msg.enabled;
    });

    /* Глобальные ссылки */
    let activeBtn = null;
    let activeMenu = null;

    /* Один общий MutationObserver */
    const observer = new MutationObserver(muts => {
        muts.forEach(m => m.addedNodes.forEach(n => {
            if (n.nodeType !== 1) return;

            const selector =
                'input:not([data-qt]):not([type="hidden"]):not([type="submit"]), textarea:not([data-qt])';

            if (n.matches?.(selector)) addButton(n);

            const inside = n.querySelectorAll?.(selector);

            if (inside?.length) inside.forEach(addButton);
        }));
        reposition();
    });

    /* сразу запускаем, когда расширение включено */
    observer.observe(document.body, { childList: true, subtree: true });

    function toggle(state) {
        if (state === isEnabled) return;
        isEnabled = state;

        if (!isEnabled) {
            // 1. убрать добавленные элементы
            document.querySelectorAll(".qt-btn, .qt-menu").forEach(el => el.remove());
            activeBtn = activeMenu = null;

            // 2. снять метку, чтобы при следующем ON поля обрабатывались заново
            document.querySelectorAll('[data-qt]')
                .forEach(el => el.removeAttribute('data-qt'));

            observer.disconnect();
        } else {
            init();
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    function reposition() {
        document.querySelectorAll(".qt-btn").forEach(btn => {
            const el = btn.__target;
            if (!el?.isConnected) {// узел удалён из DOM
                btn.remove();
                return;
            }

            /* Поле невидимо (display:none или скрыт табом) — прячем кнопку-кружок */
            const hidden = el.offsetParent === null || el.getClientRects().length === 0;
            if (hidden) {
                btn.style.display = "none";
                if (activeBtn === btn) hideMenu();
                return;
            } else {
                btn.style.display = "";
            }

            const r = el.getBoundingClientRect();

            btn.style.left = `${r.right - 2}px`;
            btn.style.top = `${r.top - 8}px`;
        });

        /* Переместить открытое меню (если ещё есть и его кнопка видима) */
        if (activeMenu && activeBtn && activeBtn.style.display !== "none") {
            const br = activeBtn.getBoundingClientRect();
            let left = br.right;
            const vw = document.documentElement.clientWidth;
            const over = left + activeMenu.offsetWidth - vw;
            if (over > 0) left -= over + 8;
            activeMenu.style.left = `${left}px`;
            activeMenu.style.top = `${br.bottom + 4}px`;
        }
    }

    /* запускаем при любом scroll/resize */
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);

    /* Закрытие меню */
    function hideMenu() {
        if (activeMenu) activeMenu.hidden = true;
        activeMenu = null;
        activeBtn = null;
        reposition();
    }

    /* клик вне меню */
    document.addEventListener("click", e => {
        if (activeMenu &&
            !activeMenu.contains(e.target) &&
            e.target !== activeBtn) hideMenu();
    });

    /* скролл вне меню */
    document.addEventListener("scroll", e => {
        if (activeMenu && !activeMenu.contains(e.target)) hideMenu();
    }, true);

    /* Создаём кнопку и меню для одного поля */
    function addButton(el) {
        if (!isEnabled) return;

        /* приоритет — data-field */
        let fieldName = el.dataset.field?.trim();

        /* далее name, его чистим от лишнего(скобочек, точек и прочего мусора) */
        if (!fieldName && el.name) {
            const fromName = nameToField(el.name);
            if (
                fromName === "inn" || fromName === "date" ||
                customData[fromName]?.length ||
                defaultData[fromName]?.length ||
                window.autofillGenerators?.[fromName] instanceof Function
            ) {
                fieldName = fromName;
            }
        }

        /* если нет — берём placeholder и ищем в карте */
        if (!fieldName && el.placeholder) {
            const ph = norm(el.placeholder);
            fieldName = customPlaceholders[ph] || defaultPlaceholders[ph];
        }

        const isInnGeneric = fieldName === "inn";
        const isDateGeneric = fieldName === "date";

        /* выход, если данных нет (кроме special-case) */
        if (
            !fieldName ||
            (!isInnGeneric && !isDateGeneric &&
                !(customData[fieldName]?.length ||
                    (window.autofillGenerators?.[fieldName] instanceof Function) ||
                    defaultData[fieldName]?.length))
        ) return;

        el.dataset.qt = "1";

        const btn = document.createElement("span");
        btn.className = "qt-btn";
        btn.innerHTML = `
            <svg viewBox="0 0 12 12" width="12" height="12">
                <!-- контур круга -->
                <circle cx="6" cy="6" r="5" stroke="#0d1d38" stroke-width="1.2" fill="none"/>
                <!-- заливка (гаснет при :hover) -->
                <circle class="dot" cx="6" cy="6" r="3" fill="#0d1d38"/>
                <!-- три точки (появляются при :hover) -->
                <g class="dots" fill="#0d1d38" fill-opacity="0">
                    <circle cx="4.5" cy="6" r="0.8"/>
                    <circle cx="6"   cy="6" r="0.8"/>
                    <circle cx="7.5" cy="6" r="0.8"/>
                </g>
            </svg>
        `;
        document.body.appendChild(btn);
        btn.__target = el; // ссылка для reposition()

        const pr = parseInt(getComputedStyle(el).paddingRight) || 0;
        el.style.paddingRight = `${pr + 20}px`;

        /* меню */
        const menu = isInnGeneric || isDateGeneric ? document.createElement("div") : document.createElement("ul");
        menu.className = "qt-menu";
        menu.hidden = true;
        document.body.appendChild(menu);

        /* создаём список значений */
        const pickRandom = (source, size = 5) => {
            if (!Array.isArray(source) || source.length === 0) return [];
            if (source.length <= size) return source.slice();
            const pool = source.slice();
            for (let i = pool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pool[i], pool[j]] = [pool[j], pool[i]];
            }
            return pool.slice(0, size);
        };

        const makeOptions = () => {
            if (isInnGeneric) {
                return {
                    innfl: Array.from({ length: 5 }, window.autofillGenerators.innfl),
                    innul: Array.from({ length: 5 }, window.autofillGenerators.innul)
                };
            }
            if (isDateGeneric) {
                return {
                    past: Array.from({ length: 5 }, window.autofillGenerators.birthdate),
                    future: Array.from({ length: 5 }, window.autofillGenerators.futuredate)
                };
            }
            /* если пользователь переопределил — используем это */
            if (customData[fieldName]?.length) return customData[fieldName];

            /* если есть генератор — выдаём свежие 5 штук */
            if (window.autofillGenerators?.[fieldName] instanceof Function)
                return Array.from({ length: 5 }, window.autofillGenerators[fieldName]);

            /* иначе базовый словарь */
            return pickRandom(defaultData[fieldName]);
        }

        const quickFillRandom = () => {
            const opts = makeOptions();
            const rnd = Array.isArray(opts)
                ? opts[Math.floor(Math.random() * opts.length)]
                : null; // сюда попадают только простые списки

            if (!rnd) return showMenu(); // вдруг options вдруг пуст

            setNativeValue(el, rnd);
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
        }

        const fillMenu = () => {
            menu.innerHTML = "";
            /* двуколоночные варианты */
            if (isInnGeneric || isDateGeneric) {
                menu.className = `qt-menu`;
                const menuContent = document.createElement("div");
                menuContent.className = `${isInnGeneric ? "qt-menu-inn" : "qt-menu-date"}`;
                menu.appendChild(menuContent);
                const opts = makeOptions();
                const layout = isInnGeneric
                    ? [["innfl", "ФЛ:"], ["innul", "ЮЛ:"]]
                    : [["past", "Прошлое:"], ["future", "Будущее:"]];
                layout.forEach(([key, title]) => {
                    const h = document.createElement("h4");
                    h.textContent = title;
                    menuContent.appendChild(h);

                    const col = document.createElement("ul");
                    col.className = "qt-col";
                    opts[key].forEach(v => {
                        const li = document.createElement("li");
                        li.textContent = v;
                        li.onclick = (e) => {
                            e.stopPropagation();
                            setNativeValue(el, v);
                            el.dispatchEvent(new Event("input", { bubbles: true }));
                            el.dispatchEvent(new Event("change", { bubbles: true }));
                            hideMenu();
                        };
                        col.appendChild(li);
                    });
                    menuContent.appendChild(col);
                });
                return;
            }
            /* --- одна колонка --- */
            makeOptions().forEach(v => {
                const li = document.createElement("li");
                li.textContent = v;
                li.onclick = (e) => {
                    e.stopPropagation();
                    setNativeValue(el, v);
                    el.dispatchEvent(new Event("input", { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    hideMenu();
                };
                menu.appendChild(li);
            });
        };

        /* показать / скрыть */
        function showMenu() {
            if (activeMenu) hideMenu();
            fillMenu();
            menu.hidden = false;
            activeBtn = btn;
            activeMenu = menu;
            reposition();
        }

        btn.addEventListener("click", e => {
            e.stopPropagation();
            if (autoSelect && !isInnGeneric && !isDateGeneric) {
                quickFillRandom();
            } else {
                showMenu();
            }
        });

        reposition();
    }

    /* Инициализация */
    function init() {
        process(document.querySelectorAll(
            'input:not([data-qt]):not([type="hidden"]):not([type="submit"]), ' +
            'textarea:not([data-qt])'
        ));
    }

    function process(nl) { nl.forEach(addButton); }
})();

