import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// TMDB API Configuration
const TMDB_API_KEYS = [
  'c8dea14dc917687ac631a52620e4f7ad',
  '3cb41ecea3bf606c56552db3d17adefd'
];
let currentKeyIndex = 0;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

// Fallback images for different content types
const FALLBACK_IMAGES = {
  hero: [
    'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb',
    'https://images.pexels.com/photos/7149329/pexels-photo-7149329.jpeg',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'
  ],
  movie: [
    'https://images.unsplash.com/photo-1590179068383-b9c69aacebd3',
    'https://images.pexels.com/photos/6091649/pexels-photo-6091649.jpeg',
    'https://images.pexels.com/photos/9944851/pexels-photo-9944851.jpeg',
    'https://images.pexels.com/photos/1358833/pexels-photo-1358833.jpeg',
    'https://images.pexels.com/photos/5407939/pexels-photo-5407939.jpeg',
    'https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce',
    'https://images.pexels.com/photos/4551914/pexels-photo-4551914.jpeg',
    'https://images.pexels.com/photos/19046437/pexels-photo-19046437.jpeg',
    'https://images.pexels.com/photos/6659571/pexels-photo-6659571.jpeg'
  ]
};

// API Helper Functions
const getTMDBApiKey = () => TMDB_API_KEYS[currentKeyIndex];

const rotateTMDBApiKey = () => {
  currentKeyIndex = (currentKeyIndex + 1) % TMDB_API_KEYS.length;
  return getTMDBApiKey();
};

const tmdbRequest = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
      params: {
        api_key: getTMDBApiKey(),
        ...params
      }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      // Rate limit hit, try with next API key
      const newKey = rotateTMDBApiKey();
      try {
        const retryResponse = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
          params: {
            api_key: newKey,
            ...params
          }
        });
        return retryResponse.data;
      } catch (retryError) {
        console.error('All TMDB API keys exhausted or error:', retryError);
        return null;
      }
    }
    console.error('TMDB API Error:', error);
    return null;
  }
};

// Mock data generator for fallback
const generateMockContent = (type = 'movie', count = 20) => {
  const mockTitles = {
    movie: [
      'The Dark Phoenix', 'Midnight Runner', 'Ocean\'s Revenge', 'Storm Rising',
      'Silent Hunter', 'The Last Stand', 'Crimson Dawn', 'Steel Thunder',
      'Shadow Protocol', 'Neon Nights', 'Blood Moon', 'Fire Storm',
      'Ice Cold', 'Dark Matter', 'Star Crossed', 'Time Shift',
      'Ghost Protocol', 'Black Widow', 'Iron Thunder', 'Silver Bullet'
    ],
    tv: [
      'Detective Stories', 'City Lights', 'Family Matters', 'The Investigation',
      'Modern Times', 'Dark Secrets', 'Love Actually', 'Crime Scene',
      'The Office Hours', 'Night Shift', 'Breaking News', 'Time Travel',
      'Mystery Files', 'The Hospital', 'School Days', 'Adventure Time',
      'Comedy Central', 'Drama Queens', 'Action Heroes', 'Sci-Fi Chronicles'
    ]
  };

  const genres = ['Action', 'Comedy', 'Drama', 'Thriller', 'Sci-Fi', 'Horror', 'Romance', 'Documentary'];
  
  return Array.from({ length: count }, (_, index) => ({
    id: Date.now() + index,
    title: mockTitles[type][index % mockTitles[type].length],
    overview: `An incredible ${type} that will keep you on the edge of your seat. A must-watch experience filled with thrilling moments and unforgettable characters.`,
    poster_path: FALLBACK_IMAGES.movie[index % FALLBACK_IMAGES.movie.length],
    backdrop_path: FALLBACK_IMAGES.hero[index % FALLBACK_IMAGES.hero.length],
    vote_average: (Math.random() * 4 + 6).toFixed(1),
    release_date: `202${Math.floor(Math.random() * 4)}`,
    genre_ids: [genres[Math.floor(Math.random() * genres.length)]],
    media_type: type,
    youtube_key: 'dQw4w9WgXcQ' // Rick Roll as default trailer
  }));
};

