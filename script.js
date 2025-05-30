let habits = [];
let currentWeekStart = new Date();
let mockToday = null; // NEW: Global variable to mock 'today' for testing

// Helper function to get the current effective 'today'
function getEffectiveToday() {
    const d = mockToday ? new Date(mockToday) : new Date();
    d.setHours(0, 0, 0, 0); // Normalize to start of day
    return d;
}

// Helper function to get the effective 'yesterday'
function getEffectiveYesterday() {
    const today = getEffectiveToday();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return yesterday;
}


// Loads habits from localStorage on page load.
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

// Saves current habits array to localStorage.
function saveHabits() {
  localStorage.setItem('habits', JSON.stringify(habits));
}

// Helper: Formats a Date object into a 'YYYY-MM-DD' string.
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper: Returns a new Date object representing the Monday of the given date's week.
function getMondayOfWeek(date) {
    const d = new Date(date);
    const dayOfWeek = d.getDay();
    const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Renders the date headers for the current week.
function renderDates() {
    const gridHeader = document.querySelector('.grid-header');
    
    // Remove all existing date columns except the first 'Habit' header
    while (gridHeader.children.length > 1) {
        gridHeader.removeChild(gridHeader.lastChild);
    }

    const weekStart = new Date(currentWeekStart);
    const today = getEffectiveToday(); // UPDATED: Use effective today

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

// Displays a temporary congratulations message with an overlay.
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

// Custom message box for alerts/confirmations.
// Returns a Promise that resolves to true for 'Confirm' or false for 'Cancel'.
function showCustomMessageBox(message, isConfirmation = false) {
    return new Promise(resolve => {
        const messageBox = document.getElementById('customMessageBox');
        const messageBoxText = document.getElementById('messageBoxText');
        const overlay = document.getElementById('overlay');

        // Clear all existing buttons and content before adding new ones
        messageBox.innerHTML = '';
        messageBox.appendChild(messageBoxText); // Re-add the text element

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


// Handles editing a habit name
function editHabit(habitId, currentNameDiv) {
    const targetHabit = habits.find(h => h.id === habitId);
    if (!targetHabit) return;

    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = targetHabit.name;
    inputField.classList.add('edit-habit-input');
    inputField.maxLength = 50;

    currentNameDiv.innerHTML = '';
    currentNameDiv.appendChild(inputField);

    inputField.focus();

    const saveEdit = () => {
        const newName = inputField.value.trim();
        if (newName === '') {
            showCustomMessageBox('Habit name cannot be empty! Reverting to original name.');
            targetHabit.name = targetHabit.name;
            saveHabits();
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

// Handles deleting a habit
async function deleteHabit(habitId, habitName) {
    const confirmed = await showCustomMessageBox(`Are you sure you want to delete "${habitName}"? This action cannot be undone.`, true);
    
    if (confirmed) {
        habits = habits.filter(h => h.id !== habitId);
        saveHabits();
        renderHabits();
    }
}

// Calculates the current streak for a given habit.
function calculateStreak(habit) {
    let streak = 0;
    const today = getEffectiveToday(); // UPDATED: Use effective today
    const yesterday = getEffectiveYesterday(); // UPDATED: Use effective yesterday

    // Get all completed dates and sort them chronologically
    const sortedDates = Object.keys(habit.completedDates)
        .filter(dateString => habit.completedDates[dateString]) // Ensure it's marked true
        .map(dateString => new Date(dateString)) // Convert to Date objects
        .sort((a, b) => a.getTime() - b.getTime()); // Sort Date objects

    if (sortedDates.length === 0) {
        return 0; // No completions, no streak
    }

    let lastCompletedDay = null;

    // Find the most recent completed day that is today or yesterday
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
        return 0; // No completion today or yesterday, streak broken
    }

    // Iterate backwards from the found starting point
    for (let i = startIndex - 1; i >= 0; i--) {
        const currentDate = sortedDates[i];
        const expectedPreviousDay = new Date(lastCompletedDay);
        expectedPreviousDay.setDate(lastCompletedDay.getDate() - 1);
        expectedPreviousDay.setHours(0, 0, 0, 0);

        if (currentDate.toDateString() === expectedPreviousDay.toDateString()) {
            streak++;
            lastCompletedDay = currentDate; // Update lastCompletedDay for next iteration
        } else {
            // If the current date is not the expected previous day, the streak is broken
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
    
    const today = getEffectiveToday(); // UPDATED: Use effective today
    const yesterday = getEffectiveYesterday(); // UPDATED: Use effective yesterday

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

        // Display Streak Icon and Number
        const currentStreak = calculateStreak(habit);
        if (currentStreak >= 3) { // Only show if streak is 3 or more
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
            // Determine the effective start date of the habit (creation date or custom start date)
            const habitCreationTimestamp = parseInt(habit.id); // habit.id is a timestamp string
            const habitCreationDate = new Date(habitCreationTimestamp);
            habitCreationDate.setHours(0,0,0,0);

            const effectiveStartDate = habit.duration.startDate
                ? new Date(habit.duration.startDate)
                : habitCreationDate;
            effectiveStartDate.setHours(0,0,0,0);

            // Also consider the habit's end date if not 'forever'
            let effectiveEndDate = null;
            if (habit.duration !== 'forever') {
                effectiveEndDate = new Date(habit.duration.endDate);
                effectiveEndDate.setHours(0,0,0,0);
            }

            // Rule 1: Don't render checkbox if outside habit's active duration
            if (effectiveEndDate && (cellDate < effectiveStartDate || cellDate > effectiveEndDate)) {
                shouldRenderCheckbox = false;
            } else if (!effectiveEndDate && cellDate < effectiveStartDate) { // For 'forever' habits before creation
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

                // NEW STRICT DISABLING LOGIC:
                let disableCheckbox = true; // Assume disabled by default

                // Rule 2: Enable only for today or yesterday, AND within habit's effective start/end dates
                if (cellDate.toDateString() === today.toDateString()) {
                    disableCheckbox = false; // Always enable today's checkbox if within habit duration
                } else if (cellDate.toDateString() === yesterday.toDateString()) {
                    // Enable yesterday's checkbox if it's within the habit's active period
                    if (cellDate >= effectiveStartDate && (!effectiveEndDate || cellDate <= effectiveEndDate)) {
                        disableCheckbox = false;
                    }
                }
                // All other cases (past before yesterday, future) remain disabled by default `disableCheckbox = true`

                if (disableCheckbox) {
                    checkbox.disabled = true;
                    checkboxCell.classList.add('disabled-day'); // Apply visual disabled style
                }

                checkbox.addEventListener('change', (event) => {
                    const changedHabitId = event.target.dataset.habitId;
                    const changedDate = event.target.dataset.date;
                    const isChecked = event.target.checked;
                    const targetHabit = habits.find(h => h.id === changedHabitId);
                    const cellDateForEvent = new Date(changedDate); // Re-parse date for comparison
                    cellDateForEvent.setHours(0,0,0,0); // Normalize for comparison

                    // Re-calculate today and yesterday within the event listener context
                    const currentActualToday = getEffectiveToday(); 
                    const currentActualYesterday = getEffectiveYesterday();

                    if (targetHabit) {
                        if (isChecked) {
                            targetHabit.completedDates[changedDate] = true;
                            showCongratulationMessage();
                        } else {
                            // Only allow unchecking if it's TODAY or YESTERDAY.
                            if (cellDateForEvent.toDateString() === currentActualToday.toDateString() || cellDateForEvent.toDateString() === currentActualYesterday.toDateString()) {
                                delete targetHabit.completedDates[changedDate];
                            } else {
                                event.target.checked = true; // Revert checkbox state if trying to uncheck older past days
                                showCustomMessageBox("You can only change completion for today's or yesterday's date.");
                            }
                        }
                        saveHabits();
                        renderHabits(); // Re-render to update streak display
                    }
                });

                checkboxCell.appendChild(checkbox);
            }
            
            habitRow.appendChild(checkboxCell);
        });

        habitList.appendChild(habitRow);
    });
}


// --- DOM Element References & Initial Setup ---
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

    // Function to apply the saved theme or default to light
    function applyTheme() {
        const savedTheme = localStorage.getItem('theme');
        const isBodyDark = document.body.classList.contains('dark-theme');

        if (savedTheme === 'dark') {
            if (!isBodyDark) {
                document.body.classList.add('dark-theme');
            }
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        } else {
            if (isBodyDark) {
                document.body.classList.remove('dark-theme');
            }
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }

    // Event listener for theme toggle button
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

    // Event listener for duration select to show/hide custom date input.
    habitDurationSelect.addEventListener('change', () => {
        if (habitDurationSelect.value === 'custom') {
            customEndDateInput.style.display = 'inline-block';
            customEndDateInput.min = formatDate(getEffectiveToday()); // Use effective today for min date
        } else {
            customEndDateInput.style.display = 'none';
        }
    });

    // Event listener for adding a habit.
    addHabitBtn.addEventListener('click', async () => {
        const habitName = newHabitInput.value.trim();
        if (habitName === '') {
            await showCustomMessageBox('Please enter a habit name!');
            return;
        }

        const durationType = habitDurationSelect.value;
        let durationDetails = 'forever';
        const today = getEffectiveToday(); // Use effective today for habit creation date

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
            id: Date.now().toString(), // This ID will serve as the creation timestamp
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

    // Initial setup when the DOM is fully loaded.
    loadHabits();
    applyTheme(); // Apply theme on load, now including icon logic
    currentWeekStart = getMondayOfWeek(getEffectiveToday()); // UPDATED: Use effective today for initial week start
    renderDates();
    renderHabits();
    customEndDateInput.style.display = 'none';

    // Event Listeners for Week Navigation.
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
        currentWeekStart = getMondayOfWeek(getEffectiveToday()); // UPDATED: Use effective today for current week
        renderDates();
        renderHabits();
    });
});
