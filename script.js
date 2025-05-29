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

            if (cellDate > today) {
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
                    } else {
                        delete targetHabit.completedDates[changedDate]; 
                    }
                    saveHabits(); 
                    console.log(`Habit '${targetHabit.name}' on ${changedDate} changed to: ${isChecked}`);
                    // TODO: Add congratulations message here
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
    const trackerGrid = document.getElementById('trackerGrid');
    const habitList = document.getElementById('habitList');
    const prevWeekBtn = document.getElementById('prevWeekBtn');
    const nextWeekBtn = document.getElementById('nextWeekBtn');
    const currentWeekBtn = document.getElementById('currentWeekBtn');

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
                alert('Please select a custom end date!');
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

    currentWeekStart = getMondayOfWeek(new Date());

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
        currentWeekStart = getMondayOfWeek(new Date());
        renderDates();
        renderHabits();
    });
});
