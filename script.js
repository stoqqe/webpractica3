const STORAGE_KEY = 'todo-tasks';

const form = document.getElementById('add-form');
const input = document.getElementById('task-input');
const errorEl = document.getElementById('error');
const list = document.getElementById('task-list');
const emptyEl = document.getElementById('empty');
const counterEl = document.getElementById('counter');
const clearBtn = document.getElementById('clear-completed');
const filterButtons = document.querySelectorAll('.filter');

let tasks = loadTasks();
let currentFilter = 'all';

function loadTasks() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(text) {
    tasks.push({
        id: Date.now(),
        text: text,
        done: false
    });
    saveTasks();
    render();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.done = !task.done;
        saveTasks();
        render();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
}

function editTask(id, newText) {
    const task = tasks.find(t => t.id === id);
    if (task && newText) {
        task.text = newText;
        saveTasks();
    }
    render();
}

function clearCompleted() {
    tasks = tasks.filter(t => !t.done);
    saveTasks();
    render();
}

function getFilteredTasks() {
    if (currentFilter === 'active') return tasks.filter(t => !t.done);
    if (currentFilter === 'completed') return tasks.filter(t => t.done);
    return tasks;
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task' + (task.done ? ' is-done' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task__checkbox';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', 'Позначити виконаним');
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const span = document.createElement('span');
    span.className = 'task__text';
    span.textContent = task.text;
    span.title = 'Подвійний клік — редагувати';
    span.addEventListener('dblclick', () => startEditing(li, span, task));

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'task__delete';
    delBtn.textContent = '×';
    delBtn.setAttribute('aria-label', 'Видалити завдання');
    delBtn.addEventListener('click', () => deleteTask(task.id));

    li.append(checkbox, span, delBtn);
    return li;
}

function startEditing(li, span, task) {
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'task__edit';
    editInput.value = task.text;
    editInput.maxLength = 200;

    let finished = false;
    const finish = (save) => {
        if (finished) return;
        finished = true;
        if (save) {
            editTask(task.id, editInput.value.trim());
        } else {
            render();
        }
    };

    editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') finish(true);
        if (e.key === 'Escape') finish(false);
    });
    editInput.addEventListener('blur', () => finish(true));

    li.replaceChild(editInput, span);
    editInput.focus();
    editInput.select();
}

function updateCounter() {
    const total = tasks.length;
    const active = tasks.filter(t => !t.done).length;
    counterEl.textContent = `Усього: ${total} · Не виконано: ${active}`;
}

function render() {
    list.innerHTML = '';
    const visible = getFilteredTasks();

    visible.forEach(task => list.appendChild(createTaskElement(task)));

    emptyEl.style.display = visible.length ? 'none' : 'block';
    emptyEl.textContent = tasks.length ? 'Немає завдань у цьому фільтрі' : 'Завдань поки немає';

    clearBtn.disabled = !tasks.some(t => t.done);

    updateCounter();
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();

    if (!text) {
        errorEl.textContent = 'Введіть текст завдання';
        input.focus();
        return;
    }

    errorEl.textContent = '';
    addTask(text);
    input.value = '';
    input.focus();
});

input.addEventListener('input', () => {
    errorEl.textContent = '';
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        currentFilter = btn.dataset.filter;
        render();
    });
});

clearBtn.addEventListener('click', clearCompleted);

render();
