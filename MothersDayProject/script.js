// 1. CANVAS PHYSICS ENGINE
const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
class Particle {
    constructor(x, y, isMassive = false) {
        this.x = x; this.y = y;
        this.size = Math.random() * 25 + 10;
        const angle = Math.random() * Math.PI * 2;
        const velocity = isMassive ? (Math.random() * 25 + 10) : (Math.random() * 15 + 8); 
        this.vx = Math.cos(angle) * velocity;
        this.vy = Math.sin(angle) * velocity;
        this.friction = 0.95; 
        this.gravity = 0.5;   
        this.opacity = 1;
        this.rotation = Math.random() * 360;
        this.rotSpeed = (Math.random() - 0.5) * 15;
    }
    update() {
        this.vx *= this.friction; this.vy *= this.friction; this.vy += this.gravity;
        this.x += this.vx; this.y += this.vy;
        this.opacity -= 0.012; this.rotation += this.rotSpeed;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y); ctx.rotate(this.rotation * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.font = `${this.size}px Arial`; ctx.fillText('❤️', -this.size/2, this.size/2);
        ctx.restore();
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, index) => {
        p.update(); p.draw();
        if (p.opacity <= 0) particles.splice(index, 1);
    });
    if (particles.length > 0) requestAnimationFrame(animateParticles);
}

function triggerKaboom(x, y, count, isMassive = false) {
    for(let i=0; i<count; i++) particles.push(new Particle(x, y, isMassive));
    animateParticles();
}

// 2. INTRO SCREEN & AUDIO TRIGGER
document.getElementById('enter-btn').addEventListener('click', (e) => {
    e.target.style.pointerEvents = 'none';
    
    // Play audio immediately on user interaction
    const music = document.getElementById('bg-music');
    music.volume = 0.8;
    music.play().catch(err => console.log("Audio play failed:", err));

    triggerKaboom(e.clientX || window.innerWidth/2, e.clientY || window.innerHeight/2, 50, false);

    const intro = document.getElementById('intro-screen');
    intro.style.opacity = '0';
    setTimeout(() => {
        intro.style.display = 'none';
        const board = document.getElementById('scrapboard');
        board.style.display = 'block';
        setTimeout(() => board.style.opacity = '1', 50);
    }, 1500);
});

// 3. MASTER MODAL & FINALE LOGIC
const cards = document.querySelectorAll('.memory-card');
const masterModal = document.getElementById('master-modal');
const modalImg = document.getElementById('modal-img');
const modalText = document.getElementById('modal-text');
const closeModalBtn = document.getElementById('close-modal-btn');

let readCount = 0;
const totalCards = cards.length;
let currentActiveCard = null;

cards.forEach(card => {
    card.addEventListener('click', () => {
        currentActiveCard = card;
        modalImg.src = card.querySelector('img').src;
        modalText.innerHTML = card.querySelector('.hidden-text').innerHTML;
        masterModal.classList.add('visible');
    });
});

closeModalBtn.addEventListener('click', () => {
    masterModal.classList.remove('visible');

    if (currentActiveCard && currentActiveCard.getAttribute('data-read') === 'false') {
        currentActiveCard.setAttribute('data-read', 'true');
        readCount++;
        
        // TRIGGER FINALE
        if (readCount === totalCards) {
            setTimeout(() => {
                document.getElementById('finale-screen').classList.add('visible');
                triggerKaboom(window.innerWidth / 2, window.innerHeight / 2, 150, true);
            }, 800); 
        }
    }
});

// 4. GO BACK BUTTON
document.getElementById('go-back-btn').addEventListener('click', () => {
    document.getElementById('finale-screen').classList.remove('visible');
    readCount = 0;
    cards.forEach(card => card.setAttribute('data-read', 'false'));
});