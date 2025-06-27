window.addEventListener("message", function (event) {
  if (event.source !== window || !event.data || event.data.type !== "EXCEL_DATA") return;

  const excelData = event.data.payload;
  if (!Array.isArray(excelData) || excelData.length < 2) {
    alert("Invalid Excel format");
    return;
  }

  const header = excelData[0];
  const empNoIndex = header.findIndex(h => h.toString().toLowerCase().includes("employee id"));
  const salaryIndex = header.findIndex(h => h.toString().toLowerCase().includes("present daily salary"));

  if (empNoIndex === -1 || salaryIndex === -1) {
    alert("Employee ID or Daily Salary column not found in Excel.");
    return;
  }

  const bodyRows = excelData.slice(1);
  let updatedCount = 0;

  bodyRows.forEach(row => {
    const excelEmpId = String(row[empNoIndex]).trim();
    const salaryValue = row[salaryIndex];

    if (!excelEmpId || salaryValue === undefined || salaryValue === "") return;

    const allRows = document.querySelectorAll("table tbody tr");

    allRows.forEach(rowEl => {
      const cells = rowEl.querySelectorAll("td");
      if (cells.length < 3) return;

      const webEmpId = cells[2].innerText.trim();

      if (webEmpId === excelEmpId) {
        // Only target the input for Increment Amount
        const inputs = rowEl.querySelectorAll('input');

        inputs.forEach(input => {
          const inputName = input.getAttribute("name") || "";
          if (inputName.startsWith("increment_amount[")) {
            input.value = salaryValue;
            input.style.backgroundColor = "#d0ffd0";
            updatedCount++;
          }
        });
      }
    });
  });

  alert(`✅ ${updatedCount} employee(s) updated successfully.`);
});
