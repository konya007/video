const PlaylistManager = {
    VIDEOS_PER_PAGE: 8,
    
    init: function() {
        // Views
        this.playlistsView = document.getElementById('playlists-view');
        this.playlistVideosView = document.getElementById('playlist-videos-view');
        
        // Containers
        this.playlistsContainer = document.getElementById('playlists-container');
        this.videosContainer = document.getElementById('videos-container');
        
        // Elements
        this.playlistTitle = document.getElementById('playlist-title');
        this.playlistsLink = document.getElementById('playlists-link');
        this.backToPlaylistsBtn = document.getElementById('back-to-playlists');
        this.loadMoreBtn = document.getElementById('load-more-btn');
        
        this.currentCategory = null;
        this.currentPage = 1;
        
        this.backToPlaylistsBtn.addEventListener('click', () => {
            this.showPlaylists();
        });
        
        this.playlistsLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPlaylists();
        });
        
        this.loadMoreBtn.addEventListener('click', () => {
            this.loadMoreVideos();
        });
        
        // Initial loading of playlists
        this.loadPlaylists();
    },
    
    loadPlaylists: function() {
        DataManager.getDataPromise.then(data => {
            this.renderPlaylists(data.categories);
        }).catch(error => {
            console.error('Error loading playlists:', error);
        });
    },
    
    renderPlaylists: function(categories) {
        this.playlistsContainer.innerHTML = '';
        
        categories.forEach(category => {
            const col = document.createElement('div');
            col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
            
            // Get a thumbnail from the first video in the category
            const thumbnailVideo = category.videos[0] || {};
            const youtubeId = thumbnailVideo.youtubeId || '';
            
            col.innerHTML = `
                <div class="card playlist-card" data-category-id="${category.id}">
                    <div class="thumbnail-container">
                        <img src="https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg" class="card-img-top" alt="${category.name}">
                        <div class="playlist-count">
                            <i class="fas fa-list me-1"></i>${category.videos.length} videos
                        </div>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${category.name}</h5>
                    </div>
                </div>
            `;
            
            this.playlistsContainer.appendChild(col);
        });
        
        // Add click events to playlist cards
        document.querySelectorAll('.playlist-card').forEach(card => {
            card.addEventListener('click', () => {
                const categoryId = card.getAttribute('data-category-id');
                this.showPlaylistVideos(categoryId);
            });
        });
    },
    
    showPlaylistVideos: function(categoryId) {
        DataManager.getDataPromise.then(data => {
            const category = data.categories.find(c => c.id == categoryId);
            if (category) {
                this.currentCategory = category;
                this.currentPage = 1;
                
                // Update title
                this.playlistTitle.textContent = category.name;
                
                // Hide playlists view, show videos view
                this.playlistsView.classList.add('d-none');
                document.getElementById('home-view').classList.add('d-none');
                document.getElementById('history-view').classList.add('d-none');
                document.getElementById('video-player-view').classList.add('d-none');
                this.playlistVideosView.classList.remove('d-none');
                
                // Render videos
                this.renderVideos(category.videos);
            }
        });
    },
    
    renderVideos: function(videos) {
        this.videosContainer.innerHTML = '';
        
        const videosToShow = videos.slice(0, this.currentPage * this.VIDEOS_PER_PAGE);
        
        videosToShow.forEach(video => {
            const col = document.createElement('div');
            col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
            
            // Check if the video has been watched
            const isWatched = HistoryManager.isVideoWatched(video.id, this.currentCategory.id);
            const watchedBadge = isWatched ? `
                <div class="watched-badge">
                    <i class="fas fa-check me-1"></i>Watched
                </div>
            ` : '';
            
            col.innerHTML = `
                <div class="card video-card" data-video-id="${video.id}">
                    <div class="thumbnail-container">
                        <div class="category-badge">${this.currentCategory.name}</div>
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
            
            this.videosContainer.appendChild(col);
        });
        
        // Show/hide load more button
        if (videos.length > this.currentPage * this.VIDEOS_PER_PAGE) {
            this.loadMoreBtn.classList.remove('d-none');
        } else {
            this.loadMoreBtn.classList.add('d-none');
        }
        
        // Add click events to video cards
        document.querySelectorAll('.video-card').forEach(card => {
            card.addEventListener('click', function() {
                const videoId = this.getAttribute('data-video-id');
                const video = videos.find(v => v.id == videoId);
                if (video) {
                    PlayerManager.showPlayer(video, PlaylistManager.currentCategory);
                }
            });
        });
    },
    
    loadMoreVideos: function() {
        this.currentPage++;
        this.renderVideos(this.currentCategory.videos);
    },
    
    showPlaylists: function() {
        document.getElementById('home-view').classList.add('d-none');
        this.playlistVideosView.classList.add('d-none');
        document.getElementById('history-view').classList.add('d-none');
        document.getElementById('video-player-view').classList.add('d-none');
        this.playlistsView.classList.remove('d-none');
    }
};