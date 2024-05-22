document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const welcomeContainer = document.getElementById('welcome-container');
    const quizContainer = document.getElementById('quiz-container');
    const resultContainer = document.getElementById('result-container');
    const questionElement = document.getElementById('question');
    const choicesElement = document.getElementById('choices');
    const timerElement = document.getElementById('timer');
    const progressElement = document.getElementById('progress');
    const scoreElement = document.getElementById('score');
    const detailedResultsElement = document.getElementById('detailed-results');
    const restartButton = document.getElementById('restart-button');
    const nextButton = document.getElementById('next-button');
    const backgroundSound = document.getElementById('background-sound');

    let currentQuestionIndex = 0;
    let score = 0;
    let questions = [];
    let userAnswers = [];
    let timer;
    let timerCount;

    startButton.addEventListener('click', startQuiz);
    restartButton.addEventListener('click', startQuiz);

    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            questions = data;
            console.log('Questions loaded:', questions); // Debugging line
        })
        .catch(error => console.error('Error fetching questions:', error));

    function startQuiz() {
        welcomeContainer.classList.add('hide');
        resultContainer.classList.add('hide');
        quizContainer.classList.remove('hide');
        backgroundSound.play();
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];
        selectRandomQuestions();
        showQuestion();
    }

    function selectRandomQuestions() {
        questions = questions.sort(() => 0.5 - Math.random()).slice(0, 10);
        console.log('Selected questions:', questions); // Debugging line
    }

    function showQuestion() {
        resetState();
        const currentQuestion = questions[currentQuestionIndex];
        questionElement.textContent = `What is the capital of ${currentQuestion.country}? ${currentQuestion.flag}`;
        choicesElement.innerHTML = '<option value="" disabled selected>Select the capital city</option>';
        currentQuestion.choices.forEach(choice => {
            const option = document.createElement('option');
            option.value = choice;
            option.textContent = choice;
            choicesElement.appendChild(option);
        });
        startTimer();
        progressElement.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    }

    function resetState() {
        clearInterval(timer);
        timerElement.textContent = '';
        nextButton.classList.add('hide');
        choicesElement.disabled = false;
    }

    function startTimer() {
        timerCount = 20;
        timerElement.textContent = `Time left: ${timerCount}s`;
        timer = setInterval(() => {
            timerCount--;
            timerElement.textContent = `Time left: ${timerCount}s`;
            if (timerCount <= 0) {
                clearInterval(timer);
                handleTimeOut();
            }
        }, 1000);
    }

    function handleTimeOut() {
        choicesElement.disabled = true;
        userAnswers.push({
            question: questions[currentQuestionIndex].country,
            selectedAnswer: 'Timed out',
            correctAnswer: questions[currentQuestionIndex].correct,
            isCorrect: false
        });
        nextButton.classList.remove('hide');
    }

    choicesElement.addEventListener('change', (e) => {
        clearInterval(timer);
        const selectedAnswer = e.target.value;
        const isCorrect = selectedAnswer === questions[currentQuestionIndex].correct;
        userAnswers.push({
            question: questions[currentQuestionIndex].country,
            selectedAnswer: selectedAnswer,
            correctAnswer: questions[currentQuestionIndex].correct,
            isCorrect: isCorrect
        });
        if (isCorrect) {
            score++;
        }
        choicesElement.disabled = true;
        nextButton.classList.remove('hide');
    });

    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            showScore();
        }
    });

    function showScore() {
        clearInterval(timer);
        backgroundSound.pause();
        backgroundSound.currentTime = 0;
        quizContainer.classList.add('hide');
        resultContainer.classList.remove('hide');
        scoreElement.textContent = `Your score: ${score} / ${questions.length}`;
        detailedResultsElement.innerHTML = '';

        userAnswers.forEach(answer => {
            const card = document.createElement('div');
            card.classList.add('result-card');
            card.classList.add(answer.isCorrect ? 'correct' : 'incorrect');
            card.innerHTML = `
                <p><strong>Country:</strong> ${answer.question}</p>
                <p><strong>Your Answer:</strong> ${answer.selectedAnswer}</p>
                <p><strong>Correct Answer:</strong> ${answer.correctAnswer}</p>
            `;
            detailedResultsElement.appendChild(card);
        });
    }
});
