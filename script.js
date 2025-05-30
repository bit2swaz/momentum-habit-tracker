let habits = [];
let currentWeekStart = new Date();
let mockToday = null;

function getEffectiveToday() {
    const d = mockToday ? new Date(mockToday) : new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

function getEffectiveYesterday() {
    const today = getEffectiveToday();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return yesterday;
}

function loadHabits() {
    const storedHabits = localStorage.getItem('habits');
    if (storedHabits) {
        try {
            habits = JSON.parse(storedHabits);
        } catch (e) {
            console.error('Error parsing habits from localStorage:', e);
            habits = [];
        }
    }
}

function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getMondayOfWeek(date) {
    const d = new Date(date);
    const dayOfWeek = d.getDay();
    const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function renderDates() {
    const gridHeader = document.querySelector('.grid-header');
    while (gridHeader.children.length > 1) {
        gridHeader.removeChild(gridHeader.lastChild);
    }

    const weekStart = new Date(currentWeekStart);
    const today = getEffectiveToday();

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        weekDates.push(date);
    }

    weekDates.forEach(date => {
        const dateColumn = document.createElement('div');
        dateColumn.classList.add('date-column');
        dateColumn.dataset.fullDate = formatDate(date);

        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', options);
        const yearTwoDigit = date.getFullYear().toString().slice(-2);

        dateColumn.textContent = `${formattedDate}, '${yearTwoDigit}`;

        if (date.toDateString() === today.toDateString()) {
            dateColumn.classList.add('today-column');
        }
        gridHeader.appendChild(dateColumn);
    });
}

function showCongratulationMessage() {
    let messageContainer = document.getElementById('congratulationsMessage');
    let overlay = document.getElementById('overlay');

    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'congratulationsMessage';
        messageContainer.classList.add('congratulations-message');
        document.body.appendChild(messageContainer);
    }

    const messages = [
        "Awesome work!", "You're crushing it!", "Keep the momentum!",
        "Great job!", "Another one down!", "Way to go!",
        "You're building momentum!", "Fantastic effort!", "Keep up the great work!",
        "Success!", "Nailed it!"
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    messageContainer.textContent = randomMessage;
    
    overlay.style.opacity = '1';
    overlay.style.visibility = 'visible';
    messageContainer.style.opacity = '1';
    messageContainer.style.visibility = 'visible';
    messageContainer.style.transform = 'translate(-50%, -50%) scale(1)';

    document.body.classList.add('disable-interactions');

    setTimeout(() => {
        messageContainer.style.opacity = '0';
        messageContainer.style.transform = 'translate(-50%, -50%) scale(0.8)';
        messageContainer.style.visibility = 'hidden';

        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';

        setTimeout(() => {
            document.body.classList.remove('disable-interactions');
        }, 500);
    }, 1500);
}

function showCustomMessageBox(message, isConfirmation = false) {
    return new Promise(resolve => {
        const messageBox = document.getElementById('customMessageBox');
        const messageBoxText = document.getElementById('messageBoxText');
        const overlay = document.getElementById('overlay');

        messageBox.innerHTML = '';
        messageBox.appendChild(messageBoxText);

        messageBoxText.textContent = message;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('message-box-buttons');

        const closeBtn = document.createElement('button');
        closeBtn.id = 'messageBoxCloseBtn';
        closeBtn.textContent = isConfirmation ? 'Cancel' : 'OK';
        closeBtn.classList.add('message-box-button');
        buttonContainer.appendChild(closeBtn);

        let confirmBtn;
        if (isConfirmation) {
            confirmBtn = document.createElement('button');
            confirmBtn.id = 'messageBoxConfirmBtn';
            confirmBtn.textContent = 'Confirm';
            confirmBtn.classList.add('message-box-button', 'confirm-button');
            buttonContainer.appendChild(confirmBtn);
        }

        messageBox.appendChild(buttonContainer);

        overlay.style.opacity = '1';
        overlay.style.visibility = 'visible';
        messageBox.classList.add('active');
        
        document.body.classList.add('disable-interactions');

        const closeHandler = () => {
            messageBox.classList.remove('active');
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
            document.body.classList.remove('disable-interactions');
            closeBtn.removeEventListener('click', closeHandler);
            if (confirmBtn) confirmBtn.removeEventListener('click', confirmHandler);
            resolve(false);
        };

        const confirmHandler = () => {
            messageBox.classList.remove('active');
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
            document.body.classList.remove('disable-interactions');
            closeBtn.removeEventListener('click', closeHandler);
            if (confirmBtn) confirmBtn.removeEventListener('click', confirmHandler);
            resolve(true);
        };

        closeBtn.addEventListener('click', closeHandler);
        if (isConfirmation) {
            confirmBtn.addEventListener('click', confirmHandler);
        }
    });
}

function editHabit(habitId, currentNameDiv) {
    const targetHabit = habits.find(h => h.id === habitId);
    if (!targetHabit) return;

    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = targetHabit.name;
    inputField.classList.add('edit-habit-input');
    inputField.maxLength = 50;

    // Store the original content before replacing
    const originalContent = currentNameDiv.innerHTML; 

    currentNameDiv.innerHTML = '';
    currentNameDiv.appendChild(inputField);

    inputField.focus();

    const saveEdit = async () => { // Made async to await showCustomMessageBox
        const newName = inputField.value.trim();
        if (newName === '') {
            await showCustomMessageBox('Habit name cannot be empty! Reverting to original name.');
            // Re-render the habits to bring back the icons
            renderHabits(); 
            return;
        }
        targetHabit.name = newName;
        saveHabits();
        renderHabits();
    };

    inputField.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            saveEdit();
        }
    });

    inputField.addEventListener('blur', saveEdit);
}

