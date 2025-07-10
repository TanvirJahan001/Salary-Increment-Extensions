chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // Ensure the message is the one we're looking for
  if (message.type !== "EXCEL_DATA") {
    return true; // Ignore other messages but keep channel open for other listeners
  }

  const excelData = message.payload;
  if (!Array.isArray(excelData) || excelData.length < 2) {
    // Send an error response back to the popup
    sendResponse({ error: "Invalid Excel format. Make sure there is at least a header and one data row." });
    return true;
  }

  const header = excelData[0];
<<<<<<< HEAD

  // ========================= MODIFICATION START =========================
  // We will now search for a list of possible keywords to support multiple templates.
  
  const empIdKeywords = ["employee id", "emp id"]; // Keywords for Employee ID
  const salaryKeywords = ["present daily salary", "daily salary", "বর্তমান মজুরী"]; // Keywords for Salary

  // Reusable function to find a column index based on a list of keywords
  const findIndexByKeywords = (headerRow, keywords) => {
    return headerRow.findIndex(h => {
      if (!h) return false;
      const lowerCaseHeader = h.toString().toLowerCase();
      // Check if the header cell contains ANY of our keywords
      return keywords.some(keyword => lowerCaseHeader.includes(keyword));
    });
  };

  const empNoIndex = findIndexByKeywords(header, empIdKeywords);
  const incrementIndex = findIndexByKeywords(header, salaryKeywords);
  
  // ========================== MODIFICATION END ==========================


  if (empNoIndex === -1 || incrementIndex === -1) {
    let errorMessage = "Could not find required columns in Excel.\n";
    if (empNoIndex === -1) {
        errorMessage += 'Missing: "Employee ID" column.\n';
    }
    if (incrementIndex === -1) {
        errorMessage += 'Missing: "Present Daily Salary" column.';
    }
    sendResponse({ error: errorMessage });
=======
  const empNoIndex = header.findIndex(h => h && h.toString().toLowerCase().includes("employee id"));
  const incrementIndex = header.findIndex(h => h && h.toString().toLowerCase().includes("present daily salary"));

  if (empNoIndex === -1 || incrementIndex === -1) {
    sendResponse({ error: "Employee ID or Present Daily Salary column not found in Excel." });
>>>>>>> 789a00e5f956a03c4a46b9aee371576f0e0caee3
    return true;
  }

  const bodyRows = excelData.slice(1);
  let updatedCount = 0;
  const missingEmpIds = [];

  bodyRows.forEach(row => {
    // Make sure the row itself is an array
    if (!Array.isArray(row)) return;

    const excelEmpId = String(row[empNoIndex] || '').trim();
    const incrementValue = row[incrementIndex];

    if (!excelEmpId || incrementValue === undefined || incrementValue === "") return;

    const allRows = document.querySelectorAll("table tbody tr");
    let matched = false;

    allRows.forEach(rowEl => {
      // Check if we have already found a match for this excelEmpId
      if (matched) return;
      
      const cells = rowEl.querySelectorAll("td");
      if (cells.length < 3) return;

      const webEmpId = cells[2].innerText.trim();

      if (webEmpId === excelEmpId) {
        const inputs = rowEl.querySelectorAll("input");
        let inputFoundAndUpdated = false;
        inputs.forEach(input => {
          const inputName = input.getAttribute("name") || "";
          if (inputName.startsWith("increment_amount[")) {
            input.value = incrementValue;
            input.style.backgroundColor = "#d0ffd0";
            inputFoundAndUpdated = true;
          }
        });
        
        if (inputFoundAndUpdated) {
            updatedCount++; // Increment only once per matched employee row
            matched = true;
        }
      }
    });

    if (!matched) {
      missingEmpIds.push(excelEmpId);
    }
  });

  // Send the results back to the popup script
  sendResponse({
    updatedCount: updatedCount,
    missingEmpIds: missingEmpIds
  });

  // IMPORTANT: Return true to indicate that sendResponse will be called asynchronously.
  return true;
<<<<<<< HEAD
});
=======
});
>>>>>>> 789a00e5f956a03c4a46b9aee371576f0e0caee3
