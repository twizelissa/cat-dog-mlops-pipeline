// JavaScript for Monitoring Page

let metricsChart = null;
let trainChart = null;
let testChart = null;

async function loadMonitoringData() {
  await loadSystemHealth();
  await loadMetricsChart();
  await loadDatasetCharts();
  await loadMetricsTable();
}

async function loadSystemHealth() {
  try {
    const response = await fetch("/api/status");
    const data = await response.json();

    document.getElementById("uptimeValue").textContent = data.uptime;
    document.getElementById("modelStatusValue").textContent = data.model_loaded
      ? "Loaded"
      : "Not Loaded";
    document.getElementById("totalPredictionsValue").textContent =
      data.total_predictions;
    document.getElementById("totalRetrainsValue").textContent =
      data.total_retrains;

    const indicator = document.getElementById("healthIndicator");
    if (data.model_loaded) {
      indicator.className = "health-indicator online";
      indicator.innerHTML = '<span class="pulse"></span> Online';
    } else {
      indicator.className = "health-indicator offline";
      indicator.innerHTML = "Offline";
    }
  } catch (error) {
    console.error("Error loading system health:", error);
  }
}

async function loadMetricsChart() {
  try {
    const response = await fetch("/api/metrics");
    const data = await response.json();

    const ctx = document.getElementById("metricsChart");

    if (metricsChart) {
      metricsChart.destroy();
    }

    metricsChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Accuracy", "Precision", "Recall", "F1 Score", "ROC-AUC"],
        datasets: [
          {
            label: "Performance Metrics",
            data: [
              data.accuracy * 100,
              data.precision * 100,
              data.recall * 100,
              data.f1_score * 100,
              data.roc_auc * 100,
            ],
            backgroundColor: [
              "rgba(99, 102, 241, 0.7)",
              "rgba(139, 92, 246, 0.7)",
              "rgba(16, 185, 129, 0.7)",
              "rgba(245, 158, 11, 0.7)",
              "rgba(239, 68, 68, 0.7)",
            ],
            borderColor: [
              "rgb(99, 102, 241)",
              "rgb(139, 92, 246)",
              "rgb(16, 185, 129)",
              "rgb(245, 158, 11)",
              "rgb(239, 68, 68)",
            ],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function (value) {
                return value + "%";
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.parsed.y.toFixed(2) + "%";
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error loading metrics chart:", error);
  }
}

async function loadDatasetCharts() {
  try {
    const response = await fetch("/api/dataset-stats");
    const data = await response.json();

    // Training data chart
    const trainCtx = document.getElementById("trainChart");
    if (trainChart) {
      trainChart.destroy();
    }

    const trainData = data.training;
    trainChart = new Chart(trainCtx, {
      type: "doughnut",
      data: {
        labels: Object.keys(trainData).filter((k) => k !== "total"),
        datasets: [
          {
            data: Object.entries(trainData)
              .filter(([k, v]) => k !== "total")
              .map(([k, v]) => v),
            backgroundColor: [
              "rgba(99, 102, 241, 0.7)",
              "rgba(139, 92, 246, 0.7)",
            ],
            borderColor: ["rgb(99, 102, 241)", "rgb(139, 92, 246)"],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });

    // Testing data chart
    const testCtx = document.getElementById("testChart");
    if (testChart) {
      testChart.destroy();
    }

    const testData = data.testing;
    testChart = new Chart(testCtx, {
      type: "doughnut",
      data: {
        labels: Object.keys(testData).filter((k) => k !== "total"),
        datasets: [
          {
            data: Object.entries(testData)
              .filter(([k, v]) => k !== "total")
              .map(([k, v]) => v),
            backgroundColor: [
              "rgba(16, 185, 129, 0.7)",
              "rgba(245, 158, 11, 0.7)",
            ],
            borderColor: ["rgb(16, 185, 129)", "rgb(245, 158, 11)"],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
  } catch (error) {
    console.error("Error loading dataset charts:", error);
  }
}

async function loadMetricsTable() {
  try {
    const response = await fetch("/api/metrics");
    const data = await response.json();

    const metrics = [
      { id: "Accuracy", value: data.accuracy },
      { id: "Precision", value: data.precision },
      { id: "Recall", value: data.recall },
      { id: "F1", value: data.f1_score },
      { id: "ROC", value: data.roc_auc },
    ];

    metrics.forEach((metric) => {
      const valueElement = document.getElementById(`table${metric.id}`);
      const barElement = document.getElementById(`bar${metric.id}`);

      if (valueElement && barElement) {
        valueElement.textContent = (metric.value * 100).toFixed(2) + "%";
        barElement.style.width = metric.value * 100 + "%";
      }
    });
  } catch (error) {
    console.error("Error loading metrics table:", error);
  }
}

// Auto-refresh every 10 seconds
setInterval(loadMonitoringData, 10000);

// Initial load
loadMonitoringData();
