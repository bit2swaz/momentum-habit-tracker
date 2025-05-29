let habits = [];
let currentWeekStart = new Date();

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
        dateColumn.textContent = date.toLocaleDateString('en-US', options);

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

function showCustomMessageBox(message) {
    return new Promise(resolve => {
        const messageBox = document.getElementById('customMessageBox');
        const messageBoxText = document.getElementById('messageBoxText');
        const messageBoxCloseBtn = document.getElementById('messageBoxCloseBtn');
        const overlay = document.getElementById('overlay');

        messageBoxText.textContent = message;
        
        overlay.style.opacity = '1';
        overlay.style.visibility = 'visible';
        messageBox.classList.add('active');
        
        document.body.classList.add('disable-interactions');

        const closeHandler = () => {
            messageBox.classList.remove('active');
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
            document.body.classList.remove('disable-interactions');
            messageBoxCloseBtn.removeEventListener('click', closeHandler);
            resolve();
        };
        messageBoxCloseBtn.addEventListener('click', closeHandler);
    });
}


function renderHabits() {
    const habitList = document.getElementById('habitList');
    habitList.innerHTML = '';

    const currentWeekFormattedDates = [];
    const weekStart = new Date(currentWeekStart);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
        habitNameDiv.textContent = habit.name;
        
        // TODO: Add edit/delete icons here later
        
        habitRow.appendChild(habitNameDiv);

        currentWeekFormattedDates.forEach(dateString => {
            const checkboxCell = document.createElement('div');
            checkboxCell.classList.add('checkbox-cell');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.dataset.habitId = habit.id;
            checkbox.dataset.date = dateString;

            if (habit.completedDates[dateString]) {
                checkbox.checked = true;
            }

            const cellDate = new Date(dateString);
            cellDate.setHours(0, 0, 0, 0);

            // Disable checkboxes for future dates OR dates outside the habit's duration.
            const isFutureDate = cellDate > today;
            const isOutsideDuration = habit.duration !== 'forever' && 
                                      (cellDate < new Date(habit.duration.startDate).setHours(0,0,0,0) || 
                                       cellDate > new Date(habit.duration.endDate).setHours(0,0,0,0));

            if (isFutureDate || isOutsideDuration) {
                checkbox.disabled = true;
                checkboxCell.classList.add('disabled-day');
            }

            checkbox.addEventListener('change', (event) => {
                const changedHabitId = event.target.dataset.habitId;
                const changedDate = event.target.dataset.date;
                const isChecked = event.target.checked;

                const targetHabit = habits.find(h => h.id === changedHabitId);
                if (targetHabit) {
                    if (isChecked) {
                        targetHabit.completedDates[changedDate] = true;
                        showCongratulationMessage();
                    } else {
                        delete targetHabit.completedDates[changedDate];
                    }
                    saveHabits();
                }
            });

            checkboxCell.appendChild(checkbox);
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

    // Event listener for duration select to show/hide custom date input.
    habitDurationSelect.addEventListener('change', () => {
        if (habitDurationSelect.value === 'custom') {
            customEndDateInput.style.display = 'inline-block';
            customEndDateInput.min = formatDate(new Date());
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
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today for calculations

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
            oneWeekLater.setDate(today.getDate() + 7); // Add 7 days
            durationDetails = {
                startDate: formatDate(today),
                endDate: formatDate(oneWeekLater)
            };
        } else if (durationType === '1month') {
            const oneMonthLater = new Date(today);
            oneMonthLater.setMonth(today.getMonth() + 1); // Add 1 month
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

    // Initial setup when the DOM is fully loaded.
    loadHabits();
    currentWeekStart = getMondayOfWeek(new Date());
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
        currentWeekStart = getMondayOfWeek(new Date());
        renderDates();
        renderHabits();
    });
});
