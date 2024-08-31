// has the script of the code running in the background.

function createContextMenus() {
  chrome.contextMenus.create({
    id: "start-timer",
    title: "Start TImer",
    contexts: ["all"],
  });
}

function createContextMenus() {
  chrome.contextMenus.create({
    id: "reset-timer",
    title: "Reset Timer",
    contexts: ["all"],
  });
}

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  console.log;
});
