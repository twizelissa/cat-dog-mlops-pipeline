// JavaScript for Retrain Page

let selectedFiles = [];

// File input change handler
document
  .getElementById("multiImageInput")
  .addEventListener("change", function (e) {
    const files = Array.from(e.target.files);
    handleMultipleFiles(files);
  });

// Drag and drop handlers
const uploadArea = document.getElementById("multiUploadArea");

uploadArea.addEventListener("dragover", function (e) {
  e.preventDefault();
  uploadArea.style.borderColor = "var(--primary-color)";
});

uploadArea.addEventListener("dragleave", function (e) {
  e.preventDefault();
  uploadArea.style.borderColor = "var(--border-color)";
});

uploadArea.addEventListener("drop", function (e) {
  e.preventDefault();
  uploadArea.style.borderColor = "var(--border-color)";

  const files = Array.from(e.dataTransfer.files).filter((f) =>
    f.type.startsWith("image/")
  );
  handleMultipleFiles(files);
});

function handleMultipleFiles(files) {
  selectedFiles = files;
  displayFileList();
}

function displayFileList() {
  const fileList = document.getElementById("fileList");
  const filesContainer = document.getElementById("filesContainer");
  const fileCount = document.getElementById("fileCount");

  if (selectedFiles.length === 0) {
    fileList.style.display = "none";
    return;
  }

  fileCount.textContent = selectedFiles.length;

  let html = '<ul style="list-style: none; padding: 0;">';
  selectedFiles.forEach((file, index) => {
    html += `
            <li style="padding: 0.5rem; border-bottom: 1px solid var(--border-color);">
                <span>${file.name}</span>
                <span style="float: right; color: var(--text-secondary);">
                    ${(file.size / 1024).toFixed(1)} KB
                </span>
            </li>
        `;
  });
  html += "</ul>";

  filesContainer.innerHTML = html;
  fileList.style.display = "block";
}

function clearFiles() {
  selectedFiles = [];
  document.getElementById("fileList").style.display = "none";
  document.getElementById("multiImageInput").value = "";
}

// Upload button handler
document
  .getElementById("uploadBtn")
  .addEventListener("click", async function () {
    if (selectedFiles.length === 0) {
      showError("Please select images first");
      return;
    }

    const className = document.querySelector(
      'input[name="class"]:checked'
    ).value;

    showLoading("Uploading files...");
    hideMessages();

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch(
        `/api/upload-training-data?class_name=${className}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      showSuccess(
        `Successfully uploaded ${result.uploaded} images for ${className}`
      );
      updateUploadHistory(result);
      clearFiles();
    } catch (error) {
      showError("Error uploading files: " + error.message);
    } finally {
      hideLoading();
    }
  });

// Retrain button handler
document
  .getElementById("retrainBtn")
  .addEventListener("click", async function () {
    if (
      !confirm(
        "Are you sure you want to start retraining? This process may take several minutes."
      )
    ) {
      return;
    }

    showLoading("Starting retraining process...");
    hideMessages();

    try {
      const response = await fetch("/api/retrain", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to start retraining");
      }

      const result = await response.json();
      showSuccess(
        "Retraining started successfully. This will continue in the background."
      );

      // Start polling for retrain status
      pollRetrainStatus();
    } catch (error) {
      showError("Error starting retraining: " + error.message);
    } finally {
      hideLoading();
    }
  });

async function pollRetrainStatus() {
  const checkStatus = async () => {
    try {
      const response = await fetch("/api/retrain-status");
      const data = await response.json();

      const indicator = document.getElementById("retrainIndicator");
      const message = document.getElementById("retrainMessage");

      if (data.is_retraining) {
        indicator.textContent = "In Progress";
        indicator.style.background = "#fef3c7";
        indicator.style.color = "#f59e0b";
        message.textContent = "Model is currently being retrained...";

        setTimeout(checkStatus, 5000);
      } else {
        indicator.textContent = "Completed";
        indicator.style.background = "#d1fae5";
        indicator.style.color = "#10b981";
        message.textContent = "Retraining completed successfully";
      }
    } catch (error) {
      console.error("Error checking retrain status:", error);
    }
  };

  checkStatus();
}

function updateUploadHistory(result) {
  const historyContent = document.getElementById("historyContent");
  const timestamp = new Date().toLocaleString();

  const entry = document.createElement("div");
  entry.style.padding = "1rem";
  entry.style.marginBottom = "0.5rem";
  entry.style.background = "var(--bg-color)";
  entry.style.borderRadius = "0.5rem";
  entry.innerHTML = `
        <p><strong>Class:</strong> ${result.class}</p>
        <p><strong>Files Uploaded:</strong> ${result.uploaded}</p>
        <p><strong>Time:</strong> ${timestamp}</p>
    `;

  if (historyContent.querySelector(".empty-state")) {
    historyContent.innerHTML = "";
  }

  historyContent.insertBefore(entry, historyContent.firstChild);
}

function showLoading(text) {
  document.getElementById("loadingText").textContent = text;
  document.getElementById("loadingOverlay").style.display = "flex";
}

function hideLoading() {
  document.getElementById("loadingOverlay").style.display = "none";
}

function showSuccess(message) {
  const successDiv = document.getElementById("successMessage");
  successDiv.textContent = message;
  successDiv.style.display = "block";
  setTimeout(() => (successDiv.style.display = "none"), 5000);
}

function showError(message) {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}

function hideMessages() {
  document.getElementById("successMessage").style.display = "none";
  document.getElementById("errorMessage").style.display = "none";
}

// Load retrain status on page load
async function loadRetrainStatus() {
  try {
    const response = await fetch("/api/retrain-status");
    const data = await response.json();

    const indicator = document.getElementById("retrainIndicator");
    const message = document.getElementById("retrainMessage");

    if (data.is_retraining) {
      indicator.textContent = "In Progress";
      indicator.style.background = "#fef3c7";
      indicator.style.color = "#f59e0b";
      message.textContent = "Model is currently being retrained...";
      pollRetrainStatus();
    } else {
      indicator.textContent = "Idle";
      message.textContent = "Ready to retrain with new data";
    }
  } catch (error) {
    console.error("Error loading retrain status:", error);
  }
}

loadRetrainStatus();
