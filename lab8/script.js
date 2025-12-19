// ===== Асуулт ба хариултууд =====
var questions = [
    'EGOI-ийн хатан хаан хэн бэ?',
    'Хэн шилдэг вэ?',
    'Battle гэж хэн бэ?',
    'Матриц гэж хэн бэ?',
    'Яг үнэндээ хэн нь базуулсан бэ?'
];

var answers = [
    'НОМИНЭРДЭНЭ',
    'НОМИНЭРДЭНЭ',
    'ДАЛАЙЦЭРЭН',
    'БАЗАРРАГЧАА',
    'БАГАБОЛД'
];

// ===== Монгол кирилл keyboard =====
var letters = 'АБВГДЕЁЖЗИЙКЛМНОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ';

// ===== Тоглоомын хувьсагчууд =====
var currentAnswer = '';
var displayWord = [];
var wrongCount = 0;
var maxWrong = 6;

// ===== DOM =====
var questionEl = document.getElementById('question');
var wordEl = document.getElementById('word');
var keyboardEl = document.getElementById('keyboard');
var hangmanImg = document.getElementById('hangman');

document.getElementById('startBtn').onclick = startGame;

// ===== Тоглоом эхлүүлэх =====
function startGame() {
    wrongCount = 0;
    hangmanImg.src = 'images/pic1.png';
    keyboardEl.innerHTML = '';

    var index = Math.floor(Math.random() * questions.length);
    questionEl.textContent = '❓ ' + questions[index];
    currentAnswer = answers[index];

    displayWord = Array(currentAnswer.length).fill('_');
    updateWord();
    createKeyboard();
}

// ===== Үгийг шинэчлэх =====
function updateWord() {
    wordEl.textContent = displayWord.join(' ');
}

// ===== Keyboard үүсгэх =====
function createKeyboard() {
    for (var letter of letters) {
        var btn = document.createElement('button');
        btn.textContent = letter;
        btn.onclick = function () {
            guessLetter(this.textContent);
        };
        keyboardEl.appendChild(btn);
    }
}

// ===== Үсэг таах (ДАРААЛЛААР) =====
function guessLetter(letter) {
    // дараагийн нээгдэх ёстой индекс
    var nextIndex = displayWord.indexOf('_');

    // бүгд нээгдсэн бол юу ч хийхгүй
    if (nextIndex === -1) return;

    // зөвхөн дараагийн үсэг зөв бол нээнэ
    if (currentAnswer[nextIndex] === letter) {
        displayWord[nextIndex] = letter;
    } else {
        wrongCount++;
        hangmanImg.src = 'images/pic' + (wrongCount + 1) + '.png';
    }

    updateWord();
    checkGameStatus();
}

// ===== Ялах / Ялагдах шалгах =====
function checkGameStatus() {
    if (!displayWord.includes('_')) {
        setTimeout(() => {
            alert('🎉 ЯЛЛАА! Чи жинхэнэ домог!');
        }, 100);
    }

    if (wrongCount >= maxWrong) {
        setTimeout(() => {
            alert('💀 ЯЛАГДЛАА!\nЗөв хариулт: ' + currentAnswer);
        }, 100);
    }
}
