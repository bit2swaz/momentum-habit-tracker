// Global array to store all habit data.
// Each habit object will look something like:
// {
//   id: 'unique-id',
//   name: 'Read 30 mins',
//   duration: 'forever' or { startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD' },
//   completedDates: { 'YYYY-MM-DD': true }, // true if completed, false or absent if not
//   streak: 0
// }
let habits = [];
// Stores the Monday of the week currently displayed.
let currentWeekStart = new Date();

// Loads habits from localStorage on page load.
function loadHabits() {
  const storedHabits = localStorage.getItem('habits');
  if (storedHabits) {
    try {
      habits = JSON.parse(storedHabits);
    } catch (e) {
      console.error('Error parsing habits from localStorage:', e);
      habits = []; // Reset if parsing fails
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
    const d = new Date(date); // Create a copy to avoid modifying original
    const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Adjust to Monday (if Sunday, subtract 6 days to get previous Monday, otherwise subtract dayOfWeek-1)
    const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0); // Normalize to start of day
    return d;
}

// Renders the date headers for the current week.
function renderDates() {
    const gridHeader = document.querySelector('.grid-header');
    
    // Clear existing date columns, keeping the "Habit" label.
    while (gridHeader.children.length > 1) {
        gridHeader.removeChild(gridHeader.lastChild);
    }

    // Use currentWeekStart (which is always a Monday) as the base for the week.
    const weekStart = new Date(currentWeekStart);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date for comparison

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        weekDates.push(date);
    }

    weekDates.forEach(date => {
        const dateColumn = document.createElement('div');
        dateColumn.classList.add('date-column');
        dateColumn.dataset.fullDate = formatDate(date); // Store full date string

        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        dateColumn.textContent = date.toLocaleDateString('en-US', options);

        if (date.toDateString() === today.toDateString()) {
            dateColumn.classList.add('today-column'); // Highlight today's date
        }

        gridHeader.appendChild(dateColumn);
    });
}

// Displays a temporary congratulations message with an overlay.
function showCongratulationMessage() {
    let messageContainer = document.getElementById('congratulationsMessage');
    let overlay = document.getElementById('overlay');

    // Create message container if it doesn't exist
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'congratulationsMessage';
        messageContainer.classList.add('congratulations-message');
        document.body.appendChild(messageContainer);
    }

    // More varied and encouraging messages
    const messages = [
        "Awesome work!",
        "You're crushing it!",
        "Keep the momentum!",
        "Great job!",
        "Another one down!",
        "Way to go!",
        "You're building momentum!",
        "Fantastic effort!",
        "Keep up the great work!",
        "Success!",
        "Nailed it!"
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    messageContainer.textContent = randomMessage;
    
    // Show overlay and message
    overlay.style.opacity = '1';
    overlay.style.visibility = 'visible';
    messageContainer.style.opacity = '1';
    messageContainer.style.visibility = 'visible';
    messageContainer.style.transform = 'translate(-50%, -50%) scale(1)';

    // Disable interactions on the rest of the page
    document.body.classList.add('disable-interactions');

    // Hide message and overlay after a short delay
    setTimeout(() => {
        messageContainer.style.opacity = '0';
        messageContainer.style.transform = 'translate(-50%, -50%) scale(0.8)';
        messageContainer.style.visibility = 'hidden'; // Hide after transition

        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden'; // Hide after transition

        // Re-enable interactions after the message and overlay are fully hidden
        setTimeout(() => {
            document.body.classList.remove('disable-interactions');
        }, 500); // Match CSS transition duration for overlay/message fade out
    }, 1500); // Display message for 1.5 seconds
}

// Renders all habits from the 'habits' array to the UI with checkboxes.
function renderHabits() {
    const habitList = document.getElementById('habitList');
    habitList.innerHTML = ''; // Clear existing habit rows

    // Recalculate week dates based on currentWeekStart for consistency.
    const currentWeekFormattedDates = [];
    const weekStart = new Date(currentWeekStart); // Use currentWeekStart which is already Monday
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date for comparison

    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        currentWeekFormattedDates.push(formatDate(date));
    }

    habits.forEach(habit => {
        const habitRow = document.createElement('div');
        habitRow.classList.add('habit-row');
        habitRow.dataset.habitId = habit.id; // Store habit ID for lookup

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
            checkbox.dataset.habitId = habit.id; // Link checkbox to habit
            checkbox.dataset.date = dateString; // Link checkbox to date

            // Set checked state based on saved data.
            if (habit.completedDates[dateString]) {
                checkbox.checked = true;
            }

            // Disable checkboxes for future dates.
            const cellDate = new Date(dateString);
            cellDate.setHours(0, 0, 0, 0); // Normalize for accurate comparison

            if (cellDate > today) {
                checkbox.disabled = true;
                checkboxCell.classList.add('disabled-day'); // Apply visual dimming
            }

            // Event listener for checkbox changes.
            checkbox.addEventListener('change', (event) => {
                const changedHabitId = event.target.dataset.habitId;
                const changedDate = event.target.dataset.date;
                const isChecked = event.target.checked;

                const targetHabit = habits.find(h => h.id === changedHabitId);
                if (targetHabit) {
                    if (isChecked) {
                        targetHabit.completedDates[changedDate] = true;
                        showCongratulationMessage(); // Show message on check
                    } else {
                        delete targetHabit.completedDates[changedDate]; // Remove if unchecked
                    }
                    saveHabits(); // Persist changes
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
            customEndDateInput.min = formatDate(new Date()); // Set min date for customEndDate to today
        } else {
            customEndDateInput.style.display = 'none';
        }
    });

    // Event listener for adding a habit.
    addHabitBtn.addEventListener('click', () => {
        const habitName = newHabitInput.value.trim();
        if (habitName === '') {
            // TODO: Replace with a custom modal/message box later
            alert('Please enter a habit name!');
            return;
        }

        const durationType = habitDurationSelect.value;
        let durationDetails = 'forever';

        if (durationType === 'custom') {
            const endDate = customEndDateInput.value;
            if (!endDate) {
                // TODO: Replace with a custom modal/message box later
                alert('Please select a custom end date!');
                return;
            }
            durationDetails = {
                startDate: formatDate(new Date()), // Assume start is always today for custom
                endDate: endDate
            };
        }

        const newHabit = {
            id: Date.now().toString(), // Unique ID
            name: habitName,
            duration: durationDetails,
            completedDates: {}, // Initialize completion tracking
            streak: 0 // Initialize streak
        };

        habits.push(newHabit);
        saveHabits();

        newHabitInput.value = ''; // Clear input
        habitDurationSelect.value = 'forever'; // Reset select
        customEndDateInput.style.display = 'none'; // Hide custom date input

        renderHabits(); // Re-render to show new habit
    });

    // Initial setup when the DOM is fully loaded.
    loadHabits();
    currentWeekStart = getMondayOfWeek(new Date()); // Set to current week's Monday
    renderDates();
    renderHabits();
    customEndDateInput.style.display = 'none'; // Ensure hidden on load

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
        currentWeekStart = getMondayOfWeek(new Date()); // Reset to current week
        renderDates();
        renderHabits();
    });
});
