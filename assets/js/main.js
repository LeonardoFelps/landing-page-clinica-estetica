const header = document.querySelector("[data-header]");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-counter]");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const tiltItems = document.querySelectorAll("[data-tilt]");
const videos = document.querySelectorAll("[data-video]");

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const counter = entry.target;
      const target = Number(counter.dataset.counter);
      const duration = 1300;
      const start = performance.now();

      const animate = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.round(target * eased);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
      counterObserver.unobserve(counter);
    });
  },
  { threshold: 0.6 }
);

counters.forEach((counter) => counterObserver.observe(counter));

const updateParallax = () => {
  const scroll = window.scrollY;

  parallaxItems.forEach((item) => {
    const speed = Number(item.dataset.parallax);
    item.style.transform = `translate3d(0, ${scroll * speed}px, 0)`;
  });
};

updateParallax();
window.addEventListener("scroll", () => requestAnimationFrame(updateParallax), { passive: true });

tiltItems.forEach((item) => {
  item.addEventListener("mousemove", (event) => {
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -8;
    const rotateY = ((x / rect.width) - 0.5) * 8;

    item.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  item.addEventListener("mouseleave", () => {
    item.style.transform = "";
  });
});

const enableAvailableVideos = async () => {
  await Promise.all(
    Array.from(videos).map(async (video) => {
      const sources = Array.from(video.querySelectorAll("source"));
      const fallback = video.parentElement.querySelector(".video-fallback");

      for (const source of sources) {
        try {
          const response = await fetch(source.src, { method: "HEAD" });

          if (response.ok) {
            video.hidden = false;
            video.load();

            if (fallback) {
              fallback.hidden = true;
            }

            return;
          }
        } catch (error) {
          // Keep the image fallback when the video file is not available.
        }
      }
    })
  );
};

enableAvailableVideos();
