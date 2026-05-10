// CANVAS PHYSICS
const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
let particles = [];
class Particle {
    constructor(x, y, isMassive = false) {
        this.x = x; this.y = y; this.size = Math.random() * 25 + 10;
        const angle = Math.random() * Math.PI * 2;
        const velocity = isMassive ? (Math.random() * 25 + 10) : (Math.random() * 15 + 8); 
        this.vx = Math.cos(angle) * velocity; this.vy = Math.sin(angle) * velocity;
        this.friction = 0.95; this.gravity = 0.5; this.opacity = 1;
        this.rotation = Math.random() * 360; this.rotSpeed = (Math.random() - 0.5) * 15;
    }
    update() {
        this.vx *= this.friction; this.vy *= this.friction; this.vy += this.gravity;
        this.x += this.vx; this.y += this.vy; this.opacity -= 0.012; this.rotation += this.rotSpeed;
    }
    draw() {
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rotation * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, this.opacity); ctx.font = `${this.size}px Arial`;
        ctx.fillText('❤️', -this.size/2, this.size/2); ctx.restore();
    }
}
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => { p.update(); p.draw(); if (p.opacity <= 0) particles.splice(i, 1); });
    if (particles.length > 0) requestAnimationFrame(animateParticles);
}
function triggerKaboom(x, y, count, isMassive = false) {
    for(let i=0; i<count; i++) particles.push(new Particle(x, y, isMassive));
    animateParticles();
}

// INTRO & AUDIO
document.getElementById('enter-btn').addEventListener('click', (e) => {
    const music = document.getElementById('bg-music');
    music.volume = 0.8;
    music.play().catch(err => console.log("Audio waiting for user:", err));
    
    triggerKaboom(e.clientX || window.innerWidth/2, e.clientY || window.innerHeight/2, 50, false);
    document.getElementById('intro-screen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('intro-screen').style.display = 'none';
        const board = document.getElementById('scrapboard');
        board.style.display = 'block';
        setTimeout(() => board.style.opacity = '1', 50);
    }, 1500);
});

// MASTER MODAL LOGIC
const allPics = document.querySelectorAll('.interactive-pic');
const masterModal = document.getElementById('master-modal');
const modalImg = document.getElementById('modal-img');
const modalText = document.getElementById('modal-text');
const closeModalBtn = document.getElementById('close-modal-btn');
const zoomContainer = document.getElementById('zoom-container');

let readCount = 0;
const totalMainCards = document.querySelectorAll('.main-card').length;

allPics.forEach(pic => {
    pic.addEventListener('click', () => {
        // Reset Zoom state before opening
        zoomContainer.classList.remove('zoomed');
        modalImg.style.transformOrigin = 'center center';

        modalImg.src = pic.querySelector('img').src;
        const textElement = pic.querySelector('.hidden-text') || pic.querySelector('p');
        modalText.innerHTML = textElement.innerHTML;
        masterModal.classList.add('visible');

        // Track reads only for main cards
        if (pic.classList.contains('main-card') && pic.getAttribute('data-read') === 'false') {
            pic.setAttribute('data-read', 'true');
            readCount++;
            if (readCount === totalMainCards) {
                setTimeout(() => {
                    document.getElementById('finale-screen').classList.add('visible');
                    triggerKaboom(window.innerWidth / 2, window.innerHeight / 2, 150, true);
                }, 800); 
            }
        }
    });
});

// THE PAN & ZOOM ENGINE
zoomContainer.addEventListener('click', () => {
    zoomContainer.classList.toggle('zoomed');
    if (!zoomContainer.classList.contains('zoomed')) {
        modalImg.style.transformOrigin = 'center center'; // Reset when zooming out
    }
});

zoomContainer.addEventListener('mousemove', (e) => {
    if (zoomContainer.classList.contains('zoomed')) {
        const rect = zoomContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate percentages to shift the transform origin
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        
        modalImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;
    }
});

// For Mobile Touch Panning
zoomContainer.addEventListener('touchmove', (e) => {
    if (zoomContainer.classList.contains('zoomed')) {
        e.preventDefault(); // Stop scrolling the page
        const touch = e.touches[0];
        const rect = zoomContainer.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        modalImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;
    }
}, { passive: false });


closeModalBtn.addEventListener('click', () => {
    masterModal.classList.remove('visible');
});

document.getElementById('go-back-btn').addEventListener('click', () => {
    document.getElementById('finale-screen').classList.remove('visible');
    readCount = 0;
    document.querySelectorAll('.main-card').forEach(card => card.setAttribute('data-read', 'false'));
});
