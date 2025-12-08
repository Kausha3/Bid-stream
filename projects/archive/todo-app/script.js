// State management
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// DOM Elements
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const itemsLeft = document.getElementById('items-left');
const clearCompletedBtn = document.getElementById('clear-completed');

// Save to Local Storage
function saveToStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Update items left counter
function updateItemsLeft() {
    const activeCount = todos.filter(todo => !todo.completed).length;
    itemsLeft.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
}

// Add new todo
function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    todos.push(newTodo);
    saveToStorage();
    renderTodos();
    todoInput.value = '';
    todoInput.focus();
}

// Toggle todo completion
function toggleTodo(id) {
    todos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveToStorage();
    renderTodos();
}

// Delete todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveToStorage();
    renderTodos();
}

// Edit todo
function editTodo(id, newText) {
    const text = newText.trim();
    if (!text) {
        deleteTodo(id);
        return;
    }

    todos = todos.map(todo =>
        todo.id === id ? { ...todo, text: text } : todo
    );
    saveToStorage();
    renderTodos();
}

// Clear completed todos
function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    saveToStorage();
    renderTodos();
}

// Filter todos
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// Render todos
function renderTodos() {
    const filteredTodos = getFilteredTodos();
    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        const emptyState = document.createElement('li');
        emptyState.className = 'empty-state';
        emptyState.textContent = currentFilter === 'all'
            ? 'No tasks yet. Add one above!'
            : currentFilter === 'active'
                ? 'No active tasks!'
                : 'No completed tasks!';
        todoList.appendChild(emptyState);
    } else {
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            if (todo.completed) {
                li.classList.add('completed');
            }

            // Checkbox
            const checkbox = document.createElement('div');
            checkbox.className = 'checkbox';
            checkbox.addEventListener('click', () => toggleTodo(todo.id));

            // Text
            const todoText = document.createElement('span');
            todoText.className = 'todo-text';
            todoText.textContent = todo.text;

            // Double-click to edit
            todoText.addEventListener('dblclick', () => {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'edit-input';
                input.value = todo.text;

                li.replaceChild(input, todoText);
                input.focus();
                input.select();

                const saveEdit = () => {
                    editTodo(todo.id, input.value);
                };

                input.addEventListener('blur', saveEdit);
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        saveEdit();
                    }
                });
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        renderTodos();
                    }
                });
            });

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

            li.appendChild(checkbox);
            li.appendChild(todoText);
            li.appendChild(deleteBtn);
            todoList.appendChild(li);
        });
    }

    updateItemsLeft();
}

// Event Listeners
addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

clearCompletedBtn.addEventListener('click', clearCompleted);

// Initial render
renderTodos();
