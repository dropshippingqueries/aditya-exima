// DOM Elements
const header = document.querySelector('header');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

// Lenis Removed for native scroll performance (Zero Lag)
// const lenis = new Lenis({...}); 
// function raf(time) {...}
// requestAnimationFrame(raf);


// Scroll Progress Bar
const progressBar = document.getElementById('progressBar');

const updateProgressBar = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    if (progressBar) {
        progressBar.style.width = `${scrollPercent}%`;
    }
};

window.addEventListener('scroll', updateProgressBar);

// Header Scroll State
const handleHeaderScroll = () => {
    // Only show background after passing the full scrolly section (approx 400vh) or a significant portion
    // User requested "header is transparent". Let's make it fully transparent at top, 
    // and glassmorphism only when scrolling deep into content.
    if (window.scrollY > window.innerHeight * 0.8) {
        header.classList.add('header-scrolled');
    } else {
        header.classList.remove('header-scrolled');
    }
};

window.addEventListener('scroll', handleHeaderScroll);
handleHeaderScroll();
updateProgressBar(); // Initialize on load

// Mobile Menu Toggle
if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
        // Toggle body scroll
        if (navLinks.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// Smooth Scroll with Offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Calculate header height offset (approx 70px-90px)
            const headerOffset = 90;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            // Native Smooth Scroll
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for Scroll Reveal
const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const revealOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Only animate once
        }
    });
}, revealOptions);

document.querySelectorAll('.scroll-reveal').forEach(el => {
    revealOnScroll.observe(el);
});

// Custom Cursor
const cursorDot = document.createElement('div');
const cursorOutline = document.createElement('div');
cursorDot.className = 'cursor-dot';
cursorOutline.className = 'cursor-outline';
document.body.appendChild(cursorDot);
document.body.appendChild(cursorOutline);

window.addEventListener('mousemove', function (e) {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Outline follows with slight delay (handled by CSS transition usually, or manual lerp)
    // For performance, simple tracking here, refined movement logic could use requestAnimationFrame
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

// Hover Effect for interactive elements
const interactiveElements = document.querySelectorAll('a, button, .product-visual, .hamburger');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        document.body.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
        document.body.classList.remove('hovering');
    });
});
