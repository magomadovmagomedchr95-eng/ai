// DOM Elements
const searchBtn = document.getElementById('searchButton');
const queryInput = document.getElementById('queryInput');
const resultContainer = document.getElementById('resultContainer');
const answerSourceBadge = document.getElementById('answerSourceBadge');
const suggestionChips = document.querySelectorAll('.suggestion-chip');

// Wikipedia API endpoints
const WIKI_API_URL = 'https://ru.wikipedia.org/api/rest_v1/page/summary/';
const WIKI_SEARCH_URL = 'https://ru.wikipedia.org/w/api.php';

// ----- ЛОКАЛЬНЫЕ ЗНАНИЯ ИИ (отвечает сам, без интернета) -----
function getLocalAnswer(query) {
    const q = query.toLowerCase().trim();
    
    // === ПРИВЕТСТВИЯ И ПРОЩАНИЯ ===
    if (q.match(/^(привет|здравствуй|здравствуйте|hello|hi|hey|добрый день|добрый вечер|доброе утро)/i)) {
        return "Привет! Я гибридный ИИ. Могу поболтать, дать совет или найти информацию в интернете. Чем помочь?";
    }
    if (q.match(/(пока|до свидания|увидимся|bye|goodbye)/i)) {
        return "Пока! Заходи ещё. 😊";
    }
    
    // === КАК ДЕЛА / НАСТРОЕНИЕ ===
    if (q.match(/(как дела|как твои дела|как у тебя дела|как жизнь|как поживаешь|как настроение|how are you)/i)) {
        return "У меня всё отлично! Я в хорошем настроении. А у тебя как?";
    }
    if (q.match(/(что делаешь|чем занимаешься|что ты делаешь)/i)) {
        return "Я сейчас отвечаю на твои вопросы. А ты чем занят?";
    }
    
    // === КТО ТЫ / О СЕБЕ ===
    if (q.match(/(кто ты|твоё имя|расскажи о себе|что ты умеешь|твои возможности|откуда ты|кто тебя создал)/i)) {
        return "Я — гибридный ИИ-помощник. Умею отвечать на простые вопросы сам (приветствия, математика, время, шутки, исторические даты, советы), а если вопрос сложный или нужны свежие данные — ищу в Wikipedia. Чем могу помочь?";
    }
    
    // === БЛАГОДАРНОСТИ ===
    if (q.match(/(спасибо|благодарю|thanks|thank you)/i)) {
        return "Пожалуйста! Обращайся ещё :)";
    }
    
    // === МАТЕМАТИКА ===
    const mathMatch = q.match(/(?:сколько будет|вычисли|посчитай|)(\d+)\s*([+\-*/])\s*(\d+)/i);
    if (mathMatch) {
        const a = parseFloat(mathMatch[1]);
        const op = mathMatch[2];
        const b = parseFloat(mathMatch[3]);
        let result;
        switch (op) {
            case '+': result = a + b; break;
            case '-': result = a - b; break;
            case '*': result = a * b; break;
            case '/': result = b !== 0 ? a / b : 'деление на ноль'; break;
            default: result = 'не могу вычислить';
        }
        if (typeof result === 'number') result = Math.round(result * 100) / 100;
        return `Результат: ${a} ${op} ${b} = ${result}`;
    }
    
    // === ВРЕМЯ И ДАТА ===
    if (q.match(/(который час|текущее время|сколько времени|скажи время|часы|минуты)/i)) {
        const now = new Date();
        return `Сейчас ${now.toLocaleTimeString()}. Точное время (по твоему устройству).`;
    }
    if (q.match(/(какая сегодня дата|сегодняшнее число|какой сегодня день|день недели)/i)) {
        const now = new Date();
        return `Сегодня ${now.toLocaleDateString()}, ${now.toLocaleString('ru', { weekday: 'long' })}.`;
    }
    
    // === ШУТКИ ===
    if (q.match(/(расскажи шутку|пошути|смешное|анекдот)/i)) {
        const jokes = [
            "Почему программисты путают Хэллоуин и Рождество? Потому что 31 Oct = 25 Dec.",
            "— Алло, это ИИ? — Нет, это служба поддержки. Но я тоже почти ничего не умею. 😄",
            "Встретились два ИИ: — Ты веришь в людей? — Только если они заходят в чат раз в день.",
            "Сколько нужно программистов, чтобы заменить лампочку? Ни одного, это hardware problem."
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }
    
    // === СОВЕТЫ: КАК СТАТЬ БОГАТЫМ, КАК ЗАРАБОТАТЬ, КАК ПОХУДЕТЬ ===
    if (q.includes('как стать богатым') || q.includes('как разбогатеть')) {
        return "Стать богатым — цель многих. Вот несколько общих советов:\n• Развивай ценные навыки (программирование, маркетинг, продажи).\n• Инвестируй свободные деньги (акции, недвижимость).\n• Создай свой бизнес или найди высокооплачиваемую работу.\n• Учись финансовой грамотности. Но помни: быстрого пути нет, нужны труд и время.";
    }
    if (q.includes('как заработать деньги') || q.includes('как заработать')) {
        return "Способы заработка: фриланс, удалённая работа, создание онлайн-курсов, инвестиции, малый бизнес. Выбери то, что тебе интересно, и развивайся. Хочешь, поищу конкретные идеи в Wikipedia?";
    }
    if (q.includes('как похудеть') || q.includes('как сбросить вес')) {
        return "Для похудения важно: дефицит калорий, сбалансированное питание (больше белка, овощей), регулярные физические нагрузки (ходьба, спорт), здоровый сон. Но перед диетой лучше проконсультироваться с врачом.";
    }
    if (q.includes('как выучить английский')) {
        return "Советы по английскому: смотри фильмы с субтитрами, читай книги, используй приложения (Duolingo, Lingualeo), общайся с носителями онлайн, занимайся каждый день хотя бы 15 минут. Главное — регулярность!";
    }
    
    // === ИСТОРИЧЕСКИЕ ДАТЫ (когда умер ...) ===
    const deathMatch = q.match(/когда умер\s+([а-яё\s]+)/i);
    if (deathMatch) {
        const name = deathMatch[1].trim().toLowerCase();
        const deaths = {
            'пушкин': 'Александр Сергеевич Пушкин умер 10 февраля 1837 года (29 января по старому стилю).',
            'лермонтов': 'Михаил Юрьевич Лермонтов умер 27 июля 1841 года.',
            'наполеон': 'Наполеон Бонапарт умер 5 мая 1821 года.',
            'сталин': 'Иосиф Сталин умер 5 марта 1953 года.',
            'лен ин': 'Владимир Ленин умер 21 января 1924 года.',
            'екатерина 2': 'Екатерина II умерла 17 ноября 1796 года.',
            'петр 1': 'Пётр I умер 8 февраля 1725 года.',
            'гоголь': 'Николай Гоголь умер 4 марта 1852 года.',
            'достоевский': 'Фёдор Достоевский умер 9 февраля 1881 года.',
            'толстой': 'Лев Толстой умер 20 ноября 1910 года.',
            'есенин': 'Сергей Есенин умер 28 декабря 1925 года.',
            'маяковский': 'Владимир Маяковский умер 14 апреля 1930 года.'
        };
        for (let key in deaths) {
            if (name.includes(key)) {
                return deaths[key];
            }
        }
        return `Я не знаю точную дату смерти ${deathMatch[1]}. Могу поискать в Wikipedia, если хочешь.`;
    }
    
    // === ВОЗРАСТ ИЗВЕСТНЫХ ЛЮДЕЙ (сколько лет ...) ===
    const ageMatch = q.match(/сколько лет\s+([а-яё\s]+)/i);
    if (ageMatch) {
        const name = ageMatch[1].trim().toLowerCase();
        // Можно добавить несколько известных, но проще предложить поискать
        return `Я не могу точно сказать, сколько лет ${ageMatch[1]}, так как у меня нет полной базы. Хотите, поищу в Wikipedia?`;
    }
    
    // === КТО ТАКОЙ / ЧТО ТАКОЕ (простые определения) ===
    const whoMatch = q.match(/кто такой\s+([а-яё\s]+)/i);
    if (whoMatch) {
        const subject = whoMatch[1].trim().toLowerCase();
        const definitions = {
            'иисус': 'Иисус Христос — центральная фигура в христианстве, проповедник и сын Божий по христианскому вероучению.',
            'аллах': 'Аллах — имя Бога в исламе.',
            'будда': 'Будда (Сиддхартха Гаутама) — основатель буддизма, духовный учитель.',
            'давинчи': 'Леонардо да Винчи — итальянский художник, учёный, изобретатель эпохи Возрождения.',
            'ньютон': 'Исаак Ньютон — английский физик, математик, открывший законы движения и гравитацию.',
            'эйнштейн': 'Альберт Эйнштейн — физик-теоретик, создатель теории относительности.'
        };
        for (let key in definitions) {
            if (subject.includes(key)) {
                return definitions[key];
            }
        }
        return `Я могу поискать информацию о "${subject}" в Wikipedia. Хотите?`;
    }
    
    // === ФИЛОСОФИЯ ===
    if (q.includes('смысл жизни')) {
        return "Смысл жизни — один из самых глубоких вопросов. Философы предлагают разные ответы: счастье, служение другим, саморазвитие. Я могу найти для тебя статьи в Wikipedia по этой теме.";
    }
    
    // === ПОМОЩЬ ===
    if (q.match(/(помощь|что ты умеешь|список команд|help)/i)) {
        return "Я умею:\n• Отвечать на приветствия и вопросы о себе\n• Считать простые примеры (2+2)\n• Говорить время и дату\n• Рассказывать шутки\n• Давать советы (как стать богатым, похудеть, выучить английский)\n• Называть даты смерти известных людей (Пушкин, Лермонтов и др.)\n• Если не знаю — искать в Wikipedia.";
    }
    
    // Если ничего не подошло — возвращаем null (идём в интернет)
    return null;
}

// ----- ФУНКЦИИ ПОИСКА В ИНТЕРНЕТЕ (WIKIPEDIA) -----
async function fetchFromWikipedia(query) {
    if (!query.trim()) {
        throw new Error('Пустой запрос');
    }
    
    const searchParams = new URLSearchParams({
        action: 'query',
        list: 'search',
        srsearch: query,
        format: 'json',
        origin: '*',
        srlimit: 1,
        srprop: 'snippet'
    });
    
    const searchResponse = await fetch(`${WIKI_SEARCH_URL}?${searchParams.toString()}`);
    if (!searchResponse.ok) throw new Error('Ошибка сети при поиске');
    
    const searchData = await searchResponse.json();
    const pages = searchData.query?.search;
    
    if (!pages || pages.length === 0) {
        throw new Error('Ничего не найдено в интернете.');
    }
    
    const bestMatchTitle = pages[0].title;
    const snippet = pages[0].snippet?.replace(/<[^>]*>/g, '') || '';
    
    const encodedTitle = encodeURIComponent(bestMatchTitle);
    const summaryResponse = await fetch(`${WIKI_API_URL}${encodedTitle}`);
    
    if (!summaryResponse.ok) {
        return {
            title: bestMatchTitle,
            extract: snippet ? `Краткое описание: ${snippet}...` : 'Подробности временно недоступны.',
            pageUrl: `https://ru.wikipedia.org/wiki/${encodedTitle}`
        };
    }
    
    const summaryData = await summaryResponse.json();
    const extractText = summaryData.extract || snippet || 'Описание не найдено.';
    const pageUrl = summaryData.content_urls?.desktop?.page || `https://ru.wikipedia.org/wiki/${encodedTitle}`;
    
    return {
        title: summaryData.title || bestMatchTitle,
        extract: extractText,
        pageUrl: pageUrl
    };
}

// ----- ОТРИСОВКА ОТВЕТА (без изменений) -----
function renderAnswer(data, originalQuery, sourceType) {
    const badge = answerSourceBadge;
    if (sourceType === 'local') {
        badge.textContent = '🧠 Ответ ИИ (свои знания)';
        badge.style.background = '#e8f0fe';
        badge.style.color = '#1e5a7a';
        resultContainer.innerHTML = `
            <div class="ai-answer">
                <div class="ai-title">💡 Локальный ответ ИИ</div>
                <div class="ai-text">${escapeHtml(data.extract)}</div>
                <div class="ai-source">
                    🤖 Я ответил самостоятельно, без обращения к интернету.
                </div>
                <div style="margin-top: 12px; font-size: 0.75rem; color: #6c8eaa;">Ваш запрос: «${escapeHtml(originalQuery)}»</div>
            </div>
        `;
    } else {
        badge.textContent = '🌍 Источник: Wikipedia (интернет)';
        badge.style.background = '#eaf4e8';
        badge.style.color = '#2c6e2f';
        resultContainer.innerHTML = `
            <div class="ai-answer">
                <div class="ai-title">📖 ${escapeHtml(data.title)}</div>
                <div class="ai-text">${escapeHtml(data.extract)}</div>
                <div class="ai-source">
                    🌐 Найдено в интернете (Wikipedia)<br>
                    <a href="${escapeHtml(data.pageUrl)}" target="_blank" rel="noopener noreferrer">Читать полную статью →</a>
                </div>
                <div style="margin-top: 12px; font-size: 0.75rem; color: #6c8eaa;">🔍 Запрос: «${escapeHtml(originalQuery)}»</div>
            </div>
        `;
    }
}

function showLoading() {
    answerSourceBadge.textContent = '⏳ Думаю...';
    answerSourceBadge.style.background = '#f0e6d2';
    answerSourceBadge.style.color = '#a1662f';
    resultContainer.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <div class="loading-text">ИИ анализирует вопрос...</div>
        </div>
    `;
}

function showError(errorMsg, isLocalFallback = false) {
    if (isLocalFallback) {
        answerSourceBadge.textContent = '⚠️ Ошибка интернета → локальный ответ';
        answerSourceBadge.style.background = '#ffe6cc';
        answerSourceBadge.style.color = '#b45f1b';
        resultContainer.innerHTML = `
            <div class="error-message">
                🤖 Не удалось подключиться к интернету, но я отвечу сам:<br>
                <span style="display: block; margin-top: 10px; font-weight: normal;">${escapeHtml(errorMsg)}</span>
            </div>
        `;
    } else {
        answerSourceBadge.textContent = '❌ Ошибка';
        answerSourceBadge.style.background = '#ffe0db';
        answerSourceBadge.style.color = '#b13e2e';
        resultContainer.innerHTML = `
            <div class="error-message">
                ⚠️ Ошибка: ${escapeHtml(errorMsg)}<br>
                <span style="font-size: 0.85rem;">💡 Попробуйте другой запрос или позже.</span>
            </div>
        `;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ----- ГЛАВНАЯ ЛОГИКА -----
async function performSearch() {
    const query = queryInput.value.trim();
    if (!query) {
        showError('Пожалуйста, введите вопрос.');
        return;
    }
    
    showLoading();
    
    // 1. Проверяем локальный ответ
    const localAnswerText = getLocalAnswer(query);
    if (localAnswerText) {
        renderAnswer({ extract: localAnswerText }, query, 'local');
        return;
    }
    
    // 2. Если локально не ответил — идём в интернет (Wikipedia)
    try {
        const internetResult = await fetchFromWikipedia(query);
        renderAnswer(internetResult, query, 'internet');
    } catch (error) {
        console.error('Wikipedia error:', error);
        let fallbackMsg = `Я не смог найти информацию в интернете по запросу «${query}». Попробуйте переформулировать или задайте другой вопрос. Я могу отвечать на простые вещи: приветствия, математику, время, шутки, советы (как стать богатым), даты смерти (Пушкин и др.).`;
        if (error.message.includes('не найдено')) {
            fallbackMsg = `По запросу «${query}» ничего не найдено в Wikipedia. Но я могу ответить на многие другие вопросы сам. Попробуйте, например: "как стать богатым", "когда умер Пушкин".`;
        } else if (error.message.includes('сети')) {
            fallbackMsg = `Проблема с интернет-соединением. Работаю в офлайн-режиме: задайте простой вопрос (приветствие, математика, время, советы).`;
        }
        showError(fallbackMsg, true);
    }
}

// ----- СОБЫТИЯ -----
searchBtn.addEventListener('click', performSearch);
queryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        performSearch();
    }
});

suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
        const suggestionText = chip.getAttribute('data-query');
        if (suggestionText) {
            queryInput.value = suggestionText;
            performSearch();
        }
    });
});

console.log('Гибридный ИИ обновлён: теперь отвечает на "как стать богатым" и "когда умер Пушкин" сам, без Wikipedia');
