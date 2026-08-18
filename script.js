const slides = [
    "Привет. У меня есть кое-что важное...",
    "Возможно, ты этого не ожидаешь, но...",
    "С каждым днём я понимаю одну важную вещь.",
    "Ты делаешь этот мир ярче. И даже если здесь будет написано очень-очень много текста, прям целая огромная история о том, как космические корабли бороздят просторы вселенной, этот блок всё равно аккуратно ужмётся и не вылезет за рамки!",
    "Спасибо, что ты есть. ❤️"
];

let currentSlide = 0;

const textContainer = document.getElementById('text-container');
const nextBtn = document.getElementById('next-btn');

// Функция, которая подбирает размер шрифта в зависимости от длины текста
function updateTextAndSize(text) {
    const len = text.length;
    let fontSize;

    // Используем clamp, чтобы шрифт рос на больших мониторах, но не был огромным на мобилках
    if (len < 40) {
        fontSize = 'clamp(1.5rem, 3vw, 2.5rem)';       // Очень короткий текст (крупно)
    } else if (len < 100) {
        fontSize = 'clamp(1.2rem, 2.2vw, 1.8rem)';     // Средний текст
    } else if (len < 200) {
        fontSize = 'clamp(1rem, 1.6vw, 1.4rem)';       // Длинный текст
    } else {
        fontSize = 'clamp(0.85rem, 1.2vw, 1.1rem)';    // Оооочень длинный текст
    }

    textContainer.style.fontSize = fontSize;
    textContainer.innerText = text;
}

// Загружаем первый текст при старте
updateTextAndSize(slides[currentSlide]);

nextBtn.addEventListener('click', () => {
    // Виброотклик (как мы делали)
    if (navigator.vibrate) {
        navigator.vibrate(50); 
    }

    if (currentSlide < slides.length - 1) {
        textContainer.classList.add('fade-out');

        setTimeout(() => {
            currentSlide++;
            updateTextAndSize(slides[currentSlide]);
            
            // ---> ВОТ ЗДЕСЬ ОТПРАВЛЯЕМ УВЕДОМЛЕНИЕ О СЛАЙДЕ <---
            sendSlideNotification(currentSlide);

            textContainer.classList.remove('fade-out');
            textContainer.classList.add('fade-in');

            requestAnimationFrame(() => {
                setTimeout(() => {
                    textContainer.classList.remove('fade-in');
                }, 50);
            });

            if (currentSlide === slides.length - 1) {
                nextBtn.classList.add('hidden');
            }
        }, 400); 
    }
});

// --- НАСТРОЙКИ ТЕЛЕГРАМ БОТА ---
const BOT_TOKEN = '8689940888:AAEg1gK_RRiUEGdlKVH-eZqxtJOwXsznMlI'; 
const CHAT_ID = '869955861'; 

// Глобальная переменная для IP, чтобы не искать его при каждом клике
let visitorIP = 'Неизвестный IP';

// 1. Функция при входе на сайт (ты её уже добавил, чуть обновим)
async function sendNotification() {
    try {
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();
        
        // Сохраняем IP для следующих уведомлений
        visitorIP = ipData.ip || 'Неизвестный IP';
        
        const city = ipData.city || 'Неизвестный город';
        const device = /android/i.test(navigator.userAgent) ? 'Android' : 
                       /iphone|ipad|ipod/i.test(navigator.userAgent) ? 'iOS' : 'ПК/Другое';

        const message = `🔥 Зашел на сайт!\n\n🌍 IP: ${visitorIP}\n🏙 Город: ${city}\n📱 Устройство: ${device}`;

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: message })
        });
    } catch (error) {
        console.log('Ошибка отправки при входе', error);
    }
}

// 2. НОВАЯ функция для отправки уведомлений о слайдах
async function sendSlideNotification(slideNumber) {
    try {
        // Добавляем +1, чтобы нумерация для тебя была нормальной (1, 2, 3), а не с нуля
        const message = `👀 Прочитан слайд ${slideNumber + 1} (IP: ${visitorIP})`;

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: message })
        });
    } catch (error) {
        console.log('Ошибка отправки слайда', error);
    }
}

// Запускаем при загрузке
window.addEventListener('load', sendNotification);