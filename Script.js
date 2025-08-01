// Dark/Light mode toggle
const toggleBtn = document.getElementById('toggle-theme');
const body = document.body;

function setMode(isLight) {
  if (isLight) {
    body.classList.add('light');
    toggleBtn.textContent = 'Dark Mode';
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.remove('light');
    toggleBtn.textContent = 'Light Mode';
    localStorage.setItem('theme', 'dark');
  }
}

toggleBtn.addEventListener('click', () => {
  setMode(!body.classList.contains('light'));
});

// Load theme from localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  setMode(true);
} else {
  setMode(false);
}

// Particle background setup
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particlesArray;
let mouse = {
  x: null,
  y: null,
  radius: 120
};

window.addEventListener('mousemove', function(event) {
  mouse.x = event.x;
  mouse.y = event.y;
});

function initParticles() {
  particlesArray = [];
  const numberOfParticles = Math.floor(window.innerWidth / 10);
  for (let i = 0; i < numberOfParticles; i++) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    let dx = (Math.random() - 0.5) * 0.7;
    let dy = (Math.random() - 0.5) * 0.7;
    particlesArray.push({x, y, dx, dy, size: 2});
  }
}

function connectParticles() {
  let maxDistance = 120;
  for (let a = 0; a < particlesArray.length; a++) {
    for (let b = a + 1; b < particlesArray.length; b++) {
      let dx = particlesArray[a].x - particlesArray[b].x;
      let dy = particlesArray[a].y - particlesArray[b].y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      // Calculate alpha with mouse interaction for glow effect
      let alpha = 1 - distance / maxDistance;
      if (mouse.x && mouse.y) {
        let dxMouse = particlesArray[a].x - mouse.x;
        let dyMouse = particlesArray[a].y - mouse.y;
        let distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < mouse.radius) {
          alpha += (1 - distMouse / mouse.radius) * 0.7; // increase glow near mouse
          alpha = Math.min(alpha, 1);
        }
      }

      if (distance < maxDistance) {
        ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
        ctx.stroke();
        ctx.closePath();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particlesArray.forEach(p => {
    // Move particles
    p.x += p.dx;
    p.y += p.dy;

    // Bounce on edges
    if (p.x > canvas.width || p.x < 0) p.dx = -p.dx;
    if (p.y > canvas.height || p.y < 0) p.dy = -p.dy;

    // Draw particle
    ctx.fillStyle = 'rgba(0,255,255,0.8)';
    ctx.shadowColor = '#00fff7';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  });

  connectParticles();

  requestAnimationFrame(animateParticles);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
}

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
animateParticles();

// Scroll progress bar
const progressBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  progressBar.style.width = scrollPercent + '%';

  // Show/hide back to top button
  if(scrollTop > 400) {
    backToTopBtn.style.display = 'flex';
  } else {
    backToTopBtn.style.display = 'none';
  }
});

// Back to top button
const backToTopBtn = document.getElementById('back-to-top');
backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Scroll-trigger fade-in for sections
const sections = document.querySelectorAll('section');

function revealSections() {
  const triggerBottom = window.innerHeight * 0.85;
  sections.forEach(section => {
    const sectionTop = section.getBoundingClientRect().top;
    if(sectionTop < triggerBottom) {
      section.classList.add('visible');
    }
  });
}
window.addEventListener('scroll', revealSections);
window.addEventListener('load', revealSections);

// 3D Cube rotation with drag, inertia, and auto-rotate
const cube = document.getElementById('cube');
let isDragging = false;
let previousX, previousY;
let rotationX = 20;
let rotationY = 20;
let velocityX = 0;
let velocityY = 0;
let momentumId = null;
let autoRotateId = null;
const friction = 0.92;
const autoRotateSpeed = 0.15; // degrees per frame approx

// Update cube transform
function updateCube() {
  cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
}

// Auto rotate function
function autoRotate() {
  if (!isDragging && Math.abs(velocityX) < 0.01 && Math.abs(velocityY) < 0.01) {
    rotationY += autoRotateSpeed;
    rotationX = Math.min(Math.max(rotationX, -90), 90);
    updateCube();
  }
  autoRotateId = requestAnimationFrame(autoRotate);
}

// Apply momentum after drag
function applyMomentum() {
  if (Math.abs(velocityX) > 0.01 || Math.abs(velocityY) > 0.01) {
    rotationY += velocityX;
    rotationX += velocityY;
    rotationX = Math.min(Math.max(rotationX, -90), 90);
    updateCube();

    velocityX *= friction;
    velocityY *= friction;

    momentumId = requestAnimationFrame(applyMomentum);
  } else {
    cancelAnimationFrame(momentumId);
    velocityX = 0;
    velocityY = 0;
  }
}

cube.addEventListener('mousedown', e => {
  isDragging = true;
  previousX = e.clientX;
  previousY = e.clientY;
  velocityX = 0;
  velocityY = 0;
  cube.style.transition = 'none';
  if (momentumId) cancelAnimationFrame(momentumId);
});

window.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    cube.style.transition = 'transform 0.5s ease';
    applyMomentum();
  }
});

window.addEventListener('mousemove', e => {
  if (!isDragging) return;

  let deltaX = e.clientX - previousX;
  let deltaY = e.clientY - previousY;

  rotationY += deltaX * 0.5;
  rotationX -= deltaY * 0.5;
  rotationX = Math.min(Math.max(rotationX, -90), 90);

  updateCube();

  velocityX = deltaX * 0.5;
  velocityY = -deltaY * 0.5;

  previousX = e.clientX;
  previousY = e.clientY;
});

// Start auto rotation loop
autoRotate();

// Initial cube transform
updateCube();
