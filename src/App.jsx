import { useState, useEffect } from 'react';
import './index.css';

function App() {
    const [url, setUrl] = useState('');
    const [x, setX] = useState(8);
    const [s, setS] = useState(8);
    const [progress, setProgress] = useState(0);
    const [output, setOutput] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        window.electronAPI.onProgress(({ progress, output }) => {
            setProgress(progress);
            setOutput(output);
            if (progress >= 100) setIsDownloading(false);
        });
    }, []);

    const handleDownload = async () => {
        if (!url) return alert('Please enter a URL');
        setIsDownloading(true);
        setOutput(''); // 清空之前的輸出
        await window.electronAPI.startDownload({ url, x, s });
    };

    const handleTerminate = async () => {
        await window.electronAPI.terminateDownload();
        setIsDownloading(false);
        setProgress(0);
        setOutput(() =>'\nDownload terminated');
    };

    return (
        <div className="w-screen h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full flex-1 flex flex-col">
                <h1 className="text-2xl font-bold mb-4 text-center">Aria2</h1>
                <div className="text-s text-gray-500 text-center mb-4">
                    <a
                        href="https://github.com/RadeLx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-600 transition-colors"
                    >
                        @RadeLx
                    </a>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">URL</label>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="mt-1 p-2 w-full border rounded-md"
                        placeholder="https://example.com/file"
                        disabled={isDownloading}
                    />
                </div>
                <div className="mb-4 flex space-x-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Max Connections (-x)</label>
                        <input
                            type="number"
                            value={x}
                            onChange={(e) => setX(e.target.value)}
                            className="mt-1 p-2 w-full border rounded-md"
                            min="1"
                            max="16"
                            disabled={isDownloading}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Split (-s)</label>
                        <input
                            type="number"
                            value={s}
                            onChange={(e) => setS(e.target.value)}
                            className="mt-1 p-2 w-full border rounded-md"
                            min="1"
                            max="16"
                            disabled={isDownloading}
                        />
                    </div>
                </div>
                <div className="flex space-x-4 mb-4">
                    <button
                        onClick={handleDownload}
                        className={`flex-1 py-2 px-4 rounded-md text-white ${isDownloading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        disabled={isDownloading}
                    >
                        {isDownloading ? 'Downloading...' : 'Start Download'}
                    </button>
                    <button
                        onClick={handleTerminate}
                        className="flex-1 py-2 px-4 rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                        Terminate
                    </button>
                </div>
                <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700">Progress: {progress}%</label>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                            className="bg-blue-600 h-4 rounded-full"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
                <div className="mt-2 text-xs text-gray-600 max-h-40 overflow-y-auto bg-gray-50 p-2 rounded min-h-[calc(1.5em*3)] max-h-[calc(1.5em*3)] overflow-y-auto">
                    <pre>{output || 'No output'}</pre>
                </div>
            </div>
        </div>
    );
}

export default App;