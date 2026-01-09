let addButton = document.getElementById("addButton");
let taskInput = document.getElementById("taskInput");
let taskList = document.getElementById("taskList");
let prioritySelect = document.getElementById("priority");
let dueDateInput = document.getElementById("dueDate");
let notification = document.getElementById("notification");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

/* ---------- SAVE TASKS ---------- */
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* ---------- RENDER TASKS ---------- */
function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        let li = document.createElement("li");

        let span = document.createElement("span");
        span.textContent = `${task.text} (Due: ${task.dueDate})`;
        span.className = task.priority;

        span.onclick = function () {
            this.classList.toggle("completed");
        };

        let deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = function () {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        };

        li.appendChild(span);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}

/* ---------- ADD TASK ---------- */
addButton.onclick = function () {
    let text = taskInput.value.trim();
    let priority = prioritySelect.value;
    let dueDate = dueDateInput.value;

    if (text === "" || dueDate === "") {
        alert("Please enter task and due date");
        return;
    }

    tasks.push({
        text: text,
        priority: priority,
        dueDate: dueDate
    });

    saveTasks();
    renderTasks();

    taskInput.value = "";
    dueDateInput.value = "";
};

/* ---------- ON-SCREEN REMINDER (ONCE PER DAY) ---------- */
function checkReminders() {
    let today = new Date().toISOString().split("T")[0];
    let lastReminderDate = localStorage.getItem("lastReminderDate");

    if (lastReminderDate === today) return;

    let overdueTasks = [];
    let hasHighPriority = false;

    tasks.forEach(task => {
        if (task.dueDate && task.dueDate < today) {
            overdueTasks.push(task.text);
            if (task.priority === "high") {
                hasHighPriority = true;
            }
        }
    });

    if (overdueTasks.length === 0) return;

    notification.textContent =
        (hasHighPriority ? "⚠️ Overdue High Priority Tasks: " : "⏰ Overdue Tasks: ")
        + overdueTasks.join(", ");

    notification.className = hasHighPriority ? "high" : "normal";
    notification.style.display = "block";

    localStorage.setItem("lastReminderDate", today);

    setTimeout(() => {
        notification.style.display = "none";
    }, 10000);
}

renderTasks();
checkReminders();
