const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2YTcyMGQ0ZTk2NmEyZDJkYmI1ZmZmNGExZjhmZDA5MiIsIm5iZiI6MTc2MTk0NjQ4OC40NDEsInN1YiI6IjY5MDUyYjc4MTMyOWRlZTc2YTU5NzlmMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.oEe6fgvO7JO9UI_rFlzL9ahjJRiP8J4wf_rtX7ouxKU";

async function loadMovie() {
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("id"); // e.g., Movies.html?id=12345
  if (!movieId) return;

  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    const movie = await res.json();

    // Update poster
    const poster = document.querySelector(".movie-poster img");
    if (poster) poster.src = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "imgs/default-poster.jpg";

    // Update description
    const desc = document.querySelector(".movie-description p");
    if (desc) desc.textContent = movie.overview || "No description available.";

    // Update title
    const title = document.querySelector("title");
    if (title) title.textContent = `JMA Cinema - ${movie.title}`;

    // Update runtime
    const runtimeEl = document.querySelector(".runtime strong");
    if (runtimeEl && movie.runtime) {
      const hours = Math.floor(movie.runtime / 60);
      const minutes = movie.runtime % 60;
      runtimeEl.textContent = `${hours}h ${minutes}m`;
    }

    // Optionally: Update showtime header with movie title
    const showtimeHeader = document.querySelector(".showtime-section h2");
    if (showtimeHeader) showtimeHeader.textContent = `${movie.title.toUpperCase()} SHOW TIMES`;

  } catch (err) {
    console.error("Failed to load movie:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadMovie);
