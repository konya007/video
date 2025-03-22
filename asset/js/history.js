const HistoryManager = {
    MAX_HISTORY_ITEMS: 20,
    
    init: function() {
        this.historyLink = document.getElementById('history-link');
        this.historyView = document.getElementById('history-view');
        this.historyContainer = document.getElementById('history-container');
        this.clearHistoryBtn = document.getElementById('clear-history');
        
        this.historyLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showHistory();
        });
        
        this.clearHistoryBtn.addEventListener('click', () => {
            this.clearHistory();
        });
    },
    
    addToHistory: function(video, category) {
        let history = this.getHistory();
        
        // Remove if already exists
        history = history.filter(item => !(item.video.id === video.id && item.category.id === category.id));
        
        // Add to the beginning
        history.unshift({
            video: video,
            category: category,
            timestamp: new Date().toISOString()
        });
        
        // Limit history size
        if (history.length > this.MAX_HISTORY_ITEMS) {
            history = history.slice(0, this.MAX_HISTORY_ITEMS);
        }
        
        localStorage.setItem('watchHistory', JSON.stringify(history));
    },
    
    getHistory: function() {
        const history = localStorage.getItem('watchHistory');
        return history ? JSON.parse(history) : [];
    },
    
    clearHistory: function() {
        localStorage.removeItem('watchHistory');
        this.showHistory(); // Refresh view
    },
    
    isVideoWatched: function(videoId, categoryId) {
        const history = this.getHistory();
        return history.some(item => 
            item.video.id == videoId && item.category.id == categoryId
        );
    },
    
    showHistory: function() {
        // Hide other views
        document.getElementById('home-view').classList.add('d-none');
        document.getElementById('playlists-view').classList.add('d-none');
        document.getElementById('playlist-videos-view').classList.add('d-none');
        document.getElementById('video-player-view').classList.add('d-none');
        this.historyView.classList.remove('d-none');
        
        const history = this.getHistory();
        this.historyContainer.innerHTML = '';
        
        if (history.length === 0) {
            this.historyContainer.innerHTML = '<div class="col-12"><div class="alert alert-info">No watch history found.</div></div>';
            return;
        }
        
        history.forEach(item => {
            const col = document.createElement('div');
            col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
            
            // Format the date
            const date = new Date(item.timestamp);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
            
            col.innerHTML = `
                <div class="card video-card history-card" data-video-id="${item.video.id}" data-category-id="${item.category.id}">
                    <div class="thumbnail-container">
                        <div class="category-badge">${item.category.name}</div>
                        <img src="https://img.youtube.com/vi/${item.video.youtubeId}/maxresdefault.jpg" class="card-img-top" alt="${item.video.title}">
                        <div class="youtube-badge">
                            <i class="fab fa-youtube"></i>
                        </div>
                        <div class="watched-badge">
                            <i class="fas fa-history me-1"></i>Watched
                        </div>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${item.video.title}</h5>
                        <p class="card-text small text-muted">Watched on: ${formattedDate}</p>
                    </div>
                </div>
            `;
            
            this.historyContainer.appendChild(col);
        });
        
        // Add click events to history items
        document.querySelectorAll('.history-card').forEach(card => {
            card.addEventListener('click', function() {
                const videoId = this.getAttribute('data-video-id');
                const categoryId = this.getAttribute('data-category-id');
                
                // Find the video and category
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
    }
};