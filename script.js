document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menu-toggle');
    const navbar = document.getElementById('navbar');
    const body = document.body;

    menuToggle.addEventListener('click', function () {
        this.classList.toggle('active');
        navbar.classList.toggle('active');
        body.classList.toggle('no-scroll');

        if (navbar.classList.contains('active')) {
            const navItems = document.querySelectorAll('nav ul li');
            navItems.forEach((item, index) => {
                item.style.animation = `navItemFade 0.5s ease forwards ${index * 0.1}s`;
            });
        } else {
            document.querySelectorAll('nav ul li').forEach(item => {
                item.style.animation = '';
            });
        }
    });

    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navbar.classList.remove('active');
            body.classList.remove('no-scroll');
        });
    });

    window.addEventListener('scroll', function () {
        document.querySelector('header').classList.toggle('scrolled', window.scrollY > 50);
    });
});

const phrases = [
    "WELCOME TO SALAMVIZ",
    "ARCHITECTURAL VISUALIZATION",
    "3D ARTISTRY & INNOVATION",
    "ELEVATING SPACES DIGITALLY"
];

const textElement = document.getElementById("changing-text");
let phraseIndex = 0;

function changeText() {
    textElement.textContent = phrases[phraseIndex];
    phraseIndex = (phraseIndex + 1) % phrases.length;

    // Reset animation
    textElement.style.animation = 'none';
    void textElement.offsetWidth; // Trigger reflow
    textElement.style.animation = 'fadeInOut 4s infinite';
}

// Start the sequence
changeText();
setInterval(changeText, 4000); // Change text every 4 seconds

// Lightbox elements
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxDesc = document.getElementById("lightbox-desc");
const lightboxViews = document.getElementById("lightbox-views");
const lightboxLikes = document.getElementById("lightbox-likes");
const lightboxCommentsCount = document.getElementById("lightbox-comments-count");
const lightboxComments = document.getElementById("lightbox-comments");
const lightboxLikeBtn = document.getElementById("lightbox-like-btn");
const lightboxCommentBtn = document.getElementById("lightbox-comment-btn");
const commentForm = document.getElementById("comment-form");
const closeBtn = document.querySelector(".close");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const loader = document.querySelector(".loader");

// Initialize gallery items with unique IDs and storage
const portfolioItems = Array.from(document.querySelectorAll('.portfolio-item')).map(item => {
    const id = item.getAttribute('data-id');

    // Initialize from localStorage or set defaults
    const storedViews = localStorage.getItem(`portfolio_${id}_views`);
    const storedLikes = localStorage.getItem(`portfolio_${id}_likes`);
    const storedLiked = localStorage.getItem(`portfolio_${id}_liked`);
    const storedComments = localStorage.getItem(`portfolio_${id}_comments`);

    const viewCount = storedViews ? parseInt(storedViews) : 0;
    const likeCount = storedLikes ? parseInt(storedLikes) : 0;
    const isLiked = storedLiked === 'true';
    const comments = storedComments ? JSON.parse(storedComments) : [];
    const commentCount = comments.length;

    // Update DOM elements
    item.querySelector('.view-count').textContent = formatNumber(viewCount);
    const likeBtn = item.querySelector('.like-btn');
    const likeCountEl = item.querySelector('.like-count');
    const commentCountEl = item.querySelector('.comment-count');
    likeCountEl.textContent = formatNumber(likeCount);
    commentCountEl.textContent = formatNumber(commentCount);

    if (isLiked) {
        likeBtn.classList.add('liked');
        likeBtn.innerHTML = `<i class="fas fa-heart"></i> <span class="like-count">${formatNumber(likeCount)}</span>`;
    }

    return {
        id: id,
        src: item.querySelector('img').src.replace('/w=600', '/w=1200'), // Higher resolution
        title: item.querySelector('.overlay h3').textContent,
        desc: item.querySelector('.overlay p').textContent,
        views: viewCount,
        likes: likeCount,
        comments: comments,
        isLiked: isLiked,
        element: item,
        viewElement: item.querySelector('.view-count'),
        likeElement: item.querySelector('.like-count'),
        commentElement: item.querySelector('.comment-count'),
        likeBtn: likeBtn
    };
});

let currentIndex = 0;
let isZoomed = false;

// Track unique views (prevents refresh spam)
const viewedItems = new Set();

