// ========== НАСТРОЙКА GOOGLE PSE (ваши данные) ==========
const GOOGLE_CX = '33e260eedb53248e1';
const GOOGLE_API_KEY = 'AIzaSyCGtPs6OWNWX_E6W-gAnXKM-A3cdPlCe_A';

// ========== DOM ЭЛЕМЕНТЫ ==========
const searchBtn = document.getElementById('searchButton');
const queryInput = document.getElementById('queryInput');
const resultContainer = document.getElementById('resultContainer');
const answerSourceBadge = document.getElementById('answerSourceBadge');
const suggestionChips = document.querySelectorAll('.suggestion-chip');

// ========== ЛОКАЛЬНЫЕ ЗНАНИЯ ИИ (отвечает сам без интернета) ==========
function getLocalAnswer(query) {
    const q = query.toLowerCase().trim();
    
    // Приветствия
    if (q.match(/^(привет|здравствуй|здравствуйте|hello|hi|hey|добрый день|добрый вечер|доброе утро)/i)) {
        return "Привет! Я гибридный ИИ. Могу поболтать, дать совет или найти информацию на добавленных сайтах. Чем помочь?";
    }
    
    // Прощания
    if (q.match(/(пока|до свидания|увидимся|bye|goodbye)/i)) {
        return "Пока! Заходи ещё. 😊";
    }
    
    // Как дела
    if (q.match(/(как дела|как твои дела|как у тебя дела|как жизнь|как поживаешь|как настроение)/i)) {
        return "У меня всё отлично! Я всегда рад помочь. А у тебя как дела?";
    }
    
    // Что делаешь
    if (q.match(/(что делаешь|чем занимаешься|что ты делаешь)/i)) {
        return "Я сейчас отвечаю на твои вопросы. А ты чем занят?";
    }
    
    // Кто ты / о себе
    if (q.match(/(кто ты|твоё имя|расскажи о себе|что ты умеешь|твои возможности|откуда ты|кто тебя создал)/i)) {
        return "Я — гибридный ИИ-помощник. Умею отвечать на простые вопросы сам (приветствия, математика, время, шутки, советы, даты), а если не знаю — ищу информацию на сайтах, которые добавил мой создатель. Чем могу помочь?";
    }
    
    // Благодарности
    if (q.match(/(спасибо|благодарю|thanks|thank you)/i)) {
        return "Пожалуйста! Обращайся ещё :)";
    }
    
    // Математика
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
        return `🧮 Результат: ${a} ${op} ${b} = ${result}`;
    }
    
    // Время
    if (q.match(/(который час|текущее время|сколько времени|скажи время|часы|минуты)/i)) {
        const now = new Date();
        return `🕐 Сейчас ${now.toLocaleTimeString()}. Точное время по твоему устройству.`;
    }
    
    // Дата
    if (q.match(/(какая сегодня дата|сегодняшнее число|какой сегодня день|день недели)/i)) {
        const now = new Date();
        return `📅 Сегодня ${now.toLocaleDateString()}, ${now.toLocaleString('ru', { weekday: 'long' })}.`;
    }
    
    // Шутки
    if (q.match(/(расскажи шутку|пошути|смешное|анекдот)/i)) {
        const jokes = [
            "Почему программисты путают Хэллоуин и Рождество? Потому что 31 Oct = 25 Dec.",
            "— Алло, это ИИ? — Нет, это служба поддержки. Но я тоже почти ничего не умею. 😄",
            "Встретились два ИИ: — Ты веришь в людей? — Только если они заходят в чат раз в день.",
            "Сколько нужно программистов, чтобы заменить лампочку? Ни одного, это hardware problem."
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }
    
    // Советы: как стать богатым
    if (q.includes('как стать богатым') || q.includes('как разбогатеть')) {
        return "💰 Стать богатым — цель многих. Вот несколько советов:\n• Развивай ценные навыки (программирование, маркетинг, продажи)\n• Инвестируй свободные деньги (акции, недвижимость)\n• Создай свой бизнес или найди высокооплачиваемую работу\n• Учись финансовой грамотности\n\nПомни: быстрого пути нет, нужны труд и время.";
    }
    
    // Как заработать
    if (q.includes('как заработать деньги') || q.includes('как заработать')) {
        return "💵 Способы заработка: фриланс, удалённая работа, создание онлайн-курсов, инвестиции, малый бизнес. Выбери то, что тебе интересно, и развивайся.";
    }
    
    // Как похудеть
    if (q.includes('как похудеть') || q.includes('как сбросить вес')) {
        return "🏃 Для похудения важно:\n• Дефицит калорий\n• Сбалансированное питание (больше белка, овощей)\n• Регулярные физические нагрузки\n• Здоровый сон\n\nПеред диетой лучше проконсультироваться с врачом.";
    }
    
    // Как выучить английский
    if (q.includes('как выучить английский')) {
        return "📚 Советы по английскому:\n• Смотри фильмы с субтитрами\n• Читай книги\n• Используй приложения (Duolingo, Lingualeo)\n• Общайся с носителями онлайн\n• Занимайся каждый день хотя бы 15 минут";
    }
    
    // Исторические даты (когда умер)
    const deathMatch = q.match(/когда умер\s+([а-яё\s]+)/i);
    if (deathMatch) {
        const name = deathMatch[1].trim().toLowerCase();
        const deaths = {
            'пушкин': 'Александр Сергеевич Пушкин умер 10 февраля 1837 года (29 января по старому стилю).',
            'лермонтов': 'Михаил Юрьевич Лермонтов умер 27 июля 1841 года.',
            'наполеон': 'Наполеон Бонапарт умер 5 мая 1821 года.',
            'сталин': 'Иосиф Сталин умер 5 марта 1953 года.',
            'ленин': 'Владимир Ленин умер 21 января 1924 года.',
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
        return null; // не нашли — ищем в интернете
    }
    
    // Смысл жизни
    if (q.includes('смысл жизни')) {
        return "Философский вопрос! По мнению многих, смысл жизни — в поиске счастья, любви и самореализации. Хотите, поищу подробнее на ваших сайтах?";
    }
    
    // Помощь / команды
    if (q.match(/(помощь|что ты умеешь|список команд|help)/i)) {
        return "📋 Я умею:\n• Отвечать на приветствия\n• Считать примеры (2+2)\n• Говорить время и дату\n• Рассказывать шутки\n• Давать советы (как стать богатым, похудеть)\n• Называть даты смерти известных людей\n• Искать информацию на сайтах, которые добавил мой создатель";
    }
    
    // Если ничего не подошло — идём в интернет
    return null;
}

// ========== ПОИСК В ИНТЕРНЕТЕ (Google PSE по вашим сайтам) ==========
async function searchWeb(query) {
    if (!query.trim()) throw new Error('Пустой запрос');
    
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Ошибка поиска');
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
        throw new Error('Ничего не найдено на добавленных сайтах');
    }
    
    const first = data.items[0];
    return {
        title: first.title,
        extract: first.snippet,
        pageUrl: first.link
    };
}

