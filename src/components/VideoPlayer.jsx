import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { videoList } from '../data';

const USER_ID = 'user123';


const BACKEND_API = 'https://learning-9mup.onrender.com/api/progress';

export default function VideoPlayer() {
  const [selectedVideo, setSelectedVideo] = useState(videoList[0]);
  const [watchedIntervals, setWatchedIntervals] = useState([]);
  const [percentWatched, setPercentWatched] = useState(0);
  const [currentInterval, setCurrentInterval] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [lastWatchedPosition, setLastWatchedPosition] = useState(0);

  const videoRef = useRef(null);

  useEffect(() => {
    if (!selectedVideo) return;

    axios.get(`${BACKEND_API}/${USER_ID}/${selectedVideo.id}`)
      .then(res => {
        const { lastWatchedPosition, watchedIntervals, percentWatched } = res.data;
        setWatchedIntervals(watchedIntervals);
        setPercentWatched(Number(percentWatched));
        setLastWatchedPosition(lastWatchedPosition);
      })
      .catch(() => {
        console.log("No saved progress found.");
        setWatchedIntervals([]);
        setPercentWatched(0);
        setLastWatchedPosition(0);
      });
  }, [selectedVideo]);

  const handleLoadedMetadata = () => {
    const duration = Math.floor(videoRef.current.duration);
    setVideoDuration(duration);
    videoRef.current.currentTime = lastWatchedPosition;
  };

  const handleTimeUpdate = () => {
    const currentTime = Math.floor(videoRef.current.currentTime);

    if (!currentInterval) {
      setCurrentInterval([currentTime, currentTime + 1]);
    } else {
      const [start, end] = currentInterval;
      if (currentTime === end) {
        setCurrentInterval([start, end + 1]);
      } else if (currentTime > end + 2) {
        saveInterval(currentInterval);
        setCurrentInterval([currentTime, currentTime + 1]);
      }
    }
  };

  const saveInterval = async (interval) => {
    try {
      const res = await axios.post(`${BACKEND_API}`, {
        userId: USER_ID,
        videoId: selectedVideo.id,
        newInterval: interval,
        currentTime: Math.floor(videoRef.current.currentTime),
        videoDuration
      });

      const total = Math.min(
        res.data.watchedIntervals.reduce((acc, [s, e]) => acc + (e - s), 0),
        videoDuration
      );
      const newPercentWatched = ((total / videoDuration) * 100).toFixed(2);
      setWatchedIntervals(res.data.watchedIntervals);
      setPercentWatched(Number(newPercentWatched));
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const handleVideoChange = (video) => {
    setCurrentInterval(null);
    setSelectedVideo(video);
  };

  const handleRestart = async () => {
    try {
      await axios.post(`${BACKEND_API}/reset`, {
        userId: USER_ID,
        videoId: selectedVideo.id
      });

      setWatchedIntervals([]);
      setPercentWatched(0);
      setLastWatchedPosition(0);
      setCurrentInterval(null);
      videoRef.current.currentTime = 0;
    } catch (err) {
      console.error('Error resetting progress:', err);
    }
  };

  const calculateProgressColor = () => {
    return percentWatched >= 100 ? 'bg-green-500' : 'bg-orange-500';
  };

  const getStatusText = () => {
    return percentWatched >= 100 ? 'Completed' : 'In Progress';
  };

  const getCompletionBadge = () => {
    if (percentWatched < 100) return null;

    switch (selectedVideo.id) {
      case 'video1':
        return { text: 'Great Job! 🎉', className: 'bg-yellow-400 text-black' };
      case 'video2':
        return { text: 'Well Done! ⭐', className: 'bg-blue-400 text-white' };
      case 'video3':
        return { text: 'Awesome! 🎓', className: 'bg-green-400 text-white' };
      default:
        return { text: 'Completed! 🎉', className: 'bg-purple-400 text-white' };
    }
  };

  return (
    <div className="flex h-full bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r p-4 overflow-y-auto">
  <h2 className="text-xl font-bold mb-4 border-b">All Leacture's Videos</h2>
  <ul className="space-y-2">
    {videoList.map(video => (
      <div key={video.id}>
        <li
  onClick={() => handleVideoChange(video)}
  className={`cursor-pointer p-2 rounded hover:bg-blue-100 ${selectedVideo.id === video.id ? 'bg-blue-200 font-semibold' : ''}`}
>
  <span className="block truncate max-w-full">{video.title}</span>
</li>

        <div className="border-b-4 border-indigo-500 w-full" />
      </div>
    ))}
  </ul>
</div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="relative">
          <video
            key={selectedVideo.id}
            ref={videoRef}
            controls
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPause={() => currentInterval && saveInterval(currentInterval)}
            onEnded={() => currentInterval && saveInterval(currentInterval)}
            className="w-full rounded shadow-lg"
          >
            <source src={selectedVideo.url} type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>
          {percentWatched >= 100 && (
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${getCompletionBadge().className}`}>
              {getCompletionBadge().text}
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="text-lg">
            Watched: <span className="font-semibold">{percentWatched}%</span>
          </p>
          <div className={`h-2 mt-2 rounded-full ${calculateProgressColor()}`} style={{ width: `${percentWatched}%` }}></div>
        </div>

        <div className="mt-4 flex items-center space-x-4">
          <p className={`text-xl font-semibold ${percentWatched >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
            {getStatusText()}
          </p>
          {percentWatched >= 100 && (
            <button
              onClick={handleRestart}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow-md hover:from-red-600 hover:to-pink-600 hover:scale-105 transition-transform duration-200 font-medium"
            >
              Restart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
