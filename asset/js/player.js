const PlayerManager = {
    init: function() {
        this.playerView = document.getElementById('video-player-view');
        this.videoIframe = document.getElementById('video-iframe');
        this.videoTitle = document.getElementById('video-title');
        this.videoDescription = document.getElementById('video-description');
        this.categoryDisplay = document.getElementById('category-display');
        this.youtubeLink = document.getElementById('youtube-link');
        this.driveLink = document.getElementById('drive-link');
        this.relatedVideos = document.getElementById('related-videos');
        this.recommendationsContainer = document.getElementById('recommendations-container');
        this.currentVideoNumber = document.getElementById('current-video-number');
        this.prevVideoBtn = document.getElementById('prev-video');
        this.nextVideoBtn = document.getElementById('next-video');
        
        this.currentVideo = null;
        this.currentCategory = null;
        
        // Navigation button event listeners
        this.prevVideoBtn.addEventListener('click', () => {
            this.navigateToPrevVideo();
        });
        
        this.nextVideoBtn.addEventListener('click', () => {
            this.navigateToNextVideo();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.playerView.classList.contains('d-none')) {
                if (e.key === 'ArrowLeft') {
                    this.navigateToPrevVideo();
                } else if (e.key === 'ArrowRight') {
                    this.navigateToNextVideo();
                }
            }
        });
    },
    
    showPlayer: function(video, category) {
        // Hide other views
        document.getElementById('home-view').classList.add('d-none');
        document.getElementById('playlists-view').classList.add('d-none');
        document.getElementById('playlist-videos-view').classList.add('d-none');
        document.getElementById('history-view').classList.add('d-none');
        this.playerView.classList.remove('d-none');
        
        // Store current video and category
        this.currentVideo = video;
        this.currentCategory = category;
        
        // Set video details
        this.videoIframe.src = video.embedUrl;
        this.videoTitle.textContent = video.title;
        this.videoDescription.textContent = video.description;
        
        // Set category badge
        this.categoryDisplay.innerHTML = `<span class="badge bg-primary">${category.name}</span>`;
        
        // Set YouTube and Drive links
        this.youtubeLink.href = `https://www.youtube.com/watch?v=${video.youtubeId}`;
        this.driveLink.href = video.url;
        
        // Update navigation info
        this.updateNavigationInfo();
        
        // Add to watch history
        HistoryManager.addToHistory(video, category);
        
        // Render related videos (other videos in the same category)
        this.renderRelatedVideos();
        
        // Render recommendations from other categories
        this.renderRecommendations();
        
        // Scroll to top
        window.scrollTo(0, 0);
    },
    
    updateNavigationInfo: function() {
        const position = DataManager.getRelativePosition(this.currentVideo.id, this.currentCategory.id);
        
        // Update position text
        this.currentVideoNumber.textContent = `Video ${position.index + 1} of ${position.total}`;
        
        // Enable/disable navigation buttons
        this.prevVideoBtn.disabled = !position.prevVideo;
        this.nextVideoBtn.disabled = !position.nextVideo;
    },
    
    navigateToPrevVideo: function() {
        const position = DataManager.getRelativePosition(this.currentVideo.id, this.currentCategory.id);
        if (position.prevVideo) {
            this.showPlayer(position.prevVideo, this.currentCategory);
        }
    },
    
    navigateToNextVideo: function() {
        const position = DataManager.getRelativePosition(this.currentVideo.id, this.currentCategory.id);
        if (position.nextVideo) {
            this.showPlayer(position.nextVideo, this.currentCategory);
        }
    },
    
    renderRelatedVideos: function() {
        this.relatedVideos.innerHTML = '';
        
        this.currentCategory.videos.forEach(video => {
            const videoElement = document.createElement('div');
            videoElement.className = `related-video-item d-flex p-3 mb-2 ${video.id === this.currentVideo.id ? 'active' : ''}`;
            videoElement.setAttribute('data-video-id', video.id);
            
            videoElement.innerHTML = `
                <div class="flex-shrink-0" style="width: 120px; height: 68px; overflow: hidden; border-radius: 8px;">
                    <img src="https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg" style="width: 100%; height: 100%; object-fit: cover;" alt="${video.title}">
                </div>
                <div class="flex-grow-1 ms-3">
                    <h6 class="mb-1">${video.title}</h6>
                </div>
            `;
            
            this.relatedVideos.appendChild(videoElement);
            
            // Don't add click event to the current video
            if (video.id !== this.currentVideo.id) {
                videoElement.addEventListener('click', () => {
                    this.showPlayer(video, this.currentCategory);
                });
            }
        });
    },
    
    renderRecommendations: function() {
        this.recommendationsContainer.innerHTML = '';
        
        // Get 4 random videos from other categories
        const recommendations = DataManager.getRecommendedVideos(this.currentVideo, this.currentCategory, 4);
        
        recommendations.forEach(video => {
            const col = document.createElement('div');
            col.className = 'col-lg-3 col-md-6 col-sm-6 mb-4';
            
            col.innerHTML = `
                <div class="card video-card recommendation-card" data-video-id="${video.id}" data-category-id="${video.categoryId}">
                    <div class="thumbnail-container">
                        <div class="category-badge">${video.categoryName}</div>
                        <img src="https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg" class="card-img-top" alt="${video.title}">
                        <div class="youtube-badge">
                            <i class="fab fa-youtube"></i>
                        </div>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${video.title}</h5>
                    </div>
                </div>
            `;
            
            this.recommendationsContainer.appendChild(col);
            
            // Add click event
            const card = col.querySelector('.recommendation-card');
            card.addEventListener('click', () => {
                DataManager.getDataPromise.then(data => {
                    const category = data.categories.find(c => c.id == video.categoryId);
                    if (category) {
                        const foundVideo = category.videos.find(v => v.id == video.id);
                        if (foundVideo) {
                            this.showPlayer(foundVideo, category);
                        }
                    }
                });
            });
        });
    }
};