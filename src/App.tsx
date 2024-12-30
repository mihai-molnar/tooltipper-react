import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PhotoAnnotator from './components/PhotoAnnotator';
import ViewMode from './components/ViewMode';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="bottom-center" />
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Photo Annotator
            </h1>
            <Routes>
              <Route path="/" element={<PhotoAnnotator />} />
              <Route path="/view/:shortId" element={<ViewMode />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;