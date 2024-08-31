// DOM Elements
const timerDisplay = document.getElementById("timer-display");
const startButton = document.getElementById("start-timer");
const pauseButton = document.getElementById("pause-timer");
const resetButton = document.getElementById("reset-timer");

const taskInput = document.getElementById("new-task");
const addTaskButton = document.getElementById("add-task");
const taskList = document.getElementById("task-list");
const websiteInput = document.getElementById("websiteInput");
const blockButton = document.getElementById("blockButton");
const blockedWebsitesDiv = document.getElementById("blockedWebsitesDiv");
const removeBlockSection = document.querySelector(".remove-block");

// Functions to interact with the background script
function updateTimerDisplay(timeRemaining) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function getTimerState() {
  chrome.runtime.sendMessage({ action: "getTimerState" }, (response) => {
    updateTimerDisplay(response.timeRemaining);
    if (response.isRunning) {
      pauseButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
    } else {
      pauseButton.innerHTML = '<i class="fas fa-play"></i> Resume';
    }
  });
}

// Call this function when the popup is loaded
document.addEventListener("DOMContentLoaded", () => {
  getTimerState();
  loadTasks(); // Load tasks from local storage
  updateBlockedWebsitesSection(); // Update blocked websites on load
});

// Timer control event listeners
startButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "startTimer" });
  pauseButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
});

pauseButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "toggleTimer" }, (response) => {
    if (response.isRunning) {
      pauseButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
    } else {
      pauseButton.innerHTML = '<i class="fas fa-play"></i> Resume';
    }
  });
});

resetButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "resetTimer" });
  pauseButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
});

// Function to save tasks to local storage
function saveTasks() {
  const tasks = [];
  taskList.querySelectorAll("li").forEach((taskItem) => {
    tasks.push(taskItem.textContent.replace(/\s*[\u{1F5D1}]\s*$/, "")); // Remove delete button icon
  });
  chrome.storage.local.set({ tasks: tasks });
}

// Function to load tasks from local storage
function loadTasks() {
  chrome.storage.local.get("tasks", (data) => {
    if (data.tasks) {
      data.tasks.forEach((task) => {
        createTaskElement(task);
      });
    }
  });
}

// Function to create a new task element
function createTaskElement(task) {
  const taskItem = document.createElement("li");
  taskItem.textContent = task;
  const deleteButton = document.createElement("button");
  deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
  deleteButton.addEventListener("click", () => {
    taskList.removeChild(taskItem);
    saveTasks(); // Save tasks after removing one
  });
  taskItem.appendChild(deleteButton);
  taskList.appendChild(taskItem);
}

// Function to add a new task
function addTask() {
  if (taskInput.value.trim() !== "") {
    createTaskElement(taskInput.value);
    taskInput.value = "";
    saveTasks(); // Save tasks after adding a new one
  }
}

addTaskButton.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

// Function to update blocked websites section
function updateBlockedWebsitesSection() {
  chrome.storage.sync.get("blockedWebsitesArray", (data) => {
    const blockedWebsitesArray = data.blockedWebsitesArray || [];
    blockedWebsitesDiv.innerHTML = ""; // Clear current content
    if (blockedWebsitesArray.length > 0) {
      removeBlockSection.style.display = "block";
      blockedWebsitesArray.forEach((website) => {
        const websiteDiv = document.createElement("div");
        websiteDiv.className = "websiteDivText";
        websiteDiv.textContent = website;
        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteButton.addEventListener("click", () => {
          removeWebsite(website);
        });
        websiteDiv.appendChild(deleteButton);
        blockedWebsitesDiv.appendChild(websiteDiv);
      });
    } else {
      removeBlockSection.style.display = "none";
    }
  });
}

// Function to get website input and add to the block list
function getWebsiteInput() {
  const website = websiteInput.value.trim();
  if (website === "") {
    alert("Please enter a website to block.");
  } else {
    chrome.storage.sync.get("blockedWebsitesArray", (data) => {
      const blockedWebsitesArray = data.blockedWebsitesArray || [];
      if (!blockedWebsitesArray.includes(website)) {
        blockedWebsitesArray.push(website);
        chrome.storage.sync.set(
          { blockedWebsitesArray: blockedWebsitesArray },
          () => {
            updateBlockedWebsitesSection();
            websiteInput.value = ""; // Clear the input field
          }
        );
      } else {
        alert("This website is already blocked.");
      }
    });
  }
}

// Function to remove a website from the block list
function removeWebsite(website) {
  chrome.storage.sync.get("blockedWebsitesArray", (data) => {
    const blockedWebsitesArray = data.blockedWebsitesArray || [];
    const updatedArray = blockedWebsitesArray.filter(
      (site) => site !== website
    );
    chrome.storage.sync.set({ blockedWebsitesArray: updatedArray }, () => {
      updateBlockedWebsitesSection();
    });
  });
}

// Event listener for block button
blockButton.addEventListener("click", getWebsiteInput);
