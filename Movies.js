const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2YTcyMGQ0ZTk2NmEyZDJkYmI1ZmZmNGExZjhmZDA5MiIsIm5iZiI6MTc2MTk0NjQ4OC40NDEsInN1YiI6IjY5MDUyYjc4MTMyOWRlZTc2YTU5NzlmMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.oEe6fgvO7JO9UI_rFlzL9ahjJRiP8J4wf_rtX7ouxKU";

async function loadMovie() {
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("id");
  if (!movieId) return;

  const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  const movie = await res.json();

  // Replace the content dynamically
  const poster = document.querySelector(".movie-poster img");
  const desc = document.querySelector(".movie-description p");
  const title = document.querySelector("title");

  if (poster) poster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  if (desc) desc.textContent = movie.overview || "No description available.";
  if (title) title.textContent = `JMA Cinema - ${movie.title}`;
}

document.addEventListener("DOMContentLoaded", loadMovie);
