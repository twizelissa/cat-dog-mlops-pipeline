// Main JavaScript for Home Page

async function loadStatus() {
  try {
    const response = await fetch("/api/status");
    const data = await response.json();

    document.getElementById("modelStatus").textContent = data.model_loaded
      ? "Loaded"
      : "Not Loaded";
    document.getElementById("uptime").textContent = data.uptime;
    document.getElementById("totalPredictions").textContent =
      data.total_predictions;
    document.getElementById("retrainStatus").textContent = data.is_retraining
      ? "In Progress"
      : "Idle";

    const indicator = document.getElementById("statusIndicator");
    indicator.textContent = data.model_loaded ? "Online" : "Offline";
    indicator.className = data.model_loaded
      ? "status-indicator online"
      : "status-indicator offline";
  } catch (error) {
    console.error("Error loading status:", error);
  }
}

async function loadMetrics() {
  try {
    const response = await fetch("/api/metrics");
    const data = await response.json();

    document.getElementById("accuracy").textContent =
      (data.accuracy * 100).toFixed(2) + "%";
    document.getElementById("precision").textContent =
      (data.precision * 100).toFixed(2) + "%";
    document.getElementById("recall").textContent =
      (data.recall * 100).toFixed(2) + "%";
    document.getElementById("f1score").textContent =
      (data.f1_score * 100).toFixed(2) + "%";
    document.getElementById("rocauc").textContent =
      (data.roc_auc * 100).toFixed(2) + "%";
  } catch (error) {
    console.error("Error loading metrics:", error);
  }
}

async function loadDatasetStats() {
  try {
    const response = await fetch("/api/dataset-stats");
    const data = await response.json();

    const trainStats = data.training;
    const testStats = data.testing;

    let trainHTML = "";
    for (const [key, value] of Object.entries(trainStats)) {
      trainHTML += `<p><strong>${key}:</strong> ${value.toLocaleString()}</p>`;
    }
    document.getElementById("trainStats").innerHTML = trainHTML;

    let testHTML = "";
    for (const [key, value] of Object.entries(testStats)) {
      testHTML += `<p><strong>${key}:</strong> ${value.toLocaleString()}</p>`;
    }
    document.getElementById("testStats").innerHTML = testHTML;
  } catch (error) {
    console.error("Error loading dataset stats:", error);
  }
}
