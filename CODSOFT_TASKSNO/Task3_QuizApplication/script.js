/**
 * ============================================================================
 * Task 4: Interactive Computer Science Quiz Application
 * CodSoft Web Development Internship
 * 
 * Features:
 * - 10 Comprehensive CS Questions covering Core Domains
 * - Question & Option Randomization (Fisher-Yates shuffle)
 * - 30-Second Countdown Timer per Question with Auto-advance
 * - Real-time Progress Bar & Instant Visual Feedback
 * - Detailed Performance Scorecard & Retake Functionality
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Master Question Bank covering the required 10 topics
  const masterQuestions = [
    {
      topic: 'Programming Paradigm',
      question: 'Which programming paradigm organizes software design around data or objects rather than functions and logic?',
      options: [
        'Object-Oriented Programming (OOP)',
        'Functional Programming',
        'Procedural Programming',
        'Declarative Programming'
      ],
      correctAnswer: 0
    },
    {
      topic: 'Java',
      question: 'Which component in the Java architecture executes bytecode and translates it into native machine code at runtime?',
      options: [
        'JVM (Java Virtual Machine)',
        'JDK (Java Development Kit)',
        'javac (Java Compiler)',
        'JRE ClassLoader'
      ],
      correctAnswer: 0
    },
    {
      topic: 'C++',
      question: 'In C++, which operator/keyword is specifically used to allocate memory dynamically on the heap?',
      options: [
        'new',
        'malloc',
        'create',
        'alloc'
      ],
      correctAnswer: 0
    },
    {
      topic: 'Python',
      question: 'Which of the following built-in collection types in Python is MUTABLE and defined using square brackets `[]`?',
      options: [
        'List',
        'Tuple',
        'String',
        'FrozenSet'
      ],
      correctAnswer: 0
    },
    {
      topic: 'Data Structures',
      question: 'Which linear data structure strictly operates on the LIFO (Last-In, First-Out) mechanism?',
      options: [
        'Stack',
        'Queue',
        'Linked List',
        'Priority Queue'
      ],
      correctAnswer: 0
    },
    {
      topic: 'Algorithms',
      question: 'What is the average time complexity of the Quick Sort algorithm on an array of size n?',
      options: [
        'O(n log n)',
        'O(n²)',
        'O(n)',
        'O(log n)'
      ],
      correctAnswer: 0
    },
    {
      topic: 'Operating Systems',
      question: 'Which of the following conditions is NOT a prerequisite for a resource deadlock to occur in an OS?',
      options: [
        'Preemption',
        'Mutual Exclusion',
        'Hold and Wait',
        'Circular Wait'
      ],
      correctAnswer: 0
    },
    {
      topic: 'DBMS',
      question: 'In relational database theory, which constraint uniquely identifies each record and strictly forbids NULL values?',
      options: [
        'PRIMARY KEY',
        'FOREIGN KEY',
        'UNIQUE Constraint',
        'CHECK Constraint'
      ],
      correctAnswer: 0
    },
    {
      topic: 'Computer Networks',
      question: 'Which protocol is responsible for resolving human-readable domain names (such as codsoft.in) into numeric IP addresses?',
      options: [
        'DNS (Domain Name System)',
        'DHCP',
        'ARP',
        'FTP'
      ],
      correctAnswer: 0
    },
    {
      topic: 'Web Tech (HTML/CSS/JS)',
      question: 'Which modern DOM method allows attaching multiple distinct event listeners to a target element without replacing existing ones?',
      options: [
        'addEventListener()',
        'attachEvent()',
        'setEventListener()',
        'onclick = function()'
      ],
      correctAnswer: 0
    }
  ];

  // Screen Panels
  const startScreen = document.getElementById('startScreen');
  const questionScreen = document.getElementById('questionScreen');
  const resultScreen = document.getElementById('resultScreen');

  // Interactive Buttons
  const startBtn = document.getElementById('startBtn');
  const nextBtn = document.getElementById('nextBtn');
  const restartBtn = document.getElementById('restartBtn');

  // Quiz Interface Elements
  const questionNumber = document.getElementById('questionNumber');
  const questionCategory = document.getElementById('questionCategory');
  const timerSeconds = document.getElementById('timerSeconds');
  const timerBox = document.getElementById('timerBox');
  const progressFill = document.getElementById('progressFill');
  const questionText = document.getElementById('questionText');
  const optionsContainer = document.getElementById('optionsContainer');
  const feedbackMsg = document.getElementById('feedbackMsg');
  const quizHint = document.getElementById('quizHint');

  // Result Elements
  const resIcon = document.getElementById('resIcon');
  const resTitle = document.getElementById('resTitle');
  const resSubtitle = document.getElementById('resSubtitle');
  const resScore = document.getElementById('resScore');
  const resPercent = document.getElementById('resPercent');
  const resCorrect = document.getElementById('resCorrect');
  const resWrong = document.getElementById('resWrong');
  const resAccuracy = document.getElementById('resAccuracy');
  const resRemarks = document.getElementById('resRemarks');

  // Quiz Runtime State
  let activeQuestions = [];
  let currentQuestionIndex = 0;
  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let answered = false;
  let timerInterval = null;
  const TIME_PER_QUESTION = 30; // 30 seconds
  let timeLeft = TIME_PER_QUESTION;

  /**
   * Fisher-Yates Array Shuffle algorithm
   */
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Prepares and starts a fresh quiz session
   */
  function startQuiz() {
    // Clone and shuffle questions
    activeQuestions = shuffleArray(masterQuestions).map(q => {
      // Also shuffle options while preserving the correct answer string
      const originalCorrectOption = q.options[q.correctAnswer];
      const shuffledOptions = shuffleArray(q.options);
      const newCorrectIndex = shuffledOptions.indexOf(originalCorrectOption);
      return {
        ...q,
        options: shuffledOptions,
        correctAnswer: newCorrectIndex
      };
    });

    currentQuestionIndex = 0;
    score = 0;
    correctCount = 0;
    wrongCount = 0;

    startScreen.classList.remove('active');
    resultScreen.classList.remove('active');
    questionScreen.classList.add('active');

    loadQuestion();
  }

  /**
   * Loads the current question onto the DOM
   */
  function loadQuestion() {
    clearInterval(timerInterval);
    answered = false;
    timeLeft = TIME_PER_QUESTION;

    const currentQ = activeQuestions[currentQuestionIndex];
    const totalQ = activeQuestions.length;

    // Update Header Trackers
    questionNumber.textContent = `Question ${currentQuestionIndex + 1} of ${totalQ}`;
    questionCategory.textContent = currentQ.topic;
    questionText.textContent = currentQ.question;

    // Reset button states
    nextBtn.disabled = true;
    nextBtn.textContent = (currentQuestionIndex === totalQ - 1) ? 'View Results 🏁' : 'Next Question →';
    quizHint.textContent = 'Select an option to enable the next button';
    feedbackMsg.textContent = '';
    feedbackMsg.className = 'feedback-msg';

    // Update Progress Bar
    const progressPercent = ((currentQuestionIndex + 1) / totalQ) * 100;
    progressFill.style.width = `${progressPercent}%`;

    // Render Options
    optionsContainer.innerHTML = '';
    const optionLetters = ['A', 'B', 'C', 'D'];

    currentQ.options.forEach((optText, idx) => {
      const optBtn = document.createElement('button');
      optBtn.type = 'button';
      optBtn.className = 'option-btn';
      optBtn.setAttribute('data-index', idx);

      optBtn.innerHTML = `
        <span class="option-letter">${optionLetters[idx]}</span>
        <span class="option-text">${optText}</span>
        <span class="option-status-icon"></span>
      `;

      optBtn.addEventListener('click', () => handleOptionSelection(idx));
      optionsContainer.appendChild(optBtn);
    });

    // Start Timer
    startTimer();
  }

  /**
   * Handles user timer countdown
   */
  function startTimer() {
    timerSeconds.textContent = timeLeft;
    timerBox.classList.remove('urgent');

    timerInterval = setInterval(() => {
      timeLeft--;
      timerSeconds.textContent = timeLeft;

      if (timeLeft <= 10) {
        timerBox.classList.add('urgent');
      }

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        handleTimeout();
      }
    }, 1000);
  }

  /**
   * Handles case when timer reaches 0
   */
  function handleTimeout() {
    if (answered) return;
    answered = true;
    wrongCount++;

    const currentQ = activeQuestions[currentQuestionIndex];
    const optionButtons = optionsContainer.querySelectorAll('.option-btn');

    // Disable all options
    optionButtons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === currentQ.correctAnswer) {
        btn.classList.add('correct');
        btn.querySelector('.option-status-icon').textContent = '✓';
      }
    });

    feedbackMsg.className = 'feedback-msg timeout';
    feedbackMsg.textContent = '⏱️ Time expired! The correct answer is highlighted in green.';
    quizHint.textContent = 'Click below to advance to the next question';

    nextBtn.disabled = false;
  }

  /**
   * Handles user clicking an option
   */
  function handleOptionSelection(selectedIndex) {
    if (answered) return;
    answered = true;
    clearInterval(timerInterval);

    const currentQ = activeQuestions[currentQuestionIndex];
    const optionButtons = optionsContainer.querySelectorAll('.option-btn');
    const isCorrect = (selectedIndex === currentQ.correctAnswer);

    // Disable all options to prevent multiple submissions
    optionButtons.forEach((btn, idx) => {
      btn.disabled = true;

      if (idx === currentQ.correctAnswer) {
        btn.classList.add('correct');
        btn.querySelector('.option-status-icon').textContent = '✓';
      } else if (idx === selectedIndex && !isCorrect) {
        btn.classList.add('wrong');
        btn.querySelector('.option-status-icon').textContent = '✗';
      }
    });

    if (isCorrect) {
      score++;
      correctCount++;
      feedbackMsg.className = 'feedback-msg correct';
      feedbackMsg.textContent = '🎉 Correct Answer! Excellent job.';
    } else {
      wrongCount++;
      feedbackMsg.className = 'feedback-msg wrong';
      feedbackMsg.textContent = '❌ Incorrect. The correct option is highlighted in green.';
    }

    quizHint.textContent = 'Ready to move to next question';
    nextBtn.disabled = false;
  }

  /**
   * Advance to next question or show results
   */
  nextBtn.addEventListener('click', () => {
    if (!answered) return;

    currentQuestionIndex++;
    if (currentQuestionIndex < activeQuestions.length) {
      loadQuestion();
    } else {
      showResults();
    }
  });

  /**
   * Display Final Scorecard
   */
  function showResults() {
    clearInterval(timerInterval);

    questionScreen.classList.remove('active');
    resultScreen.classList.add('active');

    const totalQuestions = activeQuestions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    resScore.textContent = `${correctCount} / ${totalQuestions}`;
    resPercent.textContent = `${percentage}% Final Score`;
    resCorrect.textContent = correctCount;
    resWrong.textContent = wrongCount;
    resAccuracy.textContent = `${percentage}%`;

    // Dynamic Result Badging and Message
    if (percentage >= 90) {
      resIcon.textContent = '🏆';
      resTitle.textContent = 'Exceptional Mastery!';
      resSubtitle.textContent = 'You demonstrated an outstanding grasp of computer science and software concepts.';
      resRemarks.innerHTML = `<strong>Grade: A+ (Outstanding)</strong> — Ready for technical evaluations and coding interviews!`;
    } else if (percentage >= 70) {
      resIcon.textContent = '🌟';
      resTitle.textContent = 'Great Job!';
      resSubtitle.textContent = 'You have a solid conceptual foundation across programming and systems.';
      resRemarks.innerHTML = `<strong>Grade: B/A (Proficient)</strong> — A little revision on missed topics will make your knowledge top-tier!`;
    } else if (percentage >= 50) {
      resIcon.textContent = '👍';
      resTitle.textContent = 'Good Effort!';
      resSubtitle.textContent = 'You passed the benchmark, but reviewing core theory will boost your score.';
      resRemarks.innerHTML = `<strong>Grade: C/D (Passing)</strong> — Focus on areas like OS, DBMS and Algorithms to improve accuracy.`;
    } else {
      resIcon.textContent = '📚';
      resTitle.textContent = 'Keep Learning & Practicing!';
      resSubtitle.textContent = 'Do not get discouraged — revisiting fundamental topics will sharpen your skills.';
      resRemarks.innerHTML = `<strong>Grade: Needs Review</strong> — Try retaking the quiz after brushing up on computer science fundamentals.`;
    }
  }

  // Event Listeners for Quiz Flow
  startBtn.addEventListener('click', startQuiz);
  restartBtn.addEventListener('click', startQuiz);
});