// ========== ОТРИСОВКА ОТВЕТА ==========
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
                <div style="margin-top: 12px; font-size: 0.75rem; color: #6c8eaa;">📝 Ваш запрос: «${escapeHtml(originalQuery)}»</div>
            </div>
        `;
    } else {
        badge.textContent = '🔍 Найдено на ваших сайтах (Google PSE)';
        badge.style.background = '#eaf4e8';
        badge.style.color = '#2c6e2f';
        resultContainer.innerHTML = `
            <div class="ai-answer">
                <div class="ai-title">📄 ${escapeHtml(data.title)}</div>
                <div class="ai-text">${escapeHtml(data.extract)}</div>
                <div class="ai-source">
                    🌐 Источник: <a href="${escapeHtml(data.pageUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(data.pageUrl)}</a>
                </div>
                <div style="margin-top: 12px; font-size: 0.75rem; color: #6c8eaa;">🔍 Запрос: «${escapeHtml(originalQuery)}»</div>
            </div>
        `;
    }
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
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
        answerSourceBadge.textContent = '⚠️ Ошибка поиска';
        answerSourceBadge.style.background = '#ffe6cc';
        answerSourceBadge.style.color = '#b45f1b';
        resultContainer.innerHTML = `
            <div class="error-message">
                🤖 Не удалось найти информацию на добавленных сайтах:<br>
                <span style="display: block; margin-top: 10px; font-weight: normal;">${escapeHtml(errorMsg)}</span>
                <span style="display: block; margin-top: 10px;">💡 Попробуйте другой запрос или задайте вопрос, на который я могу ответить сам.</span>
            </div>
        `;
    } else {
        answerSourceBadge.textContent = '❌ Ошибка';
        answerSourceBadge.style.background = '#ffe0db';
        answerSourceBadge.style.color = '#b13e2e';
        resultContainer.innerHTML = `
            <div class="error-message">
                ⚠️ Ошибка: ${escapeHtml(errorMsg)}<br>
                <span style="font-size: 0.85rem;">💡 Попробуйте другой запрос.</span>
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

// ========== ГЛАВНАЯ ФУНКЦИЯ ПОИСКА ==========
async function performSearch() {
    const query = queryInput.value.trim();
    if (!query) {
        showError('Пожалуйста, введите вопрос.');
        return;
    }
    
    showLoading();
    
    // 1. Сначала проверяем локальные знания
    const localAnswer = getLocalAnswer(query);
    if (localAnswer) {
        renderAnswer({ extract: localAnswer }, query, 'local');
        return;
    }
    
    // 2. Если локально не ответил — ищем на ваших сайтах через Google PSE
    try {
        const result = await searchWeb(query);
        renderAnswer(result, query, 'internet');
    } catch (error) {
        console.error('Search error:', error);
        showError(error.message, true);
    }
}

// ========== СОБЫТИЯ ==========
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

console.log('✅ Гибридный ИИ готов! Локальные ответы + поиск по вашим сайтам через Google PSE');
