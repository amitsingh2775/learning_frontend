import VideoPlayer from './components/VideoPlayer';

export default function App() {
  return (
    <div className="w-screen h-screen bg-gray-100 overflow-hidden">
      <div className="w-full h-full bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4 border-b">📺 Lecture Video</h1>
        <VideoPlayer />
      </div>
    </div>
  );
}