// Campus Connect: browser interactions for the student hub.

// Use localStorage so study tasks remain in this browser after the page is refreshed.
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const clearCompletedButton = document.querySelector("#clear-completed");

let tasks = loadTasks();

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem("campusConnectTasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  } catch (error) {
    // If saved data cannot be read, start with an empty list.
    return [];
  }
}

function saveTasks() {
  localStorage.setItem("campusConnectTasks", JSON.stringify(tasks));
}

function updateTaskCount() {
  const remainingTasks = tasks.filter((task) => !task.completed).length;
  taskCount.textContent = `${remainingTasks} ${remainingTasks === 1 ? "task" : "tasks"} left`;
}

function renderTasks() {
  taskList.replaceChildren();

  if (tasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-state";
    emptyMessage.textContent = "No tasks yet. Add your first study task above.";
    taskList.appendChild(emptyMessage);
    updateTaskCount();
    return;
  }

  tasks.forEach((task) => {
    const listItem = document.createElement("li");
    listItem.className = task.completed ? "task-item completed" : "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.text} as completed`);
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-task";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete task: ${task.text}`);
    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((item) => item.id !== task.id);
      saveTasks();
      renderTasks();
    });

    listItem.append(checkbox, taskText, deleteButton);
    taskList.appendChild(listItem);
  });

  updateTaskCount();
}

taskForm.addEventListener("submit", (event) => {
  // Prevent the browser from reloading the page when the form is submitted.
  event.preventDefault();

  const taskText = taskInput.value.trim();
  if (taskText === "") {
    taskInput.focus();
    return;
  }

  tasks.push({
    id: Date.now(),
    text: taskText,
    completed: false
  });

  saveTasks();
  renderTasks();
  taskForm.reset();
  taskInput.focus();
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

// Submit feedback to the PHP endpoint, which validates and saves it in MySQL.
const feedbackForm = document.querySelector("#feedback-form");
const feedbackStatus = document.querySelector("#feedback-message-status");

feedbackForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!feedbackForm.checkValidity()) {
    feedbackForm.reportValidity();
    return;
  }

  feedbackStatus.textContent = "Submitting feedback...";
  const formData = new FormData(feedbackForm);

  try {
    const response = await fetch("submit_feedback.php", {
      method: "POST",
      body: formData
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Feedback could not be submitted.");
    }

    feedbackStatus.textContent = result.message;
    feedbackForm.reset();
  } catch (error) {
    feedbackStatus.textContent = `${error.message} Make sure you are running this project through XAMPP and have imported database.sql.`;
  }
});

// Display saved study tasks when the page opens.
renderTasks();
