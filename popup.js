let lastMissingIds = []; // Store the missing IDs from the last run

const processBtn = document.getElementById("process-btn");
const copyBtn = document.getElementById("copy-missing-btn");
const fileInput = document.getElementById("excel-file");
const statusContainer = document.getElementById("status-container");

// --- Process Button Event Listener ---
processBtn.addEventListener("click", () => {
  if (!fileInput.files || fileInput.files.length === 0) {
    updateStatus(" Please select an Excel file first.", "error");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Send data to the active tab's content script
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length === 0 || !tabs[0].id) {
        updateStatus(" Could not find an active tab. Please ensure you are on a webpage.", "error");
        return;
      }
      
      updateStatus("Processing...", "info");
      copyBtn.style.display = "none"; // Hide copy button during processing

      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "EXCEL_DATA", payload: excelData },
        handleResponse // The function to call when content script replies
      );
    });
  };

  reader.onerror = function() {
    updateStatus(" Error reading the file.", "error");
  };

  reader.readAsArrayBuffer(file);
});

// --- Copy Button Event Listener ---
copyBtn.addEventListener("click", () => {
  if (lastMissingIds.length > 0) {
    navigator.clipboard.writeText(lastMissingIds.join(", "))
      .then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = "Copy Missing IDs";
        }, 2000); // Reset text after 2 seconds
      })
      .catch(() => {
        updateStatus(" Failed to copy IDs.", "error");
      });
  }
});

// --- Function to handle the response from content.js ---
function handleResponse(response) {
  // chrome.runtime.lastError is set if the content script did not respond.
  if (chrome.runtime.lastError || !response) {
    updateStatus(
      " Failed to communicate with the page.\n\nAre you on the correct website? Please refresh the page and try again.", 
      "error"
    );
    return;
  }
  
  // Check for a specific error message from the content script
  if (response.error) {
    updateStatus(` ${response.error}`, "error");
    return;
  }

  const { updatedCount, missingEmpIds } = response;
  lastMissingIds = missingEmpIds || []; // Update the global variable

  let message = ` ${updatedCount} employee(s) updated successfully.`;

  if (lastMissingIds.length > 0) {
    message += `\n\n ${lastMissingIds.length} ID(s) not found on the website.`;
    copyBtn.style.display = "block"; // Show the copy button
  } else {
    copyBtn.style.display = "none"; // Hide copy button if no missing IDs
  }

  updateStatus(message, "success");
}

// --- Helper to update status message in the popup ---
function updateStatus(message, type) {
  statusContainer.style.display = "block";
  statusContainer.textContent = message;
  
  if (type === "error") {
    statusContainer.style.color = "#c0392b";
  } else {
    statusContainer.style.color = "#333";
  }
}