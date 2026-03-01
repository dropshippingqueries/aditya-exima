// Fullscreen Crossfade Scrollytelling
document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    const heroSection = document.getElementById("gsap-hero-section");
    if (!heroSection) return;

    const slide1 = document.querySelector(".slide-1");
    const slide2 = document.querySelector(".slide-2");

    // Initial states
    gsap.set(slide2, { opacity: 0 });
    gsap.set(".slide-1 .hero-slide-img", { scale: 1.05 });
    gsap.set(".slide-2 .hero-slide-img", { scale: 1.1 });
    gsap.set(".hero-text-2", { opacity: 0, y: 30 });

    // Slide 1 text is VISIBLE by default (no separate intro animation)
    // This ensures it reappears when scrolling back up

    // Main Scroll Timeline — fully reversible on scroll back
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#gsap-hero-section",
            start: "top top",
            end: "+=1500",
            pin: ".hero-pin-container",
            scrub: true,    // instant scrub, no delay
        }
    });

    tl
        // Slight zoom on slide 1 while user reads
        .to(".slide-1 .hero-slide-img", { scale: 1, duration: 3, ease: "none" })
        // Fade out slide 1 text
        .to(".hero-text-1", { opacity: 0, y: -20, duration: 1, ease: "power1.in" }, "+=0.5")
        // Crossfade images
        .to(slide1, { opacity: 0, duration: 2, ease: "power1.inOut" }, "<0.5")
        .to(slide2, { opacity: 1, duration: 2, ease: "power1.inOut" }, "<")
        // Slide 2 zoom
        .to(".slide-2 .hero-slide-img", { scale: 1, duration: 3, ease: "none" }, "<0.5")
        // Fade in slide 2 text
        .to(".hero-text-2", { opacity: 1, y: 0, duration: 1.5, ease: "power2.out" }, "<1")
        // Hold
        .to({}, { duration: 1.5 });

    // Fade scroll prompt
    gsap.to(".scrolly-scroll-prompt", {
        opacity: 0,
        scrollTrigger: {
            trigger: "#gsap-hero-section",
            start: "top -5px",
            end: "top -80px",
            scrub: true
        }
    });
});
