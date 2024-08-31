// Timer Variables
let timer;
let isRunning = false;
let timeRemaining = 1500; // Default 25 minutes

// Function to update badge text
function updateBadgeTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const badgeText = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: "#ff6f61" });
}

// Function to start the timer
function startTimer() {
  if (!isRunning) {
    isRunning = true;
    chrome.storage.local.set({ isRunning: true }); // Save state
    timer = setInterval(() => {
      if (timeRemaining > 0) {
        timeRemaining--;
        updateBadgeTime(timeRemaining);
        chrome.storage.local.set({ timeRemaining: timeRemaining });
      } else {
        clearInterval(timer);
        isRunning = false;
        chrome.storage.local.set({ isRunning: false }); // Save state
        chrome.action.setBadgeText({ text: "" });
        chrome.notifications.create({
          type: "basic",
          iconUrl: "images/icon-128.png",
          title: "POMODiFY",
          message: "Time's up! Take a break.",
        });
      }
    }, 1000);
  }
}

// Function to pause the timer
function pauseTimer() {
  if (isRunning) {
    clearInterval(timer);
    isRunning = false;
    chrome.storage.local.set({ timeRemaining: timeRemaining });
    chrome.action.setBadgeText({ text: "" });
  }
}

// Function to reset the timer
function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  timeRemaining = 1500;
  chrome.storage.local.set({ timeRemaining: timeRemaining, isRunning: false });
  chrome.action.setBadgeText({ text: "" });
}

// Function to toggle the timer state
function toggleTimer() {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

// Message listener for popup actions
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTimer") {
    startTimer();
  } else if (request.action === "pauseTimer") {
    pauseTimer();
  } else if (request.action === "resetTimer") {
    resetTimer();
  } else if (request.action === "toggleTimer") {
    toggleTimer();
    sendResponse({ isRunning: isRunning });
  } else if (request.action === "getTimerState") {
    sendResponse({ timeRemaining: timeRemaining, isRunning: isRunning });
  }
});

// Initialize badge and timer state on extension startup
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["timeRemaining"], (result) => {
    timeRemaining = result.timeRemaining || 1500;
    updateBadgeTime(timeRemaining);
  });
});
