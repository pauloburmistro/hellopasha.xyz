document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-item[data-page]');
    const pages = document.querySelectorAll('.page');
    const body = document.body;

    // Карта оригинальных фонов для body из вашего CSS
    const bodyBackgrounds = {
        'main': 'page-main',
        'about': 'page-about',
        'projects': 'page-projects',
        'contacts': 'page-contacts'
    };

    // Функция, которая физически включает нужную страницу
    function activatePage(pageId) {
        if (!pageId) return;

        const targetMenuItem = document.querySelector(`.menu-item[data-page="${pageId}"]`);
        const targetPage = document.getElementById(`page-${pageId}`);

        if (targetMenuItem && targetPage) {
            // 1. Очищаем все активные классы и иконки-точки
            menuItems.forEach(i => {
                i.classList.remove('active');
                const slot = i.querySelector('.menu-icon-slot');
                if (slot) slot.innerHTML = '';
            });
            pages.forEach(p => p.classList.remove('active'));

            // 2. Активируем выбранную страницу и пункт меню
            targetMenuItem.classList.add('active');
            targetPage.classList.add('active');

            // 3. Рисуем точку в активном пункте
            const currentSlot = targetMenuItem.querySelector('.menu-icon-slot');
            if (currentSlot && targetMenuItem.dataset.icon) {
                currentSlot.innerHTML = `<img src="${targetMenuItem.dataset.icon}" alt="" class="menu-icon">`;
            }

            // 4. Меняем фон body
            body.className = bodyBackgrounds[pageId] || `page-${pageId}`;
            
            // 5. Запоминаем текущую страницу в памяти браузера (чтобы выдержать перезагрузку)
            sessionStorage.setItem('currentPage', pageId);
        }
    }

    // === 1. ЛОГИКА ПЕРЕКЛЮЧЕНИЯ СТРАНИЦ МЕНЮ (ПРИ КЛИКЕ) ===
link.addEventListener('click', (e) => {
    e.preventDefault();
    const pageId = item.dataset.page;
    activatePage(pageId);
    
    // Прописываем хэш в адресную строку, чтобы ссылку можно было скопировать
    history.pushState(null, null, '#' + pageId);
});

    // === 2. ОПРЕДЕЛЕНИЕ СТРАНИЦЫ ПРИ ЗАГРУЗКЕ ИЛИ ПЕРЕЗАГРУЗКЕ ===
    function initPagePosition() {
        // Проверяем: пришли ли мы по ссылке с хэшем (например, из кейса index.html#projects)
        if (window.location.hash && window.location.hash !== '#') {
            const hash = window.location.hash.replace('#', '');
            if (bodyBackgrounds[hash]) {
                activatePage(hash);
                return; // Хэш из URL имеет наивысший приоритет
            }
        }

        // Если хэша нет, проверяем память вкладки: где пользователь был до перезагрузки?
        const savedPage = sessionStorage.getItem('currentPage');
        if (savedPage && bodyBackgrounds[savedPage]) {
            activatePage(savedPage);
        } else {
            // Если открыли сайт первый раз вообще — включаем дефолтную главную (main)
            activatePage('main');
        }
    }

    // Запускаем выбор страницы
    initPagePosition();
    window.addEventListener('hashchange', () => {
        if (window.location.hash && window.location.hash !== '#') {
            activatePage(window.location.hash.replace('#', ''));
        }
    });

    // === 3. ЛОГИКА ФИЛЬТРАЦИИ И ПОДФОКУСНОГО СЧЕТЧИКА КЕЙСОВ ===
    const filterContainer = document.querySelector('.projects-filter');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const countDisplay = document.querySelector('.countprojects');

    if (countDisplay && filterContainer) {
        function getCountForFilter(filterValue) {
            if (filterValue === 'all') return projectCards.length;
            let count = 0;
            projectCards.forEach(card => {
                if (card.getAttribute('data-type') === filterValue) count++;
            });
            return count;
        }

        let currentActiveCount = getCountForFilter('all');
        countDisplay.textContent = currentActiveCount;

        filterButtons.forEach(button => {
            const filterValue = button.getAttribute('data-filter');

            button.addEventListener('mouseenter', () => {
                countDisplay.textContent = getCountForFilter(filterValue);
                countDisplay.style.color = '#B6B6B6';
            });

            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                currentActiveCount = getCountForFilter(filterValue);
                countDisplay.textContent = currentActiveCount;
                countDisplay.style.color = '#000000';

                projectCards.forEach(card => {
                    const cardType = card.getAttribute('data-type');
                    if (filterValue === 'all' || cardType === filterValue) {
                        card.classList.remove('hide');
                    } else {
                        card.classList.add('hide');
                    }
                });
            });
        });

        filterContainer.addEventListener('mouseleave', () => {
            countDisplay.textContent = currentActiveCount;
            countDisplay.style.color = '#000000';
        });
    }

    // === 4. ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА (RU / EN) ===
    const langItems = document.querySelectorAll('.lang-item[data-lang]');
    const htmlEl = document.documentElement;

    function applyTranslations(lang) {
        // Простые текстовые элементы (кнопки, заголовки, пункты меню)
        document.querySelectorAll('[data-ru][data-en]').forEach(el => {
            el.textContent = lang === 'ru' ? el.dataset.ru : el.dataset.en;
        });

        // Блоки с разметкой (ссылки внутри текста) — переключаются классом на <html>
        htmlEl.classList.remove('lang-ru', 'lang-en');
        htmlEl.classList.add('lang-' + lang);
        htmlEl.setAttribute('lang', lang);
    }

    function switchLanguage(lang) {
        langItems.forEach(item => {
            const slot = item.querySelector('.lang-icon-slot');
            const isActive = item.dataset.lang === lang;
            item.classList.toggle('active', isActive);
            if (slot) {
                slot.innerHTML = isActive ? '<img src="icons/global.svg" alt="" class="lang-icon">' : '';
            }
        });

        applyTranslations(lang);
        localStorage.setItem('siteLang', lang);
    }

    langItems.forEach(item => {
        item.addEventListener('click', () => switchLanguage(item.dataset.lang));
    });

    // При загрузке — берём язык из памяти (действует на всех страницах сайта)
    const savedLang = localStorage.getItem('siteLang') || 'ru';
    switchLanguage(savedLang);

    // === 5. МОБИЛЬНОЕ МЕНЮ (< 700px) ===
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileCloseText = document.querySelector('.mobile-close-text');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            document.body.classList.add('mobile-menu-open');
        });
    }

    if (mobileCloseText) {
        mobileCloseText.addEventListener('click', () => {
            document.body.classList.remove('mobile-menu-open');
        });
    }

    // Закрываем меню при выборе языка (переход по странице уже закрывает его сам,
    // т.к. activatePage() полностью переписывает body.className)
    document.querySelectorAll('.lang-item').forEach(item => {
        item.addEventListener('click', () => {
            document.body.classList.remove('mobile-menu-open');
        });
    });

    // === 6. АВТОЗАПУСК ВИДЕО ПРИ ПОЯВЛЕНИИ В ОБЛАСТИ ЭКРАНА ===
    const videos = document.querySelectorAll('.project-card-media');
    if (videos.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    video.play().catch(err => console.log('play prevented:', err));
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.25 });

        videos.forEach(video => observer.observe(video));
    }
});