async function deleteHabit(habitId, habitName) {
    const confirmed = await showCustomMessageBox(`Are you sure you want to delete "${habitName}"? This action cannot be undone.`, true);
    
    if (confirmed) {
        habits = habits.filter(h => h.id !== habitId);
        saveHabits();
        renderHabits();
    }
}

function calculateStreak(habit) {
    let streak = 0;
    const today = getEffectiveToday();
    const yesterday = getEffectiveYesterday();

    const sortedDates = Object.keys(habit.completedDates)
        .filter(dateString => habit.completedDates[dateString])
        .map(dateString => new Date(dateString))
        .sort((a, b) => a.getTime() - b.getTime());

    if (sortedDates.length === 0) {
        return 0;
    }

    let lastCompletedDay = null;

    let startIndex = -1;
    for (let i = sortedDates.length - 1; i >= 0; i--) {
        const currentDate = sortedDates[i];
        if (currentDate.toDateString() === today.toDateString()) {
            lastCompletedDay = today;
            streak = 1;
            startIndex = i;
            break;
        } else if (currentDate.toDateString() === yesterday.toDateString()) {
            lastCompletedDay = yesterday;
            streak = 1;
            startIndex = i;
            break;
        }
    }

    if (startIndex === -1) {
        return 0;
    }

    for (let i = startIndex - 1; i >= 0; i--) {
        const currentDate = sortedDates[i];
        const expectedPreviousDay = new Date(lastCompletedDay);
        expectedPreviousDay.setDate(lastCompletedDay.getDate() - 1);
        expectedPreviousDay.setHours(0, 0, 0, 0);

        if (currentDate.toDateString() === expectedPreviousDay.toDateString()) {
            streak++;
            lastCompletedDay = currentDate;
        } else {
            break; 
        }
    }
    return streak;
}

