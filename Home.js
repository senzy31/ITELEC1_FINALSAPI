const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMjA5YTIzMzJhNmNhMDBiZTlhZmU3ZDE1OTFlOTQ3ZCIsIm5iZiI6MTc2MTU0NzI0MS44MjcwMDAxLCJzdWIiOiI2OGZmMTNlOTE1NjE4ZjAzOThkYTAyMjAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.7BrLe9Tt81ZEIg2T0zV8elagGYC78noCauoVOJIMJHE";

const GENRES = {
  romance: "10749",
  adventure: "12",
  drama: "18",
  comedy: "35",
  popular: "28"
};

// === FETCH MOVIES ===
async function fetchMovies(genreId = GENRES.popular) {
  const res = await fetch(
    `https://api.themoviedb.org/3/discover/movie?include_adult=false&sort_by=popularity.desc&with_genres=${genreId}`,
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );

  const container = document.getElementById("movies-container");

  if (!res.ok) {
    container.innerHTML = `<p>⚠️ OOOPSS SORRY PLEASE TRY AGAIN :( </p>`;
    return;
  }

  const data = await res.json();
  const list = data.results.slice(0, 15);

  // ==== DISPLAY POSTERS ====
  container.innerHTML = list
    .map(
      (movie) => `
      <div class="movie-card">
        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>${movie.release_date ? movie.release_date.substring(0, 4) : "No Date"}</p>
        <button>BUY TICKETS</button>
      </div>
    `
    )
    .join("");
}

// === TAB HANDLER ===
function setupTabs() {
  const tabsContainer = document.querySelector(".tabs");
  tabsContainer.innerHTML = Object.keys(GENRES)
    .map(
      (key, index) => `
        <span class="${index === 0 ? "active" : ""}" data-genre="${GENRES[key]}">
          ${key.toUpperCase()}
        </span>
      `
    )
    .join("");

  // Add click listeners
  document.querySelectorAll(".tabs span").forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class
      document.querySelectorAll(".tabs span").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Fetch by genre
      fetchMovies(tab.dataset.genre);
    });
  });
}

// === ON PAGE LOAD ===
document.addEventListener("DOMContentLoaded", () => {
  setupTabs();          // create genre tabs
  fetchMovies();        // load default (popular)
  document
    .getElementById("refresh-btn")
    .addEventListener("click", () => fetchMovies());
});
