import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";
import { Activity, TrendingUp, Database, Clock } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Home() {
  const [metrics, setMetrics] = useState<any>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [uptime, setUptime] = useState("0h 0m");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [metricsRes, statusRes] = await Promise.all([
        axios.get("/api/metrics"),
        axios.get("/health"),
      ]);
      setMetrics(metricsRes.data);
      setModelInfo(statusRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const calculateUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const classDistributionData = [
    { name: "Cats", value: 4000, color: "#0ea5e9" },
    { name: "Dogs", value: 4005, color: "#8b5cf6" },
  ];

  const metricsData = metrics
    ? [
        { name: "Accuracy", value: (metrics.accuracy * 100).toFixed(2) },
        { name: "Precision", value: (metrics.precision * 100).toFixed(2) },
        { name: "Recall", value: (metrics.recall * 100).toFixed(2) },
        { name: "F1-Score", value: (metrics.f1_score * 100).toFixed(2) },
        { name: "ROC-AUC", value: (metrics.roc_auc * 100).toFixed(2) },
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Cats vs Dogs Classifier - Dashboard</title>
        <meta name="description" content="ML Model Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <nav className="gradient-bg shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-white text-2xl font-bold">
                  Cats vs Dogs Classifier
                </h1>
              </div>
              <div className="flex space-x-4">
                <Link
                  href="/"
                  className="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/predict"
                  className="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Predict
                </Link>
                <Link
                  href="/retrain"
                  className="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Retrain
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Model Status
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {modelInfo?.status || "Online"}
                  </p>
                </div>
                <Activity className="h-12 w-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Accuracy</p>
                  <p className="text-2xl font-bold text-primary-600 mt-1">
                    {metrics
                      ? `${(metrics.accuracy * 100).toFixed(2)}%`
                      : "N/A"}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-primary-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Total Samples
                  </p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    10,028
                  </p>
                </div>
                <Database className="h-12 w-12 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Uptime</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {uptime}
                  </p>
                </div>
                <Clock className="h-12 w-12 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Model Performance Metrics
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Training Dataset Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={classDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {classDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Model Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-l-4 border-primary-500 pl-4">
                <p className="text-sm text-gray-500">Architecture</p>
                <p className="text-lg font-semibold text-gray-800">
                  VGG16 Transfer Learning
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="text-sm text-gray-500">Input Size</p>
                <p className="text-lg font-semibold text-gray-800">
                  224 x 224 x 3
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm text-gray-500">Classes</p>
                <p className="text-lg font-semibold text-gray-800">
                  Cats, Dogs
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/predict"
                className="bg-white hover:bg-primary-50 border-2 border-primary-200 rounded-lg p-6 text-center transition-all card-hover"
              >
                <h3 className="text-lg font-semibold text-primary-700 mb-2">
                  Make a Prediction
                </h3>
                <p className="text-gray-600 text-sm">
                  Upload an image to classify
                </p>
              </Link>
              <Link
                href="/retrain"
                className="bg-white hover:bg-purple-50 border-2 border-purple-200 rounded-lg p-6 text-center transition-all card-hover"
              >
                <h3 className="text-lg font-semibold text-purple-700 mb-2">
                  Retrain Model
                </h3>
                <p className="text-gray-600 text-sm">
                  Upload new data and retrain
                </p>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
