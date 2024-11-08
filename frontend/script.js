// JavaScript to handle pointer movement
document.addEventListener("DOMContentLoaded", function() {
    const pointer = document.getElementById('terminal-pointer');
    const buttons = document.querySelectorAll('.retro-btn');
    let currentButtonIndex = 0; // Track the current button the pointer is on

    function updatePointerPosition() {
        const button = buttons[currentButtonIndex];
        const rect = button.getBoundingClientRect();
        pointer.style.top = `${rect.top + window.scrollY}px`; // Adjust for scroll position
        pointer.style.left = `${rect.left + rect.width + 10}px`; // Place pointer to the right of the button
    }

    // Initialize pointer position
    updatePointerPosition();

    // Add click listeners to buttons to simulate a button click when pointer is over them
    buttons.forEach((button, index) => {
        button.addEventListener('click', function() {
            alert(`Button ${index + 1} clicked!`); // Replace with actual functionality
        });
    });

    // Move pointer on keypress (up, down, and enter)
    document.addEventListener('keydown', function(e) {
        if (e.key === "ArrowDown") {
            currentButtonIndex = (currentButtonIndex + 1) % buttons.length; // Move to the next button
            updatePointerPosition(); // Update pointer position
        } else if (e.key === "ArrowUp") {
            currentButtonIndex = (currentButtonIndex - 1 + buttons.length) % buttons.length; // Move to the previous button
            updatePointerPosition(); // Update pointer position
        } else if (e.key === "Enter") {
            buttons[currentButtonIndex].click(); // Simulate click on the current button
        }
    });
});
