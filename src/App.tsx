import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PhotoAnnotator from './components/PhotoAnnotator';
import ViewMode from './components/ViewMode';
import { Toaster } from 'react-hot-toast';

function App() {
  const isViewMode = window.location.pathname.includes('/view/');
  return (
    <>
      <Toaster position="bottom-center" />
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Tooltipper
            </h1>
            {!isViewMode && (
              <p className="text-gray-700 text-center mb-8">
                Annotate your photos with tooltips and share them with others. Click on the image to add a tooltip.
              </p>
            )}
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