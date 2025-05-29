let habits = [];

function loadHabits() {
    const storedHabits = localStorage.getItem('habits');
    if (storedHabits) {
        try {
            habits = JSON.parse(storedHabits);
            console.log('Habits loaded:', habits);
        } catch (e) {
            console.error('Error parsing habits from localStorage:', e);
        }
    }
}

function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
    console.log('Habits saved:', habits);
}

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
        } else {
            customEndDateInput.style.display = 'none';
        }
    });
    
    loadHabits();
    customEndDateInput.style.display = 'none';
});