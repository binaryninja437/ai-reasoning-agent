
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageInput } from './components/ImageInput';
import { CameraView } from './components/CameraView';
import { ResultDisplay } from './components/ResultDisplay';
import { getAnswerFromImage } from './services/geminiService';
import { ImagePreview } from './components/ImagePreview';

type AppState = {
  image: { data: string; mimeType: string; } | null;
  isLoading: boolean;
  result: string | null;
  error: string | null;
  isCameraOpen: boolean;
};

function App() {
  const [state, setState] = useState<AppState>({
    image: null,
    isLoading: false,
    result: null,
    error: null,
    isCameraOpen: false,
  });

  const handleImageSelect = (imageData: string, mimeType: string) => {
    setState({
      ...state,
      image: { data: imageData, mimeType },
      result: null,
      error: null,
      isCameraOpen: false
    });
  };

  const handleGetAnswer = useCallback(async () => {
    if (!state.image) return;

    setState(prevState => ({ ...prevState, isLoading: true, result: null, error: null }));

    try {
      const base64Data = state.image.data.split(',')[1];
      const answer = await getAnswerFromImage(base64Data, state.image.mimeType);
      setState(prevState => ({ ...prevState, result: answer, isLoading: false }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setState(prevState => ({ ...prevState, error: `Failed to get answer: ${errorMessage}`, isLoading: false }));
    }
  }, [state.image]);

  const handleReset = () => {
    setState({
      image: null,
      isLoading: false,
      result: null,
      error: null,
      isCameraOpen: false,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-3xl mx-auto">
        <Header />
        <main className="mt-8">
          {!state.image && (
            <ImageInput
              onImageSelect={handleImageSelect}
              onOpenCamera={() => setState(prevState => ({ ...prevState, isCameraOpen: true }))}
            />
          )}

          {state.isCameraOpen && (
            <CameraView
              onCapture={handleImageSelect}
              onClose={() => setState(prevState => ({ ...prevState, isCameraOpen: false }))}
            />
          )}

          {state.image && (
            <div className="flex flex-col items-center gap-6">
              <ImagePreview imageSrc={state.image.data} />
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={handleGetAnswer}
                  disabled={state.isLoading}
                  className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-cyan-500/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 glow-button"
                >
                  {state.isLoading ? '🤔 Thinking...' : '✨ Get Answer'}
                </button>
                <button
                  onClick={handleReset}
                  disabled={state.isLoading}
                  className="px-10 py-4 glass-effect text-cyan-100 font-bold rounded-2xl shadow-xl hover:bg-blue-900/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
                >
                  🔄 Start Over
                </button>
              </div>
            </div>
          )}
          
          <ResultDisplay
            isLoading={state.isLoading}
            result={state.result}
            error={state.error}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
