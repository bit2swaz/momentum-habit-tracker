let habits = [];
let currentWeekStart = new Date();

function loadHabits() {
  const storedHabits = localStorage.getItem('habits');
  if (storedHabits) {
    try {
      habits = JSON.parse(storedHabits);
      console.log('Habits loaded:', habits); // For debugging
    } catch (e) {
      console.error('Error parsing habits from localStorage:', e);
      habits = [];
    }
  }
}

function saveHabits() {
  localStorage.setItem('habits', JSON.stringify(habits));
  console.log('Habits saved:', habits); // For debugging
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function renderDates() {
    const gridHeader = document.querySelector('.grid-header');
    
    while (gridHeader.children.length > 1) {
        gridHeader.removeChild(gridHeader.lastChild);
    }

    const dayOfWeek = currentWeekStart.getDay();
    const diff = currentWeekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(currentWeekStart.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

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

        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        dateColumn.textContent = date.toLocaleDateString('en-US', options);

        if (date.toDateString() === today.toDateString()) {
            dateColumn.classList.add('today-column');
        }

        gridHeader.appendChild(dateColumn);
    });
}

function renderHabits() {
    const habitList = document.getElementById('habitList');
    habitList.innerHTML='';

    habits.forEach(habit => {
        const habitRow = document.createElement('div');
        habitRow.classList.add('habit-row');
        habitRow.dataset.habitId = habit.id;

        const habitNameDiv = document.createElement('div');
        habitNameDiv.classList.add('habit-name');
        habitNameDiv.textContent = habit.name;

        // TODO: Add/delete icons here later
        habitRow.appendChild(habitNameDiv);

        for (let i = 0; i < 7; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('checkbox-cell');
            habitRow.appendChild(emptyCell);
        }

        habitList.appendChild(habitRow);
    });
}

// --- DOM Element References & Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    const newHabitInput = document.getElementById('newHabitInput');
    const habitDurationSelect = document.getElementById('habitDuration');
    const customEndDateInput = document.getElementById('customEndDate');
    const addHabitBtn = document.getElementById('addHabitBtn');
    const trackerGrid = document.getElementById('trackerGrid');
    const habitList = document.getElementById('habitList');
    const prevWeekBtn = document.getElementById('prevWeekBtn');
    const nextWeekBtn = document.getElementById('nextWeekBtn');

    habitDurationSelect.addEventListener('change', () => {
        if (habitDurationSelect.value === 'custom') {
            customEndDateInput.style.display = 'inline-block';
            customEndDateInput.min = formatDate(new Date());
        } else {
            customEndDateInput.style.display = 'none';
        }
    });

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
                alert('Please select an end date!');
                return;
            }

            durationDetails = {
                startDate: formatDate(new Date()),
                endDate: endDate
            };
        }

        const newHabit = {
            id: Date.now().toString(),
            name: habitName,
            duration: durationDetails,
            completeDates: {},
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

    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    currentWeekStart.setDate(diff);
    currentWeekStart.setHours(0, 0, 0, 0);

    renderDates();
    renderHabits();
    customEndDateInput.style.display = 'none';
});