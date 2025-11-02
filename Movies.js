const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2YTcyMGQ0ZTk2NmEyZDJkYmI1ZmZmNGExZjhmZDA5MiIsInN1YiI6IjY5MDUyYjc4MTMyOWRlZTc2YTU5NzlmMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.oEe6fgvO7JO9UI_rFlzL9ahjJRiP8J4wf_rtX7ouxKU";

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

    // Update showtime header
    const showtimeHeader = document.querySelector(".showtime-section h2");
    if (showtimeHeader) showtimeHeader.textContent = `${movie.title.toUpperCase()} SHOW TIMES`;

  } catch (err) {
    console.error("Failed to load movie:", err);
  }
}

// Load movie data
document.addEventListener("DOMContentLoaded", () => {
  loadMovie();

  // ✅ Redirect to Booking.html when time-box clicked (UPDATED)
  const timeBoxes = document.querySelectorAll(".time-box");
  timeBoxes.forEach(box => {
    box.addEventListener("click", (e) => {
      const movieTitle = document.title.replace("JMA Cinema - ", ""); // current movie
      const time = e.target.textContent.trim(); // selected time
      const cinema = e.target.closest(".showtime-info").querySelector("h3").textContent.trim(); // cinema name
      const poster = document.querySelector(".movie-poster img").src; // poster image

      // Redirect with all info
      window.location.href = `Booking.html?title=${encodeURIComponent(movieTitle)}&time=${encodeURIComponent(time)}&cinema=${encodeURIComponent(cinema)}&poster=${encodeURIComponent(poster)}`;
    });
  });
});
