// Video-to-Canvas Scrollytelling
// Extracts frames from video at load time, then draws them instantly on scroll.
// This avoids the laggy video.currentTime seeking behavior.

const html = document.documentElement;
const canvas = document.getElementById("hero-lightpass");
const context = canvas.getContext("2d");
const video = document.getElementById("hero-video-src");
const wrapper = document.getElementById("scrolly-section");
const loader = document.querySelector(".scrolly-loader");
const textLayers = document.querySelectorAll(".scrolly-text");

// Configuration
const TARGET_FRAMES = 120; // Number of frames to extract — good balance of smoothness vs memory
let frames = []; // Array of ImageBitmap objects
let framesReady = false;
let lastFrameIndex = -1;

// Set canvas size
function updateCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Redraw current frame after resize
    if (framesReady && lastFrameIndex >= 0) {
        drawFrame(lastFrameIndex);
    }
}
window.addEventListener("resize", updateCanvasSize);
updateCanvasSize();

// Draw a frame onto the canvas with "cover" behavior
function drawFrame(index) {
    if (index === lastFrameIndex && canvas.width > 0) return; // Skip redundant draws
    const frame = frames[index];
    if (!frame) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const fw = frame.width;
    const fh = frame.height;

    // "Cover" logic — scale to fill, then center
    const scale = Math.max(cw / fw, ch / fh);
    const drawW = fw * scale;
    const drawH = fh * scale;
    const offsetX = (cw - drawW) / 2;
    const offsetY = (ch - drawH) / 2;

    context.clearRect(0, 0, cw, ch);
    context.drawImage(frame, offsetX, offsetY, drawW, drawH);
    lastFrameIndex = index;
}

// Extract frames from the video
async function extractFrames() {
    return new Promise((resolve) => {
        video.addEventListener("loadedmetadata", async () => {
            const duration = video.duration;
            const interval = duration / TARGET_FRAMES;
            const extractedFrames = [];

            // Create an offscreen canvas for frame capture
            const offCanvas = document.createElement("canvas");
            offCanvas.width = video.videoWidth;
            offCanvas.height = video.videoHeight;
            const offCtx = offCanvas.getContext("2d");

            for (let i = 0; i < TARGET_FRAMES; i++) {
                const time = i * interval;
                video.currentTime = time;

                // Wait for the video to seek to the requested time
                await new Promise((res) => {
                    video.addEventListener("seeked", res, { once: true });
                });

                // Draw current frame to offscreen canvas
                offCtx.drawImage(video, 0, 0, offCanvas.width, offCanvas.height);

                // Create an ImageBitmap for fast rendering
                const bitmap = await createImageBitmap(offCanvas);
                extractedFrames.push(bitmap);
            }

            resolve(extractedFrames);
        }, { once: true });

        // If metadata is already loaded
        if (video.readyState >= 1) {
            video.dispatchEvent(new Event("loadedmetadata"));
        }
    });
}

// Initialize
async function init() {
    frames = await extractFrames();
    framesReady = true;

    // Draw the first frame
    drawFrame(0);

    // Hide loader
    loader.style.opacity = "0";
    setTimeout(() => {
        loader.style.display = "none";
    }, 500);
}

// Scroll handler
window.addEventListener("scroll", () => {
    if (!framesReady) return;

    requestAnimationFrame(() => {
        const scrollTop = html.scrollTop;
        const maxScroll = wrapper.scrollHeight - window.innerHeight;
        const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScroll));

        // Map scroll fraction to frame index
        const frameIndex = Math.min(
            TARGET_FRAMES - 1,
            Math.floor(scrollFraction * TARGET_FRAMES)
        );

        drawFrame(frameIndex);
        updateText(scrollFraction);
    });
});

function updateText(progress) {
    textLayers.forEach((layer) => {
        layer.style.opacity = "0";
        layer.style.transform = "translate(-50%, 20px)";
    });

    let activeIndex = -1;
    if (progress < 0.2) activeIndex = 0;
    else if (progress >= 0.2 && progress < 0.5) activeIndex = 1;
    else if (progress >= 0.5 && progress < 0.8) activeIndex = 2;
    else if (progress >= 0.8) activeIndex = 3;

    if (activeIndex !== -1) {
        textLayers[activeIndex].style.opacity = "1";
        textLayers[activeIndex].style.transform = "translate(-50%, 0)";
    }
}

init();
