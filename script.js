// ========== DUCKDUCKGO ПОИСК (без API-ключа) ==========
const CORS_PROXY = 'https://corsproxy.io/?';
const DDG_API_URL = 'https://api.duckduckgo.com/';

// ========== DOM ЭЛЕМЕНТЫ ==========
const searchBtn = document.getElementById('searchButton');
const queryInput = document.getElementById('queryInput');
const resultContainer = document.getElementById('resultContainer');
const answerSourceBadge = document.getElementById('answerSourceBadge');
const suggestionChips = document.querySelectorAll('.suggestion-chip');

// ========== ЛОКАЛЬНЫЕ ЗНАНИЯ ИИ ==========
function getLocalAnswer(query) {
    const q = query.toLowerCase().trim();
    
    if (q.match(/^(привет|здравствуй|hello|hi)/i)) {
        return "Привет! Я ИИ-помощник. Могу ответить сам или найти в интернете через DuckDuckGo. Чем помочь?";
    }
    if (q.match(/(как дела|как жизнь)/i)) {
        return "У меня всё отлично! А у тебя как?";
    }
    if (q.match(/(кто ты|что ты умеешь)/i)) {
        return "Я — ИИ-помощник. Отвечаю на простые вопросы сам, а сложные ищу в интернете через DuckDuckGo.";
    }
    if (q.match(/(спасибо|благодарю)/i)) {
        return "Пожалуйста! Обращайся ещё :)";
    }
    
    const mathMatch = q.match(/(\d+)\s*([+\-*/])\s*(\d+)/i);
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
    
    if (q.match(/(который час|сколько времени)/i)) {
        return `Сейчас ${new Date().toLocaleTimeString()}`;
    }
    
    if (q.match(/(расскажи шутку|пошути)/i)) {
        const jokes = [
            "Почему программисты путают Хэллоуин и Рождество? Потому что 31 Oct = 25 Dec.",
            "Сколько программистов нужно, чтобы заменить лампочку? Ни одного — это hardware problem."
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }
    
    if (q.includes('как стать богатым')) {
        return "💰 Советы: развивай навыки, инвестируй, создавай бизнес, учись финансовой грамотности.";
    }
    
    const deathMatch = q.match(/когда умер\s+([а-яё]+)/i);
    if (deathMatch) {
        const name = deathMatch[1].toLowerCase();
        const deaths = {
            'пушкин': 'Александр Пушкин умер 10 февраля 1837 года',
            'лермонтов': 'Михаил Лермонтов умер 27 июля 1841 года',
            'наполеон': 'Наполеон Бонапарт умер 5 мая 1821 года'
        };
        if (deaths[name]) return deaths[name];
    }
    
    return null;
}

// ========== ПОИСК ЧЕРЕЗ DUCKDUCKGO ==========
async function searchWeb(query) {
    const url = `${DDG_API_URL}?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    
    const response = await fetch(CORS_PROXY + encodeURIComponent(url));
    
    if (!response.ok) throw new Error('Ошибка поиска');
    
    const data = await response.json();
    
    let extract = data.AbstractText || data.Answer || data.Definition;
    let title = data.Heading || data.AbstractSource || 'Результат';
    let pageUrl = data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    
    if (!extract && data.RelatedTopics?.length > 0) {
        extract = data.RelatedTopics[0].Text;
        pageUrl = data.RelatedTopics[0].FirstURL || pageUrl;
    }
    
    if (!extract) throw new Error('Ничего не найдено');
    
    return { title, extract, pageUrl };
}

// ========== ОТРИСОВКА ==========
function renderAnswer(data, query, sourceType) {
    if (sourceType === 'local') {
        answerSourceBadge.textContent = '🧠 Локальный ответ';
        answerSourceBadge.style.background = '#e8f0fe';
        resultContainer.innerHTML = `<div class="ai-answer"><div class="ai-text">${escapeHtml(data.extract)}</div></div>`;
    } else {
        answerSourceBadge.textContent = '🦆 DuckDuckGo';
        answerSourceBadge.style.background = '#eaf4e8';
        resultContainer.innerHTML = `
            <div class="ai-answer">
                <div class="ai-title">${escapeHtml(data.title)}</div>
                <div class="ai-text">${escapeHtml(data.extract)}</div>
                <div class="ai-source"><a href="${escapeHtml(data.pageUrl)}" target="_blank">Источник →</a></div>
            </div>
        `;
    }
}

function showLoading() {
    answerSourceBadge.textContent = '⏳ Поиск...';
    resultContainer.innerHTML = `<div class="loading-spinner"><div class="spinner"></div><div>Ищет в DuckDuckGo...</div></div>`;
}

function showError(msg) {
    answerSourceBadge.textContent = '❌ Ошибка';
    resultContainer.innerHTML = `<div class="error-message">⚠️ ${escapeHtml(msg)}</div>`;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== ГЛАВНАЯ ФУНКЦИЯ ==========
async function performSearch() {
    const query = queryInput.value.trim();
    if (!query) return showError('Введите вопрос');
    
    showLoading();
    
    const localAnswer = getLocalAnswer(query);
    if (localAnswer) {
        renderAnswer({ extract: localAnswer }, query, 'local');
        return;
    }
    
    try {
        const result = await searchWeb(query);
        renderAnswer(result, query, 'internet');
    } catch (error) {
        showError(error.message);
    }
}

// ========== СОБЫТИЯ ==========
searchBtn.addEventListener('click', performSearch);
queryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) performSearch();
});
suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
        queryInput.value = chip.dataset.query;
        performSearch();
    });
});

console.log('✅ ИИ готов, используется DuckDuckGo (без API-ключа)');
