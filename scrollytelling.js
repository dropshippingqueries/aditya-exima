// Video-to-Canvas Scrollytelling
// Extracts frames progressively — shows first frame instantly, loads rest in background.

const html = document.documentElement;
const canvas = document.getElementById("hero-lightpass");
const context = canvas.getContext("2d");
const video = document.getElementById("hero-video-src");
const wrapper = document.getElementById("scrolly-section");
const loader = document.querySelector(".scrolly-loader");
const textLayers = document.querySelectorAll(".scrolly-text");

// Configuration
const TARGET_FRAMES = 60; // 60 frames is plenty smooth for a 5s video
let frames = new Array(TARGET_FRAMES).fill(null);
let framesLoaded = 0;
let lastFrameIndex = -1;

// Set canvas size
function updateCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (lastFrameIndex >= 0 && frames[lastFrameIndex]) {
        lastFrameIndex = -1; // Force redraw
        drawFrame(lastFrameIndex);
    }
}
window.addEventListener("resize", updateCanvasSize);
updateCanvasSize();

// Draw a frame onto the canvas with "cover" behavior
function drawFrame(index) {
    // Clamp to available frames
    if (index < 0) index = 0;
    let frame = frames[index];
    // If requested frame isn't loaded yet, find the nearest loaded one
    if (!frame) {
        for (let offset = 1; offset < TARGET_FRAMES; offset++) {
            if (index - offset >= 0 && frames[index - offset]) { frame = frames[index - offset]; break; }
            if (index + offset < TARGET_FRAMES && frames[index + offset]) { frame = frames[index + offset]; break; }
        }
    }
    if (!frame) return;
    if (frame === frames[lastFrameIndex] && canvas.width > 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const fw = frame.width;
    const fh = frame.height;

    const scale = Math.max(cw / fw, ch / fh);
    const drawW = fw * scale;
    const drawH = fh * scale;
    const offsetX = (cw - drawW) / 2;
    const offsetY = (ch - drawH) / 2;

    context.clearRect(0, 0, cw, ch);
    context.drawImage(frame, offsetX, offsetY, drawW, drawH);
    lastFrameIndex = index;
}

// Hide the loader overlay
function hideLoader() {
    loader.style.opacity = "0";
    setTimeout(() => { loader.style.display = "none"; }, 400);
}

// Extract frames progressively from the video
async function extractFrames() {
    // Wait for video metadata
    if (video.readyState < 1) {
        await new Promise((res) => video.addEventListener("loadedmetadata", res, { once: true }));
    }

    const duration = video.duration;
    const interval = duration / TARGET_FRAMES;

    const offCanvas = document.createElement("canvas");
    offCanvas.width = video.videoWidth;
    offCanvas.height = video.videoHeight;
    const offCtx = offCanvas.getContext("2d");

    for (let i = 0; i < TARGET_FRAMES; i++) {
        video.currentTime = i * interval;
        await new Promise((res) => video.addEventListener("seeked", res, { once: true }));

        offCtx.drawImage(video, 0, 0, offCanvas.width, offCanvas.height);
        frames[i] = await createImageBitmap(offCanvas);
        framesLoaded++;

        // As soon as the very first frame is ready, show it and hide the loader
        if (i === 0) {
            drawFrame(0);
            hideLoader();
        }
    }
}

// Scroll handler — works as soon as any frame is loaded
window.addEventListener("scroll", () => {
    if (framesLoaded === 0) return;

    requestAnimationFrame(() => {
        const scrollTop = html.scrollTop;
        const maxScroll = wrapper.scrollHeight - window.innerHeight;
        const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScroll));

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

extractFrames();