function renderHabits() {
    const habitList = document.getElementById('habitList');
    habitList.innerHTML = '';

    const currentWeekFormattedDates = [];
    const weekStart = new Date(currentWeekStart);
    
    const today = getEffectiveToday();
    const yesterday = getEffectiveYesterday();

    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        currentWeekFormattedDates.push(formatDate(date));
    }

    habits.forEach(habit => {
        const habitRow = document.createElement('div');
        habitRow.classList.add('habit-row');
        habitRow.dataset.habitId = habit.id;

        const habitNameDiv = document.createElement('div');
        habitNameDiv.classList.add('habit-name');
        
        const habitNameText = document.createElement('span');
        habitNameText.textContent = habit.name;
        habitNameDiv.appendChild(habitNameText);

        const currentStreak = calculateStreak(habit);
        if (currentStreak >= 3) {
            const streakContainer = document.createElement('div');
            streakContainer.classList.add('streak-container');

            const fireIcon = document.createElement('i');
            fireIcon.classList.add('fas', 'fa-fire', 'streak-icon');
            streakContainer.appendChild(fireIcon);

            const streakNumber = document.createElement('span');
            streakNumber.classList.add('streak-number');
            streakNumber.textContent = currentStreak;
            streakContainer.appendChild(streakNumber);

            habitNameDiv.appendChild(streakContainer);

            setTimeout(() => {
                streakContainer.classList.add('animate-in');
            }, 50);
        }

        const editIcon = document.createElement('i');
        editIcon.classList.add('fas', 'fa-pencil-alt', 'habit-action-icon', 'edit-icon');
        editIcon.title = 'Edit Habit';
        editIcon.addEventListener('click', () => {
            editHabit(habit.id, habitNameDiv);
        });
        habitNameDiv.appendChild(editIcon);

        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('fas', 'fa-trash-alt', 'habit-action-icon', 'delete-icon');
        deleteIcon.title = 'Delete Habit';
        deleteIcon.addEventListener('click', async () => {
            await deleteHabit(habit.id, habit.name);
        });
        habitNameDiv.appendChild(deleteIcon);
        
        habitRow.appendChild(habitNameDiv);

        currentWeekFormattedDates.forEach(dateString => {
            const checkboxCell = document.createElement('div');
            checkboxCell.classList.add('checkbox-cell');

            const cellDate = new Date(dateString);
            cellDate.setHours(0, 0, 0, 0);

            let shouldRenderCheckbox = true;
            const habitCreationTimestamp = parseInt(habit.id);
            const habitCreationDate = new Date(habitCreationTimestamp);
            habitCreationDate.setHours(0,0,0,0);

            const effectiveStartDate = habit.duration.startDate
                ? new Date(habit.duration.startDate)
                : habitCreationDate;
            effectiveStartDate.setHours(0,0,0,0);

            let effectiveEndDate = null;
            if (habit.duration !== 'forever') {
                effectiveEndDate = new Date(habit.duration.endDate);
                effectiveEndDate.setHours(0,0,0,0);
            }

            if (effectiveEndDate && (cellDate < effectiveStartDate || cellDate > effectiveEndDate)) {
                shouldRenderCheckbox = false;
            } else if (!effectiveEndDate && cellDate < effectiveStartDate) {
                shouldRenderCheckbox = false;
            }

            if (shouldRenderCheckbox) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.dataset.habitId = habit.id;
                checkbox.dataset.date = dateString;

                if (habit.completedDates[dateString]) {
                    checkbox.checked = true;
                }

                let disableCheckbox = true;

                if (cellDate.toDateString() === today.toDateString()) {
                    disableCheckbox = false;
                } else if (cellDate.toDateString() === yesterday.toDateString()) {
                    if (cellDate >= effectiveStartDate && (!effectiveEndDate || cellDate <= effectiveEndDate)) {
                        disableCheckbox = false;
                    }
                }

                if (disableCheckbox) {
                    checkbox.disabled = true;
                    checkboxCell.classList.add('disabled-day');
                }

                checkbox.addEventListener('change', (event) => {
                    const changedHabitId = event.target.dataset.habitId;
                    const changedDate = event.target.dataset.date;
                    const isChecked = event.target.checked;
                    const targetHabit = habits.find(h => h.id === changedHabitId);
                    const cellDateForEvent = new Date(changedDate);
                    cellDateForEvent.setHours(0,0,0,0);

                    const currentActualToday = getEffectiveToday(); 
                    const currentActualYesterday = getEffectiveYesterday();

                    if (targetHabit) {
                        if (isChecked) {
                            targetHabit.completedDates[changedDate] = true;
                            showCongratulationMessage();
                        } else {
                            if (cellDateForEvent.toDateString() === currentActualToday.toDateString() || cellDateForEvent.toDateString() === currentActualYesterday.toDateString()) {
                                delete targetHabit.completedDates[changedDate];
                            } else {
                                event.target.checked = true;
                                showCustomMessageBox("You can only change completion for today's or yesterday's date.");
                            }
                        }
                        saveHabits();
                        renderHabits();
                    }
                });

                checkboxCell.appendChild(checkbox);
            }
            
            habitRow.appendChild(checkboxCell);
        });
        habitList.appendChild(habitRow);
    });
    updateGoToTopButtonVisibility();
}

const motivationalQuotes = [
    "The best way to predict the future is to create it. – Peter Drucker",
    "Believe you can and you're halfway there. – Theodore Roosevelt",
    "The only way to do great work is to love what you do. – Steve Jobs",
    "Success is not final, failure is not fatal: It is the courage to continue that counts. – Winston Churchill",
    "The future belongs to those who believe in the beauty of their dreams. – Eleanor Roosevelt",
    "It does not matter how slowly you go as long as you do not stop. – Confucius",
    "Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time. – Thomas A. Edison",
    "The only limit to our realization of tomorrow will be our doubts of today. – Franklin D. Roosevelt",
    "Keep your eyes on the stars, and your feet on the ground. – Theodore Roosevelt",
    "The mind is everything. What you think you become. – Buddha",
    "Either you run the day, or the day runs you. – Jim Rohn",
    "Don’t count the days, make the days count. – Muhammad Ali",
    "The journey of a thousand miles begins with a single step. – Lao Tzu",
    "Start where you are. Use what you have. Do what you can. – Arthur Ashe",
    "Action is the foundational key to all success. – Pablo Picasso",
    "The will to win, the desire to succeed, the urge to reach your full potential... these are the keys that will unlock the door to personal excellence. – Confucius",
    "Your habits become your future.",
    "Small steps every day lead to great achievements."
];