// Initialize gallery interactions
portfolioItems.forEach((item, index) => {
    // Track views (only count once per session)
    item.element.addEventListener('click', () => {
        currentIndex = index;

        // Only increment if not viewed in this session
        if (!viewedItems.has(item.id)) {
            item.views++;
            viewedItems.add(item.id);
            item.viewElement.textContent = formatNumber(item.views);
            localStorage.setItem(`portfolio_${item.id}_views`, item.views.toString());
        }

        openLightbox();
    });

    // Like button functionality
    item.likeBtn.addEventListener('click', function (e) {
        e.stopPropagation();

        if (item.isLiked) {
            item.likes--;
            this.classList.remove('liked');
            this.innerHTML = `<i class="far fa-heart"></i> <span class="like-count">${formatNumber(item.likes)}</span>`;
        } else {
            item.likes++;
            this.classList.add('liked');
            this.innerHTML = `<i class="fas fa-heart"></i> <span class="like-count">${formatNumber(item.likes)}</span>`;
            this.querySelector('i').classList.add('fas');
        }

        item.isLiked = !item.isLiked;

        // Save to localStorage
        localStorage.setItem(`portfolio_${item.id}_likes`, item.likes.toString());
        localStorage.setItem(`portfolio_${item.id}_liked`, item.isLiked.toString());
    });
});

// Format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function openLightbox() {
    loader.style.display = "block";
    lightboxImg.style.display = "none";
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";

    const item = portfolioItems[currentIndex];
    lightboxTitle.textContent = item.title;
    lightboxDesc.textContent = item.desc;
    lightboxViews.textContent = formatNumber(item.views);
    lightboxLikes.textContent = formatNumber(item.likes);
    lightboxCommentsCount.textContent = formatNumber(item.comments.length);

    // Update lightbox like button state
    if (item.isLiked) {
        lightboxLikeBtn.innerHTML = `<i class="fas fa-heart"></i> <span id="lightbox-likes">${formatNumber(item.likes)}</span>`;
        lightboxLikeBtn.classList.add('liked');
    } else {
        lightboxLikeBtn.innerHTML = `<i class="far fa-heart"></i> <span id="lightbox-likes">${formatNumber(item.likes)}</span>`;
        lightboxLikeBtn.classList.remove('liked');
    }

    // Load comments
    loadComments(item);

    const img = new Image();
    img.src = item.src;
    img.onload = function () {
        lightboxImg.src = item.src;
        lightboxImg.alt = item.title;
        lightboxImg.style.display = "block";
        loader.style.display = "none";
    };
}

function loadComments(item) {
    lightboxComments.innerHTML = '';
    if (item.comments.length === 0) {
        lightboxComments.innerHTML = '<p style="color: var(--text-light); text-align: center;">No comments yet</p>';
        return;
    }

    item.comments.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.innerHTML = `
                        <div class="comment-user">${comment.user}</div>
                        <div class="comment-text">${comment.text}</div>
                    `;
        lightboxComments.appendChild(commentDiv);
    });
}

function updateLightbox(direction) {
    loader.style.display = "block";
    lightboxImg.style.display = "none";

    const item = portfolioItems[currentIndex];
    lightboxTitle.textContent = item.title;
    lightboxDesc.textContent = item.desc;
    lightboxViews.textContent = formatNumber(item.views);
    lightboxLikes.textContent = formatNumber(item.likes);
    lightboxCommentsCount.textContent = formatNumber(item.comments.length);

    // Update lightbox like button state
    if (item.isLiked) {
        lightboxLikeBtn.innerHTML = `<i class="fas fa-heart"></i> <span id="lightbox-likes">${formatNumber(item.likes)}</span>`;
        lightboxLikeBtn.classList.add('liked');
    } else {
        lightboxLikeBtn.innerHTML = `<i class="far fa-heart"></i> <span id="lightbox-likes">${formatNumber(item.likes)}</span>`;
        lightboxLikeBtn.classList.remove('liked');
    }

    // Load comments
    loadComments(item);

    const img = new Image();
    img.src = item.src;
    img.onload = function () {
        isZoomed = false;
        lightboxImg.classList.remove('zoomed');
        lightboxImg.src = item.src;
        lightboxImg.alt = item.title;
        lightboxImg.style.display = "block";
        loader.style.display = "none";
    };
}

function showPrev() {
    currentIndex = (currentIndex - 1 + portfolioItems.length) % portfolioItems.length;
    updateLightbox('prev');
}

function showNext() {
    currentIndex = (currentIndex + 1) % portfolioItems.length;
    updateLightbox('next');
}

function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
    isZoomed = false;
}

function toggleZoom() {
    isZoomed = !isZoomed;
    lightboxImg.classList.toggle('zoomed', isZoomed);
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        lightboxImg.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        document.exitFullscreen();
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
}

// Event listeners
closeBtn.addEventListener("click", closeLightbox);
prevBtn.addEventListener("click", showPrev);
nextBtn.addEventListener("click", showNext);
fullscreenBtn.addEventListener("click", toggleFullscreen);

// Keyboard navigation
document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("active")) return;

    switch (e.key) {
        case "Escape":
            closeLightbox();
            break;
        case "ArrowLeft":
            showPrev();
            break;
        case "ArrowRight":
            showNext();
            break;
        case " ":
            toggleZoom();
            break;
    }
});

