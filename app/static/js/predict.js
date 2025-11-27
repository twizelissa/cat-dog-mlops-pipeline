// JavaScript for Prediction Page

let selectedFile = null;

// File input change handler
document.getElementById("imageInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    handleFileSelect(file);
  }
});

// Drag and drop handlers
const uploadArea = document.getElementById("uploadArea");

uploadArea.addEventListener("dragover", function (e) {
  e.preventDefault();
  uploadArea.style.borderColor = "var(--primary-color)";
  uploadArea.style.background = "#f1f5f9";
});

uploadArea.addEventListener("dragleave", function (e) {
  e.preventDefault();
  uploadArea.style.borderColor = "var(--border-color)";
  uploadArea.style.background = "var(--card-bg)";
});

uploadArea.addEventListener("drop", function (e) {
  e.preventDefault();
  uploadArea.style.borderColor = "var(--border-color)";
  uploadArea.style.background = "var(--card-bg)";

  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    handleFileSelect(file);
  }
});

function handleFileSelect(file) {
  selectedFile = file;

  // Show preview
  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById("imagePreview").src = e.target.result;
    document.getElementById("uploadArea").style.display = "none";
    document.getElementById("previewContainer").style.display = "block";
    document.getElementById("resultContainer").style.display = "none";
  };
  reader.readAsDataURL(file);
}

// Predict button handler
document
  .getElementById("predictBtn")
  .addEventListener("click", async function () {
    if (!selectedFile) {
      showError("Please select an image first");
      return;
    }

    showLoading(true);
    hideError();

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const result = await response.json();
      displayResult(result);
    } catch (error) {
      showError("Error making prediction: " + error.message);
    } finally {
      showLoading(false);
    }
  });

function displayResult(result) {
  document.getElementById("predictedClass").textContent =
    result.predicted_class.charAt(0).toUpperCase() +
    result.predicted_class.slice(1);
  document.getElementById("confidence").textContent =
    result.confidence_percentage;
  document.getElementById("probability").textContent =
    result.probability.toFixed(4);
  document.getElementById("timestamp").textContent = new Date(
    result.timestamp
  ).toLocaleString();

  // Update confidence bar
  const confidenceFill = document.getElementById("confidenceFill");
  confidenceFill.style.width = result.confidence * 100 + "%";

  // Show result
  document.getElementById("resultContainer").style.display = "block";

  // Scroll to result
  document.getElementById("resultContainer").scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
}

function resetPrediction() {
  selectedFile = null;
  document.getElementById("uploadArea").style.display = "block";
  document.getElementById("previewContainer").style.display = "none";
  document.getElementById("resultContainer").style.display = "none";
  document.getElementById("imageInput").value = "";
}

function showLoading(show) {
  document.getElementById("loadingOverlay").style.display = show
    ? "flex"
    : "none";
}

function showError(message) {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}

function hideError() {
  document.getElementById("errorMessage").style.display = "none";
}
