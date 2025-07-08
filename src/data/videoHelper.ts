import { VideoConfig } from '../types';
import videoConfig from './videoConfig.json';

export const getVideoConfig = (habitName: string): VideoConfig | null => {
  const config = videoConfig as Record<string, VideoConfig>;
  return config[habitName] || null;
};

export const hasVideo = (habitName: string): boolean => {
  return getVideoConfig(habitName) !== null;
};

export const getYouTubeVideoId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
};

export const getYouTubeThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

export const formatVideoDuration = (duration: string): string => {
  // Input format: "5:30" or "3:45"
  // Output format: "5 min 30 sec" or "3 min 45 sec"
  const [minutes, seconds] = duration.split(':');
  const min = parseInt(minutes, 10);
  const sec = parseInt(seconds, 10);
  
  if (sec === 0) {
    return `${min} min`;
  }
  return `${min} min ${sec} sec`;
};