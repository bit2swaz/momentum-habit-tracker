# Momentum Habit Tracker

A sleek, responsive, and intuitive habit tracking web application, built entirely with **HTML, CSS, and Vanilla JavaScript**. Momentum Habit Tracker provides a clean and engaging platform for users to cultivate consistent habits, featuring a highly customizable experience inspired by minimalistic design principles like Shadcn/UI.

## Live Demo
[Momentum Habit Tracker Live Demo](https://bit2swaz.github.io/momentum-habit-tracker/)
---

## Features
-   **Daily/Weekly Habit Tracking:** Mark habits as completed for each day within a weekly view.
-   **Dynamic Week Navigation:** Easily navigate between previous, current, and next weeks to track progress over time.
-   **Configurable Habit Durations:** Set habits to track "forever," for a "week," "month," or a "custom" end date.
-   **Real-time Streak Calculation:** Displays current streaks for habits, motivating consistent effort.
-   **Edit & Delete Habits:** Seamlessly modify habit names or remove habits from your tracker.
-   **Custom Message Boxes:** User-friendly alert and confirmation dialogs replace native browser prompts for a consistent UI.
-   **Motivational Quotes:** Displays a random motivational quote to inspire and encourage users.
-   **Responsive Design:** Ensures optimal usability and visual appeal across desktops, tablets, and mobile devices.
-   **Adaptive Theme System:**
    * **System Preference Detection:** Automatically applies light or dark theme based on the user's operating system settings on first visit.
    * **Persistent Theme Preference:** User's manually selected theme is saved in local storage, providing a consistent experience across sessions.
-   **"Go to Top" Button:** A subtle button appears on scroll, allowing quick navigation back to the top of the page.
-   **Minimalistic & Aesthetic UI:** A clean, uncluttered design approach, leveraging a refined pastel color palette for contrast while maintaining a modern, elegant feel.
-   **Clean and Maintainable Codebase:** Structured HTML, well-organized CSS using custom properties for theming, and modular JavaScript for readability and extensibility.

---

## Tech Stack
-   **HTML5:** For semantic structure and content.
-   **CSS3:** For modern styling, responsiveness, and dynamic theme management using CSS Custom Properties (`:root`, `--var`, `var()`).
-   **JavaScript (Vanilla):** For all interactive logic, DOM manipulation, habit management, and UI interactions.
-   **Google Fonts:** For typography (e.g., 'Inter').
-   **Font Awesome:** Utilized for iconic elements (e.g., theme toggle, edit/delete icons, streak fire icon).

---

## What I Learned
-   **Dynamic UI Rendering:** Efficiently rendering and updating complex grid-based UI elements based on user data and interactions.
-   **Client-side Data Persistence:** Implementing robust `localStorage` management for saving and loading user habits and preferences.
-   **Advanced Date & Time Manipulation:** Handling weekly navigation, calculating streaks, and managing habit durations with JavaScript's Date object.
-   **Responsive Layouts with CSS Grid & Flexbox:** Crafting a dynamic and adaptable layout that gracefully adjusts across various screen sizes.
-   **User Experience Enhancements:** Implementing custom message boxes, "Go to Top" functionality, and system theme preference detection for a polished user experience.
-   **Modular JavaScript Development:** Structuring the application logic into distinct, reusable functions for better organization and maintainability.
-   **CSS Theming with Custom Properties:** Leveraging CSS custom properties for efficient and centralized management of light and dark mode styles, including subtle pastel accents.
-   **Event Handling & DOM Manipulation:** Robustly managing user interactions (clicks, input changes, scroll events) and dynamically updating the DOM.

---

## How to Run Locally
```bash
git clone https://github.com/bit2swaz/momentum-habit-tracker.git
cd momentum-habit-tracker
open index.html
```

---

## Credits
Made with ❤️ by [bit2swaz](https://www.github.com/bit2swaz)

---

## What's Next
- Implement a high-score or progress tracking system with more detailed analytics.
- Add user authentication and cloud storage (e.g., Firebase) for cross-device synchronization.
- Introduce notifications or reminders for habits.
- Allow users to customize habit icons or colors.
- Explore more advanced animations and micro-interactions for a delightful user experience.

---

## License
This project is open source and free to use under the MIT License.