import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { processCSVData, DashboardData } from './utils/dataProcessor';
import { Loader2 } from 'lucide-react';

function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      setError('');
      
      const [processedData] = await Promise.all([
        processCSVData(file),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);
      
      setData(processedData);
    } catch (err) {
      setError((err as Error).message || 'Error processing file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative w-full overflow-hidden">
      
      <main className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 xl:py-12 max-w-[100rem] mx-auto min-h-screen flex flex-col">
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] animate-in fade-in zoom-in zoom-out duration-700">
            <div className="relative w-32 h-32 flex items-center justify-center mb-8">
              <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse"></div>
              {/* Outer spinning ring */}
              <div className="absolute inset-0 rounded-full border-[3px] border-t-indigo-400 border-r-indigo-400/30 border-b-indigo-400/10 border-l-indigo-400/30 animate-[spin_3s_linear_infinite]"></div>
              {/* Inner spinning ring */}
              <div className="absolute inset-2 rounded-full border-[3px] border-t-purple-400/10 border-r-purple-400 border-b-purple-400/30 border-l-purple-400/10 animate-[spin_2s_linear_infinite_reverse]"></div>
              
              <div className="glass-panel p-4 rounded-xl relative z-10 border border-indigo-400/30 shadow-[0_0_30px_rgba(99,102,241,0.2)] bg-slate-900/80">
                <Loader2 className="w-10 h-10 text-indigo-300 animate-spin" />
              </div>
            </div>
            <div className="text-center space-y-3">
              <p className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-indigo-200 uppercase">Processing Dataset</p>
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-indigo-400/90">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                <span className="tracking-wide">Running descriptive & predictive models...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="glass-panel border-red-500/30 text-red-200 p-6 rounded-2xl max-w-2xl mx-auto my-12 text-center shadow-lg shadow-red-500/10">
            <p className="font-semibold text-lg mb-2 text-red-400">Failed to process dataset</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        )}

        {!loading && !data && (
          <div className="flex-1 flex flex-col justify-center">
            <FileUpload onFileUpload={handleFileUpload} />
          </div>
        )}

        {!loading && data && (
          <div className="flex-1 w-full animate-in fade-in duration-1000">
            <Dashboard data={data} onReset={() => setData(null)} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
