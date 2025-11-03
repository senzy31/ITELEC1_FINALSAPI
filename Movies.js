const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2YTcyMGQ0ZTk2NmEyZDJkYmI1ZmZmNGExZjhmZDA5MiIsInN1YiI6IjY5MDUyYjc4MTMyOWRlZTc2YTU5NzlmMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.oEe6fgvO7JO9UI_rFlzL9ahjJRiP8J4wf_rtX7ouxKU";

// === LOAD MOVIE DETAILS ===
async function loadMovie() {
  const params = new URLSearchParams(window.location.search);
  let movieId = params.get("id");

  // ✅ Fallback: Use data from Home.js (localStorage)
  let savedMovie = localStorage.getItem("selectedMovie");
  let movieData = savedMovie ? JSON.parse(savedMovie) : null;

  if (!movieId && movieData?.id) {
    movieId = movieData.id;
  }

  if (!movieId) return;

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`,
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
      }
    );

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    const movie = await res.json();

    // === Update Poster ===
    const posterEl = document.querySelector(".movie-poster img");
    if (posterEl)
      posterEl.src = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : movieData?.poster || "imgs/default-poster.jpg";

    // === Update Description ===
    const desc = document.querySelector(".movie-description p");
    if (desc)
      desc.textContent =
        movie.overview || "No description available for this movie.";

    // === Update Title ===
    const titleTag = document.querySelector("title");
    if (titleTag) titleTag.textContent = `JMA Cinema - ${movie.title}`;

    // === Update Showtime Header ===
    const showtimeHeader = document.querySelector(".showtime-section h2");
    if (showtimeHeader)
      showtimeHeader.textContent = `${movie.title.toUpperCase()} SHOW TIMES`;

    // === Update Runtime ===
    const runtimeEl = document.querySelector(".runtime strong");
    if (runtimeEl && movie.runtime) {
      const hours = Math.floor(movie.runtime / 60);
      const minutes = movie.runtime % 60;
      runtimeEl.textContent = `${hours}h ${minutes}m`;
    }

    // ✅ Save updated movie info back to localStorage
    localStorage.setItem(
      "selectedMovie",
      JSON.stringify({
        id: movie.id,
        title: movie.title,
        poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        date: movie.release_date,
      })
    );
  } catch (err) {
    console.error("Failed to load movie:", err);
  }
}

// === SETUP CLICK HANDLERS FOR SHOWTIMES ===
function setupShowtimeClicks() {
  const timeBoxes = document.querySelectorAll(".time-box");
  timeBoxes.forEach((box) => {
    box.addEventListener("click", (e) => {
      const movie = JSON.parse(localStorage.getItem("selectedMovie")) || {};
      const time = e.target.textContent.trim();
      const cinema = e.target
        .closest(".showtime-info")
        .querySelector("h3")
        .textContent.trim();

      localStorage.setItem(
        "selectedMovie",
        JSON.stringify({
          ...movie,
          time,
          cinema,
        })
      );

      window.location.href = "Booking.html";
    });
  });
}

// === INIT ===
document.addEventListener("DOMContentLoaded", async () => {
  await loadMovie();
  setupShowtimeClicks();
});

// === FIX: Ensure Movie ID exists on reload ===
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  let movieId = params.get("id") || localStorage.getItem("selectedMovieId");

  if (movieId && !params.get("id")) {
    const newUrl = `${window.location.pathname}?id=${encodeURIComponent(movieId)}`;
    window.history.replaceState({}, "", newUrl);
  }
});

// === FIX: Keep selected movie visible after reload ===
window.addEventListener("load", async () => {
  const savedMovie = localStorage.getItem("selectedMovie");
  if (savedMovie) {
    const movie = JSON.parse(savedMovie);
    if (movie.title && movie.poster) {
      const posterEl = document.querySelector(".movie-poster img");
      const desc = document.querySelector(".movie-description p");
      const showtimeHeader = document.querySelector(".showtime-section h2");

      if (posterEl) posterEl.src = movie.poster;
      if (desc && !desc.textContent.trim())
        desc.textContent = "Loading description...";
      if (showtimeHeader)
        showtimeHeader.textContent = `${movie.title.toUpperCase()} SHOW TIMES`;
    }
  }
});
