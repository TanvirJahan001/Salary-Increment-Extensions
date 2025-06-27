document.getElementById("process-btn").addEventListener("click", () => {
  const fileInput = document.getElementById("excel-file");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please upload an Excel file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Send to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: sendDataToContent,
        args: [jsonData]
      });
    });
  };

  reader.readAsArrayBuffer(file);
});

function sendDataToContent(excelData) {
  window.postMessage({ type: "EXCEL_DATA", payload: excelData }, "*");
}
