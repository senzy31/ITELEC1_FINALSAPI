const API_KEY = "6a720d4e966a2d2dbb5fff4a1f8fd092";

// === FETCH MOVIES ===
async function fetchMovies(category = "now_playing") {
  const container = document.getElementById("movies-container");
  container.innerHTML = "<p>Loading movies...</p>";

  let url = "";

  if (category === "now_playing") {
    // ✅ NOW SHOWING
    url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1&region=PH`;
  } else if (category === "upcoming") {
    // ✅ COMING SOON — only from NOVEMBER 2025 onwards
    url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1&region=PH`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch movies");
    const data = await res.json();

    let movies = data.results;

    // ✅ Filter for NOVEMBER 2025 onwards if COMING SOON
    if (category === "upcoming") {
      const cutoffDate = new Date("2025-11-01");
      movies = movies.filter((m) => new Date(m.release_date) >= cutoffDate);
    }

    // Limit to top 10
    const list = movies.slice(0, 30);

    // ✅ Display movies
    if (list.length === 0) {
      container.innerHTML = `<p>🚫 No upcoming movies found for November 2025 or later.</p>`;
      return;
    }

    container.innerHTML = list
      .map(
        (movie) => `
      <div class="movie-card">
        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p class="movie-date">🎬 ${movie.release_date}</p>
        <button onclick="goToMovie(${movie.id})">BUY TICKETS</button>
      </div>
    `
      )
      .join("");
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p>⚠️ OOPS! Failed to load movies. Please try again later.</p>`;
  }
}

// === REDIRECT TO MOVIE PAGE ===
function goToMovie(movieId) {
  window.location.href = `Movies.html?id=${movieId}`;
}

// === SETUP TABS ===
function setupTabs() {
  const tabsContainer = document.querySelector(".tabs");
  tabsContainer.innerHTML = `
    <span class="active" data-category="now_playing">NOW SHOWING</span>
    <span data-category="upcoming">COMING SOON</span>
  `;

  document.querySelectorAll(".tabs span").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tabs span").forEach((t) =>
        t.classList.remove("active")
      );
      tab.classList.add("active");
      fetchMovies(tab.dataset.category);
    });
  });
}

// === ON PAGE LOAD ===
document.addEventListener("DOMContentLoaded", () => {
  setupTabs(); // Create the two tabs
  fetchMovies(); // Load Now Showing by default

  document.getElementById("refresh-btn").addEventListener("click", () => {
    const activeTab = document.querySelector(".tabs .active");
    fetchMovies(activeTab.dataset.category);
  });
});
