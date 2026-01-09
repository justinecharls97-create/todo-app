let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let taskList = document.getElementById("taskList");
let notification = document.getElementById("notification");

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

    tasks.push({ text, dueDate, priority });
    saveTasks();
    displayTasks();

    document.getElementById("taskInput").value = "";
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
        div.className = "task " + (task.priority === "high" ? "high" : "");

        div.innerHTML = `
      <span>${task.text} (${task.dueDate || "no date"})</span>
      <button onclick="deleteTask(${index})">Delete</button>
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

displayTasks();
checkReminders();
setInterval(checkReminders, 1000 * 60 * 60);