function displayRandomQuote() {
    const quoteElement = document.getElementById('motivationalQuote');
    if (quoteElement) {
        const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
        const fullQuote = motivationalQuotes[randomIndex];

        const parts = fullQuote.split(' – ');
        const quoteText = parts[0] || '';
        const quoteAuthor = parts.length > 1 ? `– ${parts[1]}` : '';

        quoteElement.innerHTML = '';

        const quoteTextSpan = document.createElement('span');
        quoteTextSpan.classList.add('quote-text');
        quoteTextSpan.textContent = quoteText;
        quoteElement.appendChild(quoteTextSpan);

        if (quoteAuthor) {
            const quoteAuthorSpan = document.createElement('span');
            quoteAuthorSpan.classList.add('quote-author');
            quoteAuthorSpan.textContent = quoteAuthor;
            quoteElement.appendChild(quoteAuthorSpan);
        }
    }
}

let goToTopBtn;
let habitTrackerDisplayElement;

function updateGoToTopButtonVisibility() {
    if (!goToTopBtn || !habitTrackerDisplayElement) {
        return;
    }

    const rect = habitTrackerDisplayElement.getBoundingClientRect();
    
    if (habits.length > 0 && rect.top < 0) {
        goToTopBtn.classList.add('show');
    } else {
        goToTopBtn.classList.remove('show');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const newHabitInput = document.getElementById('newHabitInput');
    const habitDurationSelect = document.getElementById('habitDuration');
    const customEndDateInput = document.getElementById('customEndDate');
    const addHabitBtn = document.getElementById('addHabitBtn');
    const prevWeekBtn = document.getElementById('prevWeekBtn');
    const nextWeekBtn = document.getElementById('nextWeekBtn');
    const currentWeekBtn = document.getElementById('currentWeekBtn');
    const themeToggleButton = document.getElementById('themeToggleButton');
    const themeIcon = document.getElementById('themeIcon');

    goToTopBtn = document.getElementById('goToTopBtn');
    habitTrackerDisplayElement = document.querySelector('.habit-tracker-display');

    function applyTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        let themeToApply = savedTheme;

        if (themeToApply === null) {
            themeToApply = prefersDark ? 'dark' : 'light';
        }

        if (themeToApply === 'dark') {
            document.body.classList.add('dark-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        } else {
            document.body.classList.remove('dark-theme');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }

    themeToggleButton.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-theme');
        
        if (isDark) {
            localStorage.setItem('theme', 'dark');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        } else {
            localStorage.setItem('theme', 'light');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }

        themeToggleButton.classList.add('rotated');
        setTimeout(() => {
            themeToggleButton.classList.remove('rotated');
        }, 500);
    });

    habitDurationSelect.addEventListener('change', () => {
        if (habitDurationSelect.value === 'custom') {
            customEndDateInput.style.display = 'inline-block';
            customEndDateInput.min = formatDate(getEffectiveToday());
        } else {
            customEndDateInput.style.display = 'none';
        }
    });

    addHabitBtn.addEventListener('click', async () => {
        const habitName = newHabitInput.value.trim();
        if (habitName === '') {
            await showCustomMessageBox('Please enter a habit name!');
            return;
        }

        const durationType = habitDurationSelect.value;
        let durationDetails = 'forever';
        const today = getEffectiveToday();

        if (durationType === 'custom') {
            const endDate = customEndDateInput.value;
            if (!endDate) {
                await showCustomMessageBox('Please select a custom end date!');
                return;
            }
            durationDetails = {
                startDate: formatDate(today),
                endDate: endDate
            };
        } else if (durationType === '1week') {
            const oneWeekLater = new Date(today);
            oneWeekLater.setDate(today.getDate() + 7);
            durationDetails = {
                startDate: formatDate(today),
                endDate: formatDate(oneWeekLater)
            };
        } else if (durationType === '1month') {
            const oneMonthLater = new Date(today);
            oneMonthLater.setMonth(today.getMonth() + 1);
            durationDetails = {
                startDate: formatDate(today),
                endDate: formatDate(oneMonthLater)
            };
        }

        const newHabit = {
            id: Date.now().toString(),
            name: habitName,
            duration: durationDetails,
            completedDates: {},
            streak: 0
        };

        habits.push(newHabit);
        saveHabits();

        newHabitInput.value = '';
        habitDurationSelect.value = 'forever';
        customEndDateInput.style.display = 'none';

        renderHabits();
    });

    loadHabits();
    applyTheme();
    currentWeekStart = getMondayOfWeek(getEffectiveToday());
    renderDates();
    renderHabits();
    customEndDateInput.style.display = 'none';

    prevWeekBtn.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        renderDates();
        renderHabits();
    });

    nextWeekBtn.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        renderDates();
        renderHabits();
    });

    currentWeekBtn.addEventListener('click', () => {
        currentWeekStart = getMondayOfWeek(getEffectiveToday());
        renderDates();
        renderHabits();
    });

    window.addEventListener('scroll', updateGoToTopButtonVisibility);

    goToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    displayRandomQuote();
    updateGoToTopButtonVisibility();
});
