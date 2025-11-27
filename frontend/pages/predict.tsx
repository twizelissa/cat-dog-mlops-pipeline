import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";
import { Upload, Image as ImageIcon, ArrowLeft } from "lucide-react";

export default function Predict() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setPrediction(null);
    }
  };

  const handlePredict = async () => {
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("/api/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPrediction(response.data);
    } catch (error) {
      console.error("Prediction error:", error);
      alert("Error making prediction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Predict - Cats vs Dogs Classifier</title>
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
                  className="bg-white bg-opacity-20 text-white px-3 py-2 rounded-md text-sm font-medium"
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

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Make a Prediction
            </h2>

            <div className="mb-8">
              <label className="block w-full">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition-colors cursor-pointer">
                  {preview ? (
                    <div>
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg shadow-md"
                      />
                      <p className="mt-4 text-sm text-gray-600">
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg text-gray-600 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">
                        JPG, PNG (max 10MB)
                      </p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={handlePredict}
              disabled={!selectedFile || loading}
              className="w-full bg-gradient-to-r from-primary-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-primary-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                  Analyzing...
                </span>
              ) : (
                "Predict"
              )}
            </button>

            {prediction && (
              <div className="mt-8 bg-gradient-to-br from-primary-50 to-purple-50 rounded-lg p-6 border-2 border-primary-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Prediction Results
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow">
                    <p className="text-sm text-gray-500 mb-1">Class</p>
                    <p className={`text-2xl font-bold ${
                      prediction.class === 'unknown' 
                        ? 'text-orange-600' 
                        : prediction.class === 'cats' 
                        ? 'text-blue-600' 
                        : 'text-green-600'
                    }`}>
                      {prediction.class === 'unknown' 
                        ? (prediction.message || 'Not a Cat or Dog')
                        : prediction.class === 'cats' 
                        ? 'Cat' 
                        : 'Dog'}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow">
                    <p className="text-sm text-gray-500 mb-1">Confidence</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {(prediction.confidence * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div className="mt-4 bg-white rounded-lg p-4 shadow">
                  <p className="text-sm text-gray-500 mb-2">Prediction Time</p>
                  <p className="text-lg font-semibold text-gray-700">
                    {(prediction.prediction_time * 1000).toFixed(2)} ms
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
