const ThemeManager = {
    init: function() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.body = document.body;
        this.isDarkMode = true;

        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            if (savedTheme === 'light') {
                this.enableLightMode();
            } else {
                this.enableDarkMode();
            }
        }
        
        this.themeToggle.addEventListener('click', () => {
            if (this.isDarkMode) {
                this.enableLightMode();
            } else {
                this.enableDarkMode();
            }
        });
    },
    
    enableDarkMode: function() {
        this.body.classList.remove('light-mode');
        this.body.classList.add('dark-mode');
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        this.themeToggle.innerHTML = '<i class="fas fa-sun text-warning"></i>';
        this.isDarkMode = true;
        localStorage.setItem('theme', 'dark');
    },
    
    enableLightMode: function() {
        this.body.classList.remove('dark-mode');
        this.body.classList.add('light-mode');
        document.documentElement.setAttribute('data-bs-theme', 'light');
        this.themeToggle.innerHTML = '<i class="fas fa-moon text-primary"></i>';
        this.isDarkMode = false;
        localStorage.setItem('theme', 'light');
    }
};