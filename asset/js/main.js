// Data Manager - Handles loading data from data.json
const DataManager = {
    allVideos: [],
    categories: [],
    
    init: function() {
        this.getDataPromise = fetch('data.json')
            .then(response => response.json())
            .then(data => {
                this.categories = data.categories;
                
                // Create flat array of all videos with category information
                data.categories.forEach(category => {
                    category.videos.forEach(video => {
                        this.allVideos.push({
                            ...video,
                            categoryId: category.id,
                            categoryName: category.name
                        });
                    });
                });
                
                return data;
            })
            .catch(error => {
                console.error('Error loading video data:', error);
                return { categories: [] };
            });
    },
    
    getRandomVideos: function(count) {
        const shuffled = [...this.allVideos].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    },
    
    getRecommendedVideos: function(currentVideo, currentCategory, count = 4) {
        // Get videos from other categories, excluding the current one
        const otherCategoriesVideos = this.allVideos.filter(
            video => video.categoryId !== currentCategory.id
        );
        
        // Shuffle them
        const shuffled = [...otherCategoriesVideos].sort(() => 0.5 - Math.random());
        
        // Return the requested number
        return shuffled.slice(0, count);
    },
    
    getRelativePosition: function(videoId, categoryId) {
        const category = this.categories.find(c => c.id == categoryId);
        if (!category) return { index: -1, total: 0 };
        
        const videos = category.videos;
        const index = videos.findIndex(v => v.id == videoId);
        
        return {
            index: index,
            total: videos.length,
            prevVideo: index > 0 ? videos[index - 1] : null,
            nextVideo: index < videos.length - 1 ? videos[index + 1] : null
        };
    }
};

// Home Manager - Handles the home page with all videos
const HomeManager = {
    VIDEOS_PER_LOAD: 12,
    currentPage: 1,
    isLoading: false,
    randomMode: false,
    
    init: function() {
        this.homeView = document.getElementById('home-view');
        this.allVideosContainer = document.getElementById('all-videos-container');
        this.loader = document.getElementById('home-loader');
        this.homeLink = document.getElementById('home-link');
        this.logoLink = document.getElementById('logo-link');
        this.randomToggle = document.getElementById('randomToggle');
        
        this.homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showHome();
        });
        
        this.logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showHome();
        });
        
        this.randomToggle.addEventListener('change', () => {
            this.randomMode = this.randomToggle.checked;
            this.currentPage = 1;
            this.allVideosContainer.innerHTML = '';
            this.loadMoreVideos();
        });
        
        // Implement infinite scrolling
        window.addEventListener('scroll', () => {
            if (this.homeView.classList.contains('d-none')) return;
            
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            if (scrollTop + clientHeight >= scrollHeight - 100 && !this.isLoading) {
                this.loadMoreVideos();
            }
        });
        
        // Initial load
        this.loadMoreVideos();
    },
    
    loadMoreVideos: function() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.loader.style.display = 'block';
        
        // Simulate network delay for better UX
        setTimeout(() => {
            let videos;
            if (this.randomMode) {
                videos = DataManager.getRandomVideos(this.VIDEOS_PER_LOAD);
            } else {
                const start = (this.currentPage - 1) * this.VIDEOS_PER_LOAD;
                const end = start + this.VIDEOS_PER_LOAD;
                videos = DataManager.allVideos.slice(start, end);
            }
            
            this.renderVideos(videos);
            this.currentPage++;
            this.isLoading = false;
            this.loader.style.display = 'none';
            
            // Hide loader if no more videos to load in sequential mode
            if (!this.randomMode && (this.currentPage - 1) * this.VIDEOS_PER_LOAD >= DataManager.allVideos.length) {
                this.loader.style.display = 'none';
            }
        }, 500);
    },
    
    renderVideos: function(videos) {
        videos.forEach(video => {
            const col = document.createElement('div');
            col.className = 'col-lg-3 col-md-4 col-sm-6 mb-2';
            
            // Check if the video has been watched
            const isWatched = HistoryManager.isVideoWatched(video.id, video.categoryId);
            const watchedBadge = isWatched ? `
                <div class="watched-badge">
                    <i class="fas fa-check me-1"></i>Watched
                </div>
            ` : '';
            
            col.innerHTML = `
                <div class="card video-card" data-video-id="${video.id}" data-category-id="${video.categoryId}">
                    <div class="thumbnail-container">
                        <div class="category-badge">${video.categoryName}</div>
                        <img src="https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg" class="card-img-top" alt="${video.title}">
                        <div class="youtube-badge">
                            <i class="fab fa-youtube"></i>
                        </div>
                        ${watchedBadge}
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${video.title}</h5>
                        <div class="d-flex justify-content-end mt-2">
                            <a href="https://www.youtube.com/watch?v=${video.youtubeId}" 
                               target="_blank" 
                               class="btn btn-sm btn-outline-primary"
                               onclick="event.stopPropagation();">
                               <i class="fab fa-youtube me-1"></i>YouTube
                            </a>
                        </div>
                    </div>
                </div>
            `;
            
            this.allVideosContainer.appendChild(col);
            
            // Add click event
            const card = col.querySelector('.video-card');
            card.addEventListener('click', () => {
                const videoId = card.getAttribute('data-video-id');
                const categoryId = card.getAttribute('data-category-id');
                
                DataManager.getDataPromise.then(data => {
                    const category = data.categories.find(c => c.id == categoryId);
                    if (category) {
                        const video = category.videos.find(v => v.id == videoId);
                        if (video) {
                            PlayerManager.showPlayer(video, category);
                        }
                    }
                });
            });
        });
    },
    
    showHome: function() {
        document.getElementById('playlists-view').classList.add('d-none');
        document.getElementById('playlist-videos-view').classList.add('d-none');
        document.getElementById('history-view').classList.add('d-none');
        document.getElementById('video-player-view').classList.add('d-none');
        this.homeView.classList.remove('d-none');
    }
};

// Initialize all components when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    DataManager.init();
    ThemeManager.init();
    HistoryManager.init();
    HomeManager.init();
    PlaylistManager.init();
    PlayerManager.init();
});