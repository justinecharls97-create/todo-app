let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let taskList = document.getElementById("taskList");
let notification = document.getElementById("notification");
let editIndex = null;

/* Notification permission */
if ("Notification" in window) {
    Notification.requestPermission();
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
    let text = document.getElementById("taskInput").value;
    let dueDate = document.getElementById("dueDate").value;
    let priority = document.getElementById("priority").value;

    if (!text) return alert("Enter a task");

    if (editIndex === null) {
        // Add new task
        tasks.push({ text, dueDate, priority, completed: false });
    } else {
        // Update existing task
        tasks[editIndex] = {
            ...tasks[editIndex],
            text,
            dueDate,
            priority
        };
        editIndex = null;
        document.querySelector("button").textContent = "Add Task";
    }

    saveTasks();
    displayTasks();

    document.getElementById("taskInput").value = "";
    document.getElementById("dueDate").value = "";
    document.getElementById("priority").value = "normal";
}


function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    displayTasks();
}

function displayTasks() {
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        let div = document.createElement("div");

        div.className = "task " +
            (task.priority === "high" ? "high " : "") +
            (task.completed ? "completed" : "");

        div.innerHTML = `
      <input type="checkbox"
        ${task.completed ? "checked" : ""}
        onclick="toggleComplete(${index})">

      <span>${task.text} (${task.dueDate || "no date"})</span>

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

    let overdue = tasks.filter(t => t.dueDate && t.dueDate < today);

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
function editTask(index) {
    let task = tasks[index];

    document.getElementById("taskInput").value = task.text;
    document.getElementById("dueDate").value = task.dueDate;
    document.getElementById("priority").value = task.priority;

    editIndex = index;
    document.querySelector("button").textContent = "Update Task";
}
function toggleComplete(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    displayTasks();
}

displayTasks();
checkReminders();
setInterval(checkReminders, 1000 * 60 * 60);
