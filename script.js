document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const sections = document.querySelectorAll('.navigable-item');
    const progressBar = document.getElementById('progress-bar');
    const sectionIndicator = document.getElementById('section-indicator');

    // Define tracker link placeholders
    const trackerLinks = {
        'attendance-tracker-link': 'https://docs.google.com/spreadsheets/d/your-attendance-tracker-id',
        'point-system-link': 'https://docs.google.com/spreadsheets/d/your-point-system-tracker-id',
        'late-fee-link': 'https://docs.google.com/spreadsheets/d/your-late-fee-tracker-id'
    };

    // Initialize variables
    let currentSectionIndex = 0;
    const totalSections = sections.length;
    const quizSections = {
        1: 'quiz-1',
        2: 'quiz-2', 
        3: 'quiz-3',
        5: 'quiz-4',
        7: 'quiz-5',
        8: 'quiz-6'
    };
    
    // Define correct answers for each quiz
    const quizAnswers = {
        1: { q1: 'b', q2: 'c' },
        2: { q1: 'c', q2: 'b', q3: 'c' },
        3: { q1: 'b', q2: 'b', q3: 'b' },
        4: { q1: 'b', q2: 'c' },
        5: { q1: 'b', q2: 'b', q3: 'b' },
        6: { q1: 'b', q2: 'b', q3: 'b' }
    };

    const completedQuizzes = {};

    // Core UI update function
    function updateUI() {
        // Show/Hide sections
        sections.forEach((section, index) => {
            section.classList.toggle('active', index === currentSectionIndex);
        });

        // Update Progress Bar
        const progressPercentage = totalSections > 0 ? ((currentSectionIndex + 1) / totalSections) * 100 : 0;
        progressBar.style.width = `${progressPercentage}%`;

        // Update Section Indicator
        sectionIndicator.textContent = `Page ${currentSectionIndex + 1} of ${totalSections}`;

        // Update Button States
        prevButton.disabled = currentSectionIndex === 0;
        if (currentSectionIndex === totalSections - 1) {
            nextButton.textContent = 'Finish ✓';
            nextButton.classList.add('bg-green-600');
            nextButton.classList.add('hover:bg-green-700');
        } else {
            nextButton.textContent = 'Next';
            nextButton.classList.remove('bg-green-600');
            nextButton.classList.remove('hover:bg-green-700');
        }
        nextButton.disabled = currentSectionIndex === totalSections - 1;
    }

    // Development mode - set to true to bypass quizzes
    const bypassQuizzes = true;

    // Navigation Event Listeners
    nextButton.addEventListener('click', () => {
        // Get quiz ID for current section (if exists)
        const quizId = quizSections[currentSectionIndex];
        
        if (quizId && !bypassQuizzes && !completedQuizzes[quizId]) {
            // If there's a quiz for this section and it's not completed, show the quiz
            sections[currentSectionIndex].classList.remove('active');
            document.getElementById(quizId).classList.add('active');
        } else if (currentSectionIndex < totalSections - 1) {
            // Move to next section
            currentSectionIndex++;
            updateUI();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentSectionIndex > 0) {
            // Check if we're on a quiz
            const activeQuiz = document.querySelector('.quiz-container.active');
            if (activeQuiz) {
                // Go back to the section instead of previous section
                activeQuiz.classList.remove('active');
                sections[currentSectionIndex].classList.add('active');
            } else {
                currentSectionIndex--;
                updateUI();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });

    // Quiz Handling Setup
    setupQuizzes();

    // Setup tracker links
    setupTrackerLinks();

    // Initialize UI
    updateUI();

    // Functions
    function setupQuizzes() {
        // Get all quiz forms
        document.querySelectorAll('[id^="quiz-form-"]').forEach(form => {
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                
                // Extract quiz number from ID (e.g., quiz-form-1 -> 1)
                const quizNum = parseInt(this.id.replace('quiz-form-', ''));
                const resultDiv = document.getElementById(`quiz-result-${quizNum}`);
                const correctAnswers = quizAnswers[quizNum];
                
                // Check answers
                const formData = new FormData(this);
                let score = 0;
                let resultsHTML = '<div class="p-3 bg-blue-50 rounded-t border-b border-blue-200">';
                resultsHTML += '<h4 class="font-semibold text-blue-800 flex items-center"><i class="fas fa-clipboard-check mr-2"></i>Quiz Results</h4></div>';
                resultsHTML += '<div class="p-3"><ul class="space-y-2">';
                
                const totalQuestions = Object.keys(correctAnswers).length;
                
                // Process each question
                for (const [question, correctAnswer] of Object.entries(correctAnswers)) {
                    const userAnswer = formData.get(question);
                    const questionNum = question.substring(1); // Remove 'q' prefix
                    
                    if (userAnswer === correctAnswer) {
                        score++;
                        resultsHTML += `<li class="text-green-700 flex items-start">
                            <i class="fas fa-check-circle mt-1 mr-2"></i>
                            <span>Question ${questionNum}: <span class="font-medium">Correct!</span></span>
                        </li>`;
                    } else {
                        resultsHTML += `<li class="text-red-700 flex items-start">
                            <i class="fas fa-times-circle mt-1 mr-2"></i>
                            <span>Question ${questionNum}: <span class="font-medium">Incorrect.</span> 
                            Please review this material.</span>
                        </li>`;
                    }
                }
                
                // Display score
                const scorePercentage = Math.round((score / totalQuestions) * 100);
                const isPassing = scorePercentage >= 70;
                
                resultsHTML += `</ul><div class="mt-4 p-3 rounded ${isPassing ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                    <p class="font-bold flex items-center">
                        <i class="fas ${isPassing ? 'fa-trophy' : 'fa-exclamation-triangle'} mr-2"></i>
                        You scored ${score}/${totalQuestions} (${scorePercentage}%)
                    </p>
                    <p class="mt-1 text-sm">${isPassing ? 
                        'Great job! You can continue to the next section.' : 
                        'Please review the material and try again.'}</p>
                </div>`;
                
                // Add continue button if passed
                if (isPassing || bypassQuizzes) {
                    completedQuizzes[`quiz-${quizNum}`] = true;
                    
                    resultsHTML += `<div class="mt-4 text-center">
                        <button id="continue-btn-${quizNum}" class="px-6 py-2 bg-green-600 text-white rounded shadow-md 
                        hover:bg-green-700 hover:shadow-lg transition-all duration-300 flex items-center mx-auto">
                            <i class="fas fa-arrow-right mr-2"></i> Continue
                        </button>
                    </div>`;
                }
                
                // Update result display
                resultDiv.innerHTML = resultsHTML;
                resultDiv.classList.remove('hidden');
                
                // Add event listener to continue button if it exists
                const continueBtn = document.getElementById(`continue-btn-${quizNum}`);
                if (continueBtn) {
                    continueBtn.addEventListener('click', () => {
                        // Hide the quiz
                        document.getElementById(`quiz-${quizNum}`).classList.remove('active');
                        
                        // Move to the next section if possible
                        if (currentSectionIndex < totalSections - 1) {
                            currentSectionIndex++;
                            updateUI();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                            // Show current section again
                            sections[currentSectionIndex].classList.add('active');
                        }
                    });
                }
            });
        });
    }

    function setupTrackerLinks() {
        // Add click handlers for tracker links
        Object.keys(trackerLinks).forEach(id => {
            const link = document.getElementById(id);
            if (link) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    // In a real implementation, this would redirect to the actual tracker
                    // For demo purposes, we'll show an alert
                    alert(`This would link to the ${id.split('-')[0]} tracker. In the final version, replace with your actual Google Sheet URL.`);
                });
            }
        });
    }

    // Add visual feedback for quiz options
    document.querySelectorAll('.quiz-option').forEach(option => {
        const radio = option.querySelector('input[type="radio"]');
        radio.addEventListener('change', () => {
            // Reset all options in this question group
            const name = radio.getAttribute('name');
            document.querySelectorAll(`input[name="${name}"]`).forEach(input => {
                const parentOption = input.closest('.quiz-option');
                if (parentOption) {
                    parentOption.classList.remove('bg-blue-50', 'border', 'border-blue-300');
                }
            });
            
            // Highlight selected option
            if (radio.checked) {
                option.classList.add('bg-blue-50', 'border', 'border-blue-300');
            }
        });
    });

    // Add hover effect for cards
    document.querySelectorAll('.card, .role-card, .specialty-card, .development-card, .comm-card, .practices-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});