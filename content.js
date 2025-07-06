window.addEventListener("message", function (event) {
  if (event.source !== window || !event.data || event.data.type !== "EXCEL_DATA") return;

  const excelData = event.data.payload;
  if (!Array.isArray(excelData) || excelData.length < 2) {
    alert("Invalid Excel format");
    return;
  }

  const header = excelData[0];
  const empNoIndex = header.findIndex(h => h && h.toString().toLowerCase().includes("employee id"));
  const incrementIndex = header.findIndex(h => h && h.toString().toLowerCase().includes("present daily salary"));

  if (empNoIndex === -1 || incrementIndex === -1) {
    alert("Employee ID or Present Daily Salary column not found in Excel.");
    return;
  }

  const bodyRows = excelData.slice(1);
  let updatedCount = 0;
  const missingEmpIds = [];

  bodyRows.forEach(row => {
    const excelEmpId = String(row[empNoIndex]).trim();
    const incrementValue = row[incrementIndex];

    if (!excelEmpId || incrementValue === undefined || incrementValue === "") return;

    const allRows = document.querySelectorAll("table tbody tr");
    let matched = false;

    allRows.forEach(rowEl => {
      const cells = rowEl.querySelectorAll("td");
      if (cells.length < 3) return;

      const webEmpId = cells[2].innerText.trim();

      if (webEmpId === excelEmpId) {
        const inputs = rowEl.querySelectorAll("input");
        inputs.forEach(input => {
          const inputName = input.getAttribute("name") || "";
          if (inputName.startsWith("increment_amount[")) {
            input.value = incrementValue;
            input.style.backgroundColor = "#d0ffd0";
            updatedCount++;
            matched = true;
          }
        });
      }
    });

    if (!matched) {
      missingEmpIds.push(excelEmpId);
    }
  });

  let message = ✅ ${updatedCount} employee(s) updated successfully.;

  if (missingEmpIds.length > 0) {
    message += \n\n❌ ${missingEmpIds.length} ID(s) not found on the website:\n;
    message += missingEmpIds.join(", ");

    navigator.clipboard.writeText(missingEmpIds.join(", "))
      .then(() => {
        message += \n\n📋 Missing IDs copied to clipboard.;
        alert(message);
      })
      .catch(() => {
        message += \n\n⚠️ Failed to copy missing IDs.;
        alert(message);
      });
  } else {
    alert(message);
  }
});
