const restricted_sites = new Set();

// Retrieve the blockedWebsitesArray from Chrome storage
chrome.storage.sync.get("blockedWebsitesArray", function (data) {
  const blockedWebsitesArray = data.blockedWebsitesArray || [];
  if (blockedWebsitesArray && blockedWebsitesArray.length > 0) {
    // Add the items from blockedWebsitesArray to the set restricted_sites to avoid duplicates
    blockedWebsitesArray.forEach((item) => {
      // Convert to lowercase and add both versions of the URL
      restricted_sites.add(item.toLowerCase());
      restricted_sites.add(normalizeURL(item.toLowerCase()));
    });

    // Call the function to check if the website should be blocked
    check_if_restricted();
  }
});

// Normalize URL by removing 'www.' from the beginning
function normalizeURL(url) {
  return url.replace(/^www\./i, "");
}

// Check if the current website should be blocked
function shouldBlockWebsite() {
  const currentHostname = normalizeURL(window.location.hostname);
  return restricted_sites.has(currentHostname);
}

// Create the blocked page dynamically
function createBlockedPage() {
  const blockedPage = generateHTML();
  const style = generateSTYLING();
  // Inject the styles and blocked page into the current document
  const head = document.head || document.getElementsByTagName("head")[0];
  head.insertAdjacentHTML("beforeend", style);
  document.body.innerHTML = blockedPage;
}

// Check if the website should be blocked and take appropriate action
function check_if_restricted() {
  if (shouldBlockWebsite()) {
    createBlockedPage();
  }
}

function generateSTYLING() {
  return `
    <style>
    body {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      height: 100vh !important;
      margin: 0 !important;
      background-color: #e0f7fa !important;
      font-family: 'Comic Sans MS', cursive, sans-serif !important;
      text-align: center !important;
    }
    h1 {
      font-size: 4em !important;
      margin: 0 !important;
      color: #00796b !important;
    }
    p {
      font-size: 1.5em !important;
      color: #004d40 !important;
    }
    
    </style>
  `;
}

function generateHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site Blocked</title>
    <link href="https://fonts.googleapis.com/css2?family=Comic+Sans+MS&display=swap" rel="stylesheet">
  </head>
  <body>
    <div class="container">
    <h1>Uh-oh!</h1>
      <p>Looks like you've visited a site you specifically blocked. 🛑</p>
      <p>Remember, you did this to avoid distractions. 😅</p>
      <p>But hey, if you’re here, it means you need a little pep talk!</p>
      <p>Take a deep breath, focus on your goals, and get back to being awesome! 🚀</p>
      <p>Don’t let this sneak peek fool you—keep pushing forward! 💪</p>
    </div>
    </body>
    </html>
  `;
}
