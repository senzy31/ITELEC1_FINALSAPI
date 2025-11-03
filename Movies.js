// Prefer a v3 API key here for the fallback; keep your v4 token too if you have one.
const TMDB_V4_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2YTcyMGQ0ZTk2NmEyZDJkYmI1ZmZmNGExZjhmZDA5MiIsInN1YiI6IjY5MDUyYjc4MTMyOWRlZTc2YTU5NzlmMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.oEe6fgvO7JO9UI_rFlzL9ahjJRiP8J4wf_rtX7ouxKU";
// Replace with your v3 key if available (recommended for simple requests)
const TMDB_V3_KEY = "6a720d4e966a2d2dbb5fff4a1f8fd092";

// Helper: get DOM element safely
function qs(selector) {
  return document.querySelector(selector);
}

// Try fetch with v4 header first, otherwise fallback to v3 api_key query
async function tmdbFetch(urlPath) {
  const base = "https://api.themoviedb.org/3";
  const urlWithPath = `${base}${urlPath}`;

  // 1) Try with v4 header if token present
  if (TMDB_V4_TOKEN) {
    try {
      const res = await fetch(urlWithPath, {
        headers: { Authorization: `Bearer ${TMDB_V4_TOKEN}` },
      });
      if (res.ok) return res;
      // if status is 401/403 or other, we'll fall back
      console.warn("TMDB v4 header request failed, falling back to v3 key. status:", res.status);
    } catch (err) {
      console.warn("TMDB v4 header request threw, falling back to v3 key:", err);
    }
  }

  // 2) Fallback: use v3 api_key param
  const fallbackUrl = `${base}${urlPath}${urlPath.includes("?") ? "&" : "?"}api_key=${TMDB_V3_KEY}`;
  return fetch(fallbackUrl);
}

// === LOAD MOVIE DETAILS ===
async function loadMovie() {
  const params = new URLSearchParams(window.location.search);
  let movieId = params.get("id");

  // LocalStorage fallback (saved from Home list)
  const savedMovieRaw = localStorage.getItem("selectedMovie");
  const savedMovie = savedMovieRaw ? JSON.parse(savedMovieRaw) : null;

  // If no id in URL, try savedMovie.id
  if (!movieId && savedMovie?.id) {
    movieId = savedMovie.id;
    // also update URL without reload so other code can read it
    const newUrl = `${window.location.pathname}?id=${encodeURIComponent(movieId)}`;
    window.history.replaceState({}, "", newUrl);
  }

  if (!movieId) {
    console.warn("No movie id provided and no saved movie in localStorage.");
    return;
  }

  // Show loading placeholders (if elements exist)
  const posterEl = qs(".movie-poster img");
  if (posterEl) posterEl.src = savedMovie?.poster || "imgs/default-poster.jpg";

  const descContainer = qs(".movie-description");
  if (descContainer) {
    let p = descContainer.querySelector("p");
    if (!p) {
      p = document.createElement("p");
      descContainer.appendChild(p);
    }
    p.textContent = "Loading description...";
  }

  try {
    // Request movie details
    const res = await tmdbFetch(`/movie/${encodeURIComponent(movieId)}?language=en-US`);
    if (!res.ok) throw new Error(`TMDB fetch failed: ${res.status} ${res.statusText}`);

    const movie = await res.json();

    // Poster
    if (posterEl) {
      if (movie.poster_path) {
        posterEl.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
      } else if (savedMovie?.poster) {
        posterEl.src = savedMovie.poster;
      } else {
        posterEl.src = "imgs/default-poster.jpg";
      }
    }

    // Title -> document title
    if (movie.title) {
      const titleTag = qs("title");
      if (titleTag) titleTag.textContent = `JMA Cinema - ${movie.title}`;
    }

    // Description / overview
    const descElContainer = qs(".movie-description");
    if (descElContainer) {
      let p = descElContainer.querySelector("p");
      if (!p) {
        p = document.createElement("p");
        descElContainer.appendChild(p);
      }
      // Prefer API overview, then saved local overview, then fallback text
      p.textContent =
        (movie.overview && movie.overview.trim()) ||
        (savedMovie?.overview && savedMovie.overview.trim()) ||
        "No description available for this movie.";
    }

    // Showtime header
    const showtimeHeader = qs(".showtime-section h2");
    if (showtimeHeader && movie.title) {
      showtimeHeader.textContent = `${movie.title.toUpperCase()} SHOW TIMES`;
    }

    // Runtime
    const runtimeEl = qs(".runtime strong");
    if (runtimeEl && movie.runtime) {
      const hours = Math.floor(movie.runtime / 60);
      const minutes = movie.runtime % 60;
      runtimeEl.textContent = `${hours}h ${minutes}m`;
    }

    // Save updated movie info back to localStorage for navigation / booking fallback
    const toSave = {
      id: movie.id,
      title: movie.title || savedMovie?.title,
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : savedMovie?.poster,
      date: movie.release_date || savedMovie?.date,
      overview: movie.overview || savedMovie?.overview || "",
    };
    localStorage.setItem("selectedMovie", JSON.stringify(toSave));
  } catch (err) {
    console.error("Failed to load movie details:", err);

    // Fallback: show savedMovie overview if exists
    const descElContainer = qs(".movie-description");
    if (descElContainer) {
      let p = descElContainer.querySelector("p");
      if (!p) {
        p = document.createElement("p");
        descElContainer.appendChild(p);
      }
      p.textContent = savedMovie?.overview || "No description available for this movie.";
    }

    // Poster fallback already set earlier
  }
}