// Lightbox image click to zoom
lightboxImg.addEventListener("click", function (e) {
    if (e.target === lightboxImg) {
        toggleZoom();
    }
});

// Lightbox like button functionality
lightboxLikeBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    const item = portfolioItems[currentIndex];

    if (item.isLiked) {
        item.likes--;
        this.classList.remove('liked');
        this.innerHTML = `<i class="far fa-heart"></i> <span id="lightbox-likes">${formatNumber(item.likes)}</span>`;
    } else {
        item.likes++;
        this.classList.add('liked');
        this.innerHTML = `<i class="fas fa-heart"></i> <span id="lightbox-likes">${formatNumber(item.likes)}</span>`;
    }

    item.isLiked = !item.isLiked;

    // Update the grid item
    item.likeElement.textContent = formatNumber(item.likes);
    if (item.isLiked) {
        item.likeBtn.classList.add('liked');
        item.likeBtn.innerHTML = `<i class="fas fa-heart"></i> <span class="like-count">${formatNumber(item.likes)}</span>`;
    } else {
        item.likeBtn.classList.remove('liked');
        item.likeBtn.innerHTML = `<i class="far fa-heart"></i> <span class="like-count">${formatNumber(item.likes)}</span>`;
    }

    // Save to localStorage
    localStorage.setItem(`portfolio_${item.id}_likes`, item.likes.toString());
    localStorage.setItem(`portfolio_${item.id}_liked`, item.isLiked.toString());
});

// Comment form submission
commentForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const input = this.querySelector('.comment-input');
    const commentText = input.value.trim();

    if (commentText) {
        const item = portfolioItems[currentIndex];
        const newComment = {
            user: "You",
            text: commentText
        };

        item.comments.unshift(newComment);
        item.commentElement.textContent = formatNumber(item.comments.length);
        lightboxCommentsCount.textContent = formatNumber(item.comments.length);

        // Save to localStorage
        localStorage.setItem(`portfolio_${item.id}_comments`, JSON.stringify(item.comments));

        // Add the new comment to the top
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.innerHTML = `
            <div class="comment-user">${newComment.user}</div>
            <div class="comment-text">${newComment.text}</div>
        `;

        if (lightboxComments.firstChild &&
            lightboxComments.firstChild.textContent === 'No comments yet') {
            lightboxComments.innerHTML = '';
        }

        lightboxComments.insertBefore(commentDiv, lightboxComments.firstChild);
        input.value = '';
    }
});

// Fullscreen change event
document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement) {
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
});

// Close lightbox when clicking on backdrop
lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// Initialize all like buttons
document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const itemId = this.closest('.portfolio-item').getAttribute('data-id');
        const item = portfolioItems.find(i => i.id === itemId);

        if (item.isLiked) {
            item.likes--;
            this.classList.remove('liked');
            this.innerHTML = `<i class="far fa-heart"></i> <span class="like-count">${formatNumber(item.likes)}</span>`;
        } else {
            item.likes++;
            this.classList.add('liked');
            this.innerHTML = `<i class="fas fa-heart"></i> <span class="like-count">${formatNumber(item.likes)}</span>`;
        }

        item.isLiked = !item.isLiked;

        // Update lightbox if open for this item
        if (lightbox.classList.contains("active") && portfolioItems[currentIndex].id === itemId) {
            lightboxLikes.textContent = formatNumber(item.likes);
            if (item.isLiked) {
                lightboxLikeBtn.innerHTML = `<i class="fas fa-heart"></i> <span id="lightbox-likes">${formatNumber(item.likes)}</span>`;
                lightboxLikeBtn.classList.add('liked');
            } else {
                lightboxLikeBtn.innerHTML = `<i class="far fa-heart"></i> <span id="lightbox-likes">${formatNumber(item.likes)}</span>`;
                lightboxLikeBtn.classList.remove('liked');
            }
        }

        // Save to localStorage
        localStorage.setItem(`portfolio_${item.id}_likes`, item.likes.toString());
        localStorage.setItem(`portfolio_${item.id}_liked`, item.isLiked.toString());
    });
});

// Simple fix: Clicking a card opens YouTube video
document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.salamviz-video-card');
    const lightbox = document.getElementById('salamviz-lightbox');
    const videoFrame = document.getElementById('salamviz-video-frame');
    const closeBtn = document.querySelector('.salamviz-close-btn');

    // Open video on card click
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const videoURL = card.getAttribute('data-video');
            videoFrame.src = videoURL + "?autoplay=1";
            lightbox.style.display = 'flex';
        });
    });

    // Close lightbox
    function closeVideo() {
        videoFrame.src = '';
        lightbox.style.display = 'none';
    }
    closeBtn.addEventListener('click', closeVideo);
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") closeVideo();
    });
});