// Header Component
export const NetflixHeader = ({ onSearch, searchQuery, setSearchQuery }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black' : 'bg-gradient-to-b from-black/50 to-transparent'}`}>
      <div className="flex items-center justify-between px-4 md:px-12 py-4">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <div className="text-red-600 text-2xl font-bold">NETFLIX</div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-white hover:text-gray-300 transition-colors">Home</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">TV Shows</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">Movies</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">New & Popular</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">My List</a>
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            {showSearch ? (
              <input
                type="text"
                placeholder="Search titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black border border-white/20 rounded px-3 py-1 text-white placeholder-gray-400 w-64"
                autoFocus
                onBlur={() => !searchQuery && setShowSearch(false)}
              />
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}
          </div>

          {/* Notifications */}
          <button className="text-white hover:text-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h5l-5 5V4z" />
            </svg>
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-1 text-white hover:text-gray-300 transition-colors"
            >
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                <span className="text-white text-sm font-semibold">U</span>
              </div>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-black border border-gray-700 rounded-md shadow-lg">
                <a href="#" className="block px-4 py-2 text-white hover:bg-gray-800">Manage Profiles</a>
                <a href="#" className="block px-4 py-2 text-white hover:bg-gray-800">Account</a>
                <a href="#" className="block px-4 py-2 text-white hover:bg-gray-800">Help Center</a>
                <hr className="border-gray-700" />
                <a href="#" className="block px-4 py-2 text-white hover:bg-gray-800">Sign out</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Hero Section Component
export const HeroSection = ({ featuredContent, onPlayTrailer }) => {
  if (!featuredContent) return null;

  const backgroundImage = featuredContent.backdrop_path 
    ? `${TMDB_BACKDROP_BASE_URL}${featuredContent.backdrop_path}`
    : FALLBACK_IMAGES.hero[0];

  return (
    <div className="relative h-screen flex items-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 md:px-12 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          {featuredContent.title || featuredContent.name}
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
          {featuredContent.overview}
        </p>
        
        <div className="flex space-x-4">
          <button 
            onClick={() => onPlayTrailer(featuredContent)}
            className="flex items-center space-x-2 bg-white text-black px-8 py-3 rounded font-semibold hover:bg-white/80 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Play</span>
          </button>
          
          <button className="flex items-center space-x-2 bg-gray-700/70 text-white px-8 py-3 rounded font-semibold hover:bg-gray-700/50 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>More Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Content Card Component
export const ContentCard = ({ content, onPlayTrailer, onCardClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const posterUrl = content.poster_path && !imageError
    ? `${TMDB_IMAGE_BASE_URL}${content.poster_path}`
    : FALLBACK_IMAGES.movie[content.id % FALLBACK_IMAGES.movie.length];

  return (
    <div 
      className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onCardClick(content)}
    >
      <div className="aspect-[2/3] rounded-md overflow-hidden">
        <img
          src={posterUrl}
          alt={content.title || content.name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
      
      {isHovered && (
        <div className="absolute inset-0 bg-black/80 flex flex-col justify-end p-4 rounded-md transition-opacity duration-300">
          <h4 className="text-white font-semibold mb-2">{content.title || content.name}</h4>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-green-500 font-semibold">{content.vote_average}/10</span>
            <span className="text-gray-400 text-sm">{content.release_date?.slice(0, 4)}</span>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onPlayTrailer(content);
              }}
              className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <button className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Content Row Component
export const ContentRow = ({ title, content, onPlayTrailer, onCardClick }) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!content || content.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-white text-xl md:text-2xl font-semibold mb-4 px-4 md:px-12">{title}</h2>
      <div className="relative group">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div 
          ref={scrollContainerRef}
          className="flex space-x-2 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {content.map((item) => (
            <div key={item.id} className="flex-none w-48">
              <ContentCard 
                content={item} 
                onPlayTrailer={onPlayTrailer}
                onCardClick={onCardClick}
              />
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// YouTube Modal Component
export const YouTubeModal = ({ isOpen, onClose, videoKey, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl aspect-video">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300 transition-colors"
        >
          ✕
        </button>
        <iframe
          src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`}
          title={title}
          className="w-full h-full rounded-lg"
          allowFullScreen
          allow="autoplay; encrypted-media"
        />
      </div>
    </div>
  );
};

// Content Detail Modal Component
export const ContentDetailModal = ({ isOpen, onClose, content, onPlayTrailer }) => {
  if (!isOpen || !content) return null;

  const backdropUrl = content.backdrop_path
    ? `${TMDB_BACKDROP_BASE_URL}${content.backdrop_path}`
    : FALLBACK_IMAGES.hero[content.id % FALLBACK_IMAGES.hero.length];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gray-900 rounded-lg overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white text-2xl hover:text-gray-300 transition-colors bg-black/50 rounded-full w-8 h-8 flex items-center justify-center"
        >
          ✕
        </button>
        
        <div className="relative">
          <img
            src={backdropUrl}
            alt={content.title || content.name}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
          
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-white text-3xl font-bold mb-2">{content.title || content.name}</h2>
            <div className="flex space-x-4">
              <button 
                onClick={() => onPlayTrailer(content)}
                className="flex items-center space-x-2 bg-white text-black px-6 py-2 rounded font-semibold hover:bg-white/80 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Play</span>
              </button>
              <button className="bg-gray-700 text-white px-6 py-2 rounded font-semibold hover:bg-gray-600 transition-colors">
                + My List
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <p className="text-white text-lg mb-4">{content.overview}</p>
            </div>
            <div className="text-gray-400">
              <p><span className="text-white">Rating:</span> {content.vote_average}/10</p>
              <p><span className="text-white">Release:</span> {content.release_date}</p>
              <p><span className="text-white">Type:</span> {content.media_type === 'tv' ? 'TV Series' : 'Movie'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Footer Component
export const NetflixFooter = () => {
  return (
    <footer className="bg-black text-gray-400 px-4 md:px-12 py-8 mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Investor Relations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Speed Test</a></li>
            </ul>
          </div>
          <div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Jobs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Preferences</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Legal Notices</a></li>
            </ul>
          </div>
          <div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Account</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Ways to Watch</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Corporate Information</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Only on Netflix</a></li>
            </ul>
          </div>
          <div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Media Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6">
          <p className="text-sm">© 2024 Netflix Clone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Main Netflix App Component
export const NetflixApp = () => {
  const [content, setContent] = useState({
    trending: [],
    popular: [],
    topRated: [],
    upcoming: [],
    tvShows: []
  });
  const [featuredContent, setFeaturedContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [currentVideoKey, setCurrentVideoKey] = useState('');
  const [currentVideoTitle, setCurrentVideoTitle] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  // Fetch content from TMDB API
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        // Fetch different categories
        const [trendingRes, popularRes, topRatedRes, upcomingRes, tvRes] = await Promise.all([
          tmdbRequest('/trending/all/week'),
          tmdbRequest('/movie/popular'),
          tmdbRequest('/movie/top_rated'),
          tmdbRequest('/movie/upcoming'),
          tmdbRequest('/tv/popular')
        ]);

        const newContent = {
          trending: trendingRes?.results || generateMockContent('movie', 20),
          popular: popularRes?.results || generateMockContent('movie', 20),
          topRated: topRatedRes?.results || generateMockContent('movie', 20),
          upcoming: upcomingRes?.results || generateMockContent('movie', 20),
          tvShows: tvRes?.results || generateMockContent('tv', 20)
        };

        setContent(newContent);
        
        // Set featured content (first trending item)
        if (newContent.trending.length > 0) {
          setFeaturedContent(newContent.trending[0]);
        }
        
      } catch (error) {
        console.error('Error fetching content:', error);
        // Fallback to mock data
        const mockContent = {
          trending: generateMockContent('movie', 20),
          popular: generateMockContent('movie', 20),
          topRated: generateMockContent('movie', 20),
          upcoming: generateMockContent('movie', 20),
          tvShows: generateMockContent('tv', 20)
        };
        setContent(mockContent);
        setFeaturedContent(mockContent.trending[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Search functionality
  useEffect(() => {
    const searchContent = async () => {
      if (searchQuery.length > 2) {
        try {
          const results = await tmdbRequest('/search/multi', { query: searchQuery });
          setSearchResults(results?.results || []);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(searchContent, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handlePlayTrailer = async (content) => {
    try {
      // Try to get actual trailer from TMDB
      const mediaType = content.media_type || (content.title ? 'movie' : 'tv');
      const videoRes = await tmdbRequest(`/${mediaType}/${content.id}/videos`);
      
      if (videoRes?.results?.length > 0) {
        const trailer = videoRes.results.find(video => 
          video.type === 'Trailer' && video.site === 'YouTube'
        ) || videoRes.results[0];
        
        setCurrentVideoKey(trailer.key);
      } else {
        // Fallback to demo video
        setCurrentVideoKey('dQw4w9WgXcQ');
      }
      
      setCurrentVideoTitle(content.title || content.name);
      setShowYouTubeModal(true);
    } catch (error) {
      console.error('Error fetching trailer:', error);
      // Fallback video
      setCurrentVideoKey('dQw4w9WgXcQ');
      setCurrentVideoTitle(content.title || content.name);
      setShowYouTubeModal(true);
    }
  };

  const handleCardClick = (content) => {
    setSelectedContent(content);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-600 text-4xl font-bold animate-pulse">NETFLIX</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <NetflixHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <HeroSection 
        featuredContent={featuredContent}
        onPlayTrailer={handlePlayTrailer}
      />
      
      <div className="relative z-10 -mt-32">
        {searchQuery && searchResults.length > 0 ? (
          <ContentRow 
            title={`Search results for "${searchQuery}"`}
            content={searchResults}
            onPlayTrailer={handlePlayTrailer}
            onCardClick={handleCardClick}
          />
        ) : (
          <>
            <ContentRow 
              title="Trending Now"
              content={content.trending}
              onPlayTrailer={handlePlayTrailer}
              onCardClick={handleCardClick}
            />
            <ContentRow 
              title="Popular on Netflix"
              content={content.popular}
              onPlayTrailer={handlePlayTrailer}
              onCardClick={handleCardClick}
            />
            <ContentRow 
              title="Top Rated"
              content={content.topRated}
              onPlayTrailer={handlePlayTrailer}
              onCardClick={handleCardClick}
            />
            <ContentRow 
              title="TV Shows"
              content={content.tvShows}
              onPlayTrailer={handlePlayTrailer}
              onCardClick={handleCardClick}
            />
            <ContentRow 
              title="Coming Soon"
              content={content.upcoming}
              onPlayTrailer={handlePlayTrailer}
              onCardClick={handleCardClick}
            />
          </>
        )}
      </div>

      <NetflixFooter />

      <YouTubeModal 
        isOpen={showYouTubeModal}
        onClose={() => setShowYouTubeModal(false)}
        videoKey={currentVideoKey}
        title={currentVideoTitle}
      />

      <ContentDetailModal 
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        content={selectedContent}
        onPlayTrailer={handlePlayTrailer}
      />
    </div>
  );
};