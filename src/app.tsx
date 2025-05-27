import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Clock } from 'lucide-react';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio context for notification sounds
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio notification failed');
    }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      playNotificationSound();
      if (isBreak) {
        // Break is over, start new work session
        setTimeLeft(25 * 60);
        setIsBreak(false);
        setIsActive(false);
      } else {
        // Work session is over, start break
        setTimeLeft(5 * 60);
        setIsBreak(true);
        setCompletedPomodoros(prev => prev + 1);
        setIsActive(false);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, isBreak]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isBreak 
    ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
    : ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-96 max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {isBreak ? (
              <Coffee className="w-8 h-8 text-green-500 mr-2" />
            ) : (
              <Clock className="w-8 h-8 text-red-500 mr-2" />
            )}
            <h1 className="text-2xl font-bold text-gray-800">
              {isBreak ? 'Break Time' : 'Focus Time'}
            </h1>
          </div>
          <p className="text-gray-600">
            {isBreak ? 'Take a well-deserved break!' : 'Time to focus and be productive!'}
          </p>
        </div>

        {/* Timer Display */}
        <div className="relative mb-8">
          {/* Progress Ring */}
          <div className="relative w-64 h-64 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={isBreak ? "#dcfce7" : "#fee2e2"}
                strokeWidth="8"
                fill="none"
              />
              {/* Progress Circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={isBreak ? "#22c55e" : "#ef4444"}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            
            {/* Time Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-4xl font-mono font-bold ${isBreak ? 'text-green-600' : 'text-red-600'}`}>
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {isBreak ? 'Break' : 'Focus'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={toggleTimer}
            className={`flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-gray-500 hover:bg-gray-600 text-white'
                : isBreak
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            } shadow-lg hover:shadow-xl transform hover:scale-105`}
          >
            {isActive ? (
              <><Pause className="w-5 h-5 mr-2" /> Pause</>
            ) : (
              <><Play className="w-5 h-5 mr-2" /> Start</>
            )}
          </button>
          
          <button
            onClick={resetTimer}
            className="flex items-center px-6 py-3 rounded-full font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </button>
        </div>

        {/* Stats */}
        <div className="text-center">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-800">{completedPomodoros}</div>
            <div className="text-sm text-gray-600">Completed Pomodoros</div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-6 text-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isActive
              ? isBreak
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isActive
                ? isBreak
                  ? 'bg-green-400 animate-pulse'
                  : 'bg-red-400 animate-pulse'
                : 'bg-gray-400'
            }`}></div>
            {isActive ? (isBreak ? 'On Break' : 'Focusing') : 'Paused'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;