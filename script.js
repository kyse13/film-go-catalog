let allMovies = [];
let currentFiltered = [];
let searchFiltered = [];
let currentIndex = 0;
const moviesPerPage = 6;

const moviesGrid = document.getElementById('moviesGrid');
const loadingIndicator = document.getElementById('loading');
const filterButtons = document.querySelectorAll('.filter-btn');

let currentGenre = 'all';

function createShowMoreButton() {
    const button = document.createElement('button');
    button.textContent = "Показать ещё";
    button.className = 'watch-btn';
    button.style.margin = '30px auto';
    button.style.display = 'block';
    button.onclick = () => {
        displayMovies(searchFiltered);
    };
    return button;
}

const showMoreButton = createShowMoreButton();

async function loadMovies() {
    try {
        loadingIndicator.classList.add('active');
        const response = await fetch('data/movies.json');

        if (!response.ok) {
            throw new Error(`Ошибка загрузки данных. Код: ${response.status}`);
        }

        const data = await response.json();
        allMovies = data.movies;
        filterMoviesByGenre('all'); 
    } catch (error) {
        console.error('Ошибка при загрузке фильмов:', error);
        moviesGrid.innerHTML = `
            <div class="error-message">
                <h3>Не удалось загрузить фильмы</h3>
                <p>${error.message}</p>
            </div>
        `;
    } finally {
        loadingIndicator.classList.remove('active');
    }
}

function displayMovies(movies) {
    if (currentIndex === 0) {
        moviesGrid.innerHTML = '';
    }

    const nextMovies = movies.slice(currentIndex, currentIndex + moviesPerPage);
    currentIndex += moviesPerPage;

    nextMovies.forEach(movie => {
        const genresString = movie.genres.map(genre => {
            const genreNames = {
                'action': 'Боевик',
                'adventure': 'Приключения',
                'animation': 'Анимация',
                'comedy': 'Комедия',
                'crime': 'Криминал',
                'drama': 'Драма',
                'family': 'Семейный',
                'fantasy': 'Фэнтези',
                'history': 'Исторический',
                'horror': 'Ужасы',
                'mystery': 'Детектив',
                'romance': 'Мелодрама',
                'sci-fi': 'Фантастика',
                'thriller': 'Триллер'
            };
            return genreNames[genre] || genre;
        }).join(', ');

        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            <img src="${movie.image}" alt="${movie.title}" class="movie-poster">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-genre">${genresString}</p>
                <p class="movie-description">${movie.description}</p>
                <div class="movie-details">
                    <span class="movie-duration">${movie.duration}</span>
                    <span class="movie-rating">${movie.rating}</span>
                </div>
            </div>
        `;
        moviesGrid.appendChild(movieCard);
        setTimeout(() => {
            movieCard.style.opacity = '1';
        }, 50);
    });

    
    if (currentIndex < movies.length) {
        if (!moviesGrid.parentNode.contains(showMoreButton)) {
            moviesGrid.parentNode.appendChild(showMoreButton);
        }
    } else {
        if (moviesGrid.parentNode.contains(showMoreButton)) {
            moviesGrid.parentNode.removeChild(showMoreButton);
        }
    }

    if (movies.length === 0) {
        moviesGrid.innerHTML = `
            <div class="no-movies">
                <h3>Фильмы не найдены</h3>
                <p>По вашему запросу ничего не найдено.</p>
            </div>
        `;
        if (moviesGrid.parentNode.contains(showMoreButton)) {
            moviesGrid.parentNode.removeChild(showMoreButton);
        }
    }
}

function filterMoviesByGenre(genre) {
    currentGenre = genre;
    currentIndex = 0;

    if (genre === 'all') {
        currentFiltered = [...allMovies];
    } else {
        currentFiltered = allMovies.filter(movie => movie.genres.includes(genre));
    }

    applySearch(document.querySelector('.search-input')?.value || '');
}

function setupSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Поиск по названию...';
    searchInput.className = 'search-input';

    searchInput.addEventListener('input', () => {
        applySearch(searchInput.value);
    });

    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.appendChild(searchInput);

    const filtersSection = document.querySelector('.filters .container');
    filtersSection.appendChild(searchContainer);
}

function applySearch(query) {
    const lower = query.trim().toLowerCase();
    searchFiltered = currentFiltered.filter(movie =>
        movie.title.toLowerCase().includes(lower)
    );
    currentIndex = 0;
    displayMovies(searchFiltered);
}

document.addEventListener('DOMContentLoaded', () => {
    loadMovies();
    setupSearch();

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const genre = this.getAttribute('data-genre');
            filterMoviesByGenre(genre);
        });
    });
});
