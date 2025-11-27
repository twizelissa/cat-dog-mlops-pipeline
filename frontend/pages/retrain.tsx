import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";
import { Upload, CheckCircle, ArrowLeft, AlertCircle } from "lucide-react";

export default function Retrain() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [training, setTraining] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [trainingResult, setTrainingResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
    setUploadSuccess(false);
    setTrainingResult(null);
  };

  const handleUpload = async () => {
    if (!files) return;

    setUploading(true);
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      await axios.post("/api/upload-training-data", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadSuccess(true);
      alert("Files uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading files");
    } finally {
      setUploading(false);
    }
  };

  const handleRetrain = async () => {
    setTraining(true);
    try {
      const response = await axios.post("/api/retrain");
      setTrainingResult(response.data);
      alert("Model retrained successfully!");
    } catch (error) {
      console.error("Retraining error:", error);
      alert("Error retraining model");
    } finally {
      setTraining(false);
    }
  };

  return (
    <>
      <Head>
        <title>Retrain Model - Cats vs Dogs Classifier</title>
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
                  className="bg-white bg-opacity-20 text-white px-3 py-2 rounded-md text-sm font-medium"
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

          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Upload Training Data
            </h2>

            <div className="mb-6">
              <label className="block w-full">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition-colors cursor-pointer">
                  <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    Multiple images (JPG, PNG)
                  </p>
                  {files && (
                    <p className="mt-4 text-primary-600 font-semibold">
                      {files.length} file(s) selected
                    </p>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={handleUpload}
              disabled={!files || uploading}
              className="w-full bg-gradient-to-r from-primary-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-primary-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                  Uploading...
                </span>
              ) : (
                "Upload Files"
              )}
            </button>

            {uploadSuccess && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <p className="text-green-800">Files uploaded successfully!</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Trigger Retraining
            </h2>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-semibold">Important</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Retraining will take several minutes. The model will use
                  transfer learning from the existing pretrained model and train
                  for 15 epochs.
                </p>
              </div>
            </div>

            <button
              onClick={handleRetrain}
              disabled={training}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {training ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                  Training in progress...
                </span>
              ) : (
                "Start Retraining"
              )}
            </button>

            {trainingResult && (
              <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Training Complete!
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow">
                    <p className="text-sm text-gray-500 mb-1">Final Accuracy</p>
                    <p className="text-2xl font-bold text-green-700">
                      {trainingResult.final_accuracy
                        ? `${(trainingResult.final_accuracy * 100).toFixed(2)}%`
                        : "N/A"}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow">
                    <p className="text-sm text-gray-500 mb-1">Epochs Trained</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {trainingResult.epochs_trained || 15}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
