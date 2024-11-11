class RetroTerminal {
    constructor() {
        this.buttons = Array.from(document.querySelectorAll('.retro-btn'));
        this.selectedIndex = 0;
        this.terminalContent = document.getElementById('terminalContent');
        this.terminalInput = document.getElementById('terminalInput');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        this.buttons.forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                this.handleButtonAction(action, button.textContent);
            });
        });
    }

    handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowDown':
                this.selectedIndex = (this.selectedIndex + 1) % this.buttons.length;
                this.updateButtonStates();
                break;
            case 'ArrowUp':
                this.selectedIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
                this.updateButtonStates();
                break;
            case 'Enter':
                this.handleEnterPress();
                break;
        }
    }

    updateButtonStates() {
        this.buttons.forEach((button, index) => {
            button.classList.toggle('hovered', index === this.selectedIndex);
        });
    }

    handleEnterPress() {
        const selectedButton = this.buttons[this.selectedIndex];
        selectedButton.click();
        
        const inputValue = this.terminalInput.value.trim();
        if (inputValue) {
            this.appendToTerminal(`> ${inputValue}`);
            this.terminalInput.value = '';
        }
    }

    appendToTerminal(text) {
        const element = document.createElement('p');
        element.textContent = text;
        this.terminalContent.appendChild(element);
        this.terminalContent.scrollTop = this.terminalContent.scrollHeight;
    }

    handleButtonAction(action, buttonText) {
        switch(action) {
            case 'talk-stranger':
                this.appendToTerminal('Connecting to random stranger...');
                break;
            case 'talk-contacts':
                this.appendToTerminal('Opening contacts list...');
                break;
            case 'author-github':
                this.appendToTerminal('Redirecting to GitHub page...');
                break;
            case 'team-report':
                this.appendToTerminal('Loading team project report...');
                break;
            default:
                this.appendToTerminal(`Clicked: ${buttonText}`);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RetroTerminal();
});