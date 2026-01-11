let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let taskList = document.getElementById("taskList");
let notification = document.getElementById("notification");
let editIndex = null;
let currentFilter = "all";

// Dark mode
const darkToggle = document.getElementById("darkToggle");
if (localStorage.getItem("darkMode") === "on") document.body.classList.add("dark");

darkToggle.onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark") ? "on" : "off");
};

// Notifications permission
if ("Notification" in window) Notification.requestPermission();

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
    let text = document.getElementById("taskInput").value;
    let dueDate = document.getElementById("dueDate").value;
    let priority = document.getElementById("priority").value;
    let reminderTime = document.getElementById("reminderTime").value;

    if (!text) return alert("Enter a task");

    if (editIndex === null) {
        tasks.push({ text, dueDate, priority, completed: false, reminderTime });
    } else {
        tasks[editIndex] = { ...tasks[editIndex], text, dueDate, priority, reminderTime };
        editIndex = null;
        document.querySelector("button").textContent = "Add Task";
    }

    saveTasks();
    displayTasks();

    document.getElementById("taskInput").value = "";
    document.getElementById("dueDate").value = "";
    document.getElementById("priority").value = "normal";
    document.getElementById("reminderTime").value = "";
}

function editTask(index) {
    let task = tasks[index];
    document.getElementById("taskInput").value = task.text;
    document.getElementById("dueDate").value = task.dueDate;
    document.getElementById("priority").value = task.priority;
    document.getElementById("reminderTime").value = task.reminderTime;

    editIndex = index;
    document.querySelector("button").textContent = "Update Task";
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    displayTasks();
}

function toggleComplete(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    displayTasks();
}

function filterTasks(filter) {
    currentFilter = filter;
    displayTasks();
}

function displayTasks() {
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        // Filter logic
        if (currentFilter === "active" && task.completed) return;
        if (currentFilter === "completed" && !task.completed) return;
        if (currentFilter === "high" && task.priority !== "high") return;

        let div = document.createElement("div");
        div.className = "task " +
            (task.priority === "high" ? "high " : "") +
            (task.completed ? "completed" : "");

        div.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""} onclick="toggleComplete(${index})">
      <span>${task.text} (${task.dueDate || "no date"} ${task.reminderTime ? "@" + task.reminderTime : ""})</span>
      <div>
        <button onclick="editTask(${index})">✏️</button>
        <button onclick="deleteTask(${index})">🗑️</button>
      </div>
    `;

        taskList.appendChild(div);
    });
}

function checkReminders() {
    let today = new Date().toISOString().split("T")[0];
    let last = localStorage.getItem("lastReminderDate");

    if (last === today) return;

    let overdue = tasks.filter(t => t.dueDate && t.dueDate < today && !t.completed);

    if (overdue.length === 0) return;

    let text = overdue.map(t => t.text).join(", ");

    if (Notification.permission === "granted") {
        new Notification("⏰ Overdue Tasks", { body: text });
    }

    notification.textContent = "⏰ Overdue Tasks: " + text;
    notification.className = "normal";
    notification.style.display = "block";

    setTimeout(() => notification.style.display = "none", 10000);
    localStorage.setItem("lastReminderDate", today);
}

// Custom reminders by time
function checkCustomReminders() {
    let now = new Date();
    let currentDate = now.toISOString().split("T")[0];
    let currentTime = now.toTimeString().slice(0, 5);

    tasks.forEach((task, index) => {
        if (!task.reminderTime || task.completed) return;

        let lastReminderKey = "lastReminder_" + index;
        let lastReminder = localStorage.getItem(lastReminderKey);

        if (task.dueDate === currentDate && task.reminderTime === currentTime && lastReminder !== currentTime) {
            if (Notification.permission === "granted") {
                new Notification("⏰ Task Reminder", { body: task.text });
            }
            localStorage.setItem(lastReminderKey, currentTime);
        }
    });
}

// Initial load
displayTasks();
checkReminders();

// Run periodic checks
setInterval(checkReminders, 1000 * 60 * 60); // hourly
setInterval(checkCustomReminders, 1000 * 60); // every minute
