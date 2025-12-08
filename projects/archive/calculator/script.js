class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }

    delete() {
        if (this.currentOperand === '0') return;
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
    }

    appendNumber(number) {
        // Prevent multiple decimals
        if (number === '.' && this.currentOperand.includes('.')) return;

        // Replace initial zero unless adding decimal
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand = this.currentOperand + number;
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '0' && this.previousOperand === '') return;

        // If we already have a previous number, compute it first (chaining)
        if (this.previousOperand !== '') {
            this.compute();
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.currentOperand = 'Error';
                    this.operation = undefined;
                    this.previousOperand = '';
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // Handle floating point precision issues
        this.currentOperand = this.formatResult(computation);
        this.operation = undefined;
        this.previousOperand = '';
    }

    formatResult(number) {
        // Handle very large or very small numbers
        if (Math.abs(number) > 999999999999) {
            return number.toExponential(6);
        }

        // Round to avoid floating point issues
        const rounded = Math.round(number * 1000000000000) / 1000000000000;

        // Convert to string and limit decimal places for display
        let str = rounded.toString();

        // If the string is too long, truncate decimals
        if (str.length > 15) {
            if (str.includes('.')) {
                const [integer, decimal] = str.split('.');
                const maxDecimals = Math.max(0, 14 - integer.length);
                str = Number(rounded.toFixed(maxDecimals)).toString();
            }
        }

        return str;
    }

    getDisplayNumber(number) {
        if (number === 'Error') return 'Error';

        const stringNumber = number.toString();

        // Handle numbers in exponential notation
        if (stringNumber.includes('e')) {
            return stringNumber;
        }

        const [integerPart, decimalPart] = stringNumber.split('.');

        let integerDisplay;
        if (isNaN(parseFloat(integerPart))) {
            integerDisplay = '';
        } else {
            integerDisplay = parseFloat(integerPart).toLocaleString('en', {
                maximumFractionDigits: 0
            });
        }

        if (decimalPart != null) {
            return `${integerDisplay}.${decimalPart}`;
        } else {
            return integerDisplay;
        }
    }

    getOperationSymbol(operation) {
        switch (operation) {
            case '+': return '+';
            case '-': return '−';
            case '*': return '×';
            case '/': return '÷';
            default: return operation;
        }
    }

    updateDisplay() {
        this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);

        if (this.operation != null) {
            this.previousOperandElement.innerText =
                `${this.getDisplayNumber(this.previousOperand)} ${this.getOperationSymbol(this.operation)}`;
        } else {
            this.previousOperandElement.innerText = '';
        }

        // Update operator button active state
        document.querySelectorAll('[data-operator]').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.operator === this.operation) {
                btn.classList.add('active');
            }
        });
    }
}

// Initialize calculator
const previousOperandElement = document.getElementById('previous-operand');
const currentOperandElement = document.getElementById('current-operand');
const calculator = new Calculator(previousOperandElement, currentOperandElement);

// Number buttons
document.querySelectorAll('[data-number]').forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.dataset.number);
        calculator.updateDisplay();
    });
});

// Operator buttons
document.querySelectorAll('[data-operator]').forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.dataset.operator);
        calculator.updateDisplay();
    });
});

// Equals button
document.querySelector('[data-action="equals"]').addEventListener('click', () => {
    calculator.compute();
    calculator.updateDisplay();
});

// Clear button
document.querySelector('[data-action="clear"]').addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay();
});

// Delete button
document.querySelector('[data-action="delete"]').addEventListener('click', () => {
    calculator.delete();
    calculator.updateDisplay();
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9' || e.key === '.') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        calculator.chooseOperation(e.key);
        calculator.updateDisplay();
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculator.compute();
        calculator.updateDisplay();
    } else if (e.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        calculator.clear();
        calculator.updateDisplay();
    }
});

// Initial display
calculator.updateDisplay();