// === SETUP CLICK HANDLERS FOR SHOWTIMES ===
function setupShowtimeClicks() {
  // Use delegation in case time boxes are generated dynamically
  const showtimeSection = document.querySelector(".showtime-section") || document.body;
  showtimeSection.addEventListener("click", (e) => {
    const box = e.target.closest(".time-box");
    if (!box) return;

    const movie = JSON.parse(localStorage.getItem("selectedMovie") || "{}");
    // Get the displayed time text inside the box
    const timeText = box.textContent.trim();
    // Determine cinema name by traversing to parent .showtime-info
    const showtimeInfo = box.closest(".showtime-info");
    const cinemaName = showtimeInfo ? (showtimeInfo.querySelector("h3")?.textContent || "") : "";

    // Save selection and navigate
    localStorage.setItem(
      "selectedMovie",
      JSON.stringify({
        ...movie,
        time: timeText,
        cinema: cinemaName,
      })
    );

    window.location.href = "Booking.html";
  });
}

// === INIT ===
document.addEventListener("DOMContentLoaded", async () => {
  await loadMovie();
  setupShowtimeClicks();
});

// Ensure movie id persists in URL on reload if stored
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const urlId = params.get("id");
  const saved = JSON.parse(localStorage.getItem("selectedMovie") || "{}");
  const savedId = saved?.id;

  if (!urlId && savedId) {
    const newUrl = `${window.location.pathname}?id=${encodeURIComponent(savedId)}`;
    window.history.replaceState({}, "", newUrl);
  }
});

// Keep selected movie visible after full page load (poster + header)
window.addEventListener("load", () => {
  const saved = JSON.parse(localStorage.getItem("selectedMovie") || "{}");
  if (!saved) return;

  const posterEl = qs(".movie-poster img");
  const descContainer = qs(".movie-description");
  const showtimeHeader = qs(".showtime-section h2");

  if (posterEl && saved.poster) posterEl.src = saved.poster;
  if (descContainer) {
    let p = descContainer.querySelector("p");
    if (!p) {
      p = document.createElement("p");
      descContainer.appendChild(p);
    }
    if (!p.textContent.trim()) p.textContent = saved.overview || "Description will appear here.";
  }
  if (showtimeHeader && saved.title) showtimeHeader.textContent = `${saved.title.toUpperCase()} SHOW TIMES`;
});
