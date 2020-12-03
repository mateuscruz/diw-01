const THE_MOVIE_DB_API_KEY = "1a99a0be7afc4ed774609bcb8d251341";
const API_URL              = "https://api.themoviedb.org/3";
const IMAGE_URL            = "http://image.tmdb.org/t/p/";
const REGION               = "BR"
const LANG                 = "pt-BR";
const MOVIE_BASE_URL       = "https://www.themoviedb.org/movie/";
const DEFAULT_WIDTH        = "w342";


const buildPosterPath = (path, width) => `${IMAGE_URL}/${width || DEFAULT_WIDTH}/${path}`;
const buildCarousel   = (results) => {
  const indicators = buildCarouselIndicators(results);
  let items        = '';

  for(let i = 0; i < results.length; i++) {
    items += buildCarouselItem(results[i], i === 0);
  }

  const carouselContent = `<div class="carousel-inner">${items}</div>`;
  const carouselControls = `
  <a class="carousel-control-prev" href="#carouselPopulares" role="button" data-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="sr-only">Previous</span>
  </a>
  <a class="carousel-control-next" href="#carouselPopulares" role="button" data-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="sr-only">Next</span>
  </a>`;
  const html =  indicators + carouselContent + carouselControls;

  $('#carouselPopulares').html(html);
}

const buildCarouselIndicators = (results) => {
  let listItems = "";
  for(let i = 0; i < results.length; i++) {
    listItems += `<li data-target="#carouselPopulares" data-slide-to="${i}" class="${i == 0 ? 'active' : ''}"></li>`;
  }
  return `<ol class="carousel-indicators">${listItems}</ol>`;
};

const calculateProgressClass = (progress) => {
  let type;
  if(progress < 25) {
    type = 'danger';
  } else if(progress >= 25 && progress < 50) {
    type = 'warning';
  } else if(progress >= 50 && progress < 75) {
    type = 'info';
  } else {
    type = 'success';
  }

  return `bg-${type}`;
};

const buildCarouselItem = (data, active) => {
  const progress      = data.vote_average * 10;
  const title         = data.title;
  const progressClass = calculateProgressClass(progress);
  const releaseDate   = new Date(data.release_date).getFullYear();
  const body = `
    <div class="carousel-item ${active ? 'active' : ''}">
    <div class="container">
      <div class="row">
        <div class="col-lg-12">
          <div class="media">
            <img src="${buildPosterPath(data.poster_path)}" class="align-self-start mr-3" alt="${title}">
            <div class="media-body">
              <h2 class="mt-0">${title}</h2>
              <p>
                <strong>Sinopse:</strong>
                ${data.overview}
              </p>
              <div class="row">
                <div class="col-sm-12">
                  <p>
                    <strong>Estreia:</strong> ${releaseDate}
                  </p>
                </div>
              </div>
              <div class="row">
                <div class="col-lg-12">
                  <strong>Avaliação:</strong>
                </div>
                <div class="col-lg-12">
                  <div class="progress">
                    <div class="progress-bar ${progressClass}" role="progressbar" style="width: ${progress}%" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
                      ${progress}%
                    </div>
                  </div>
                </div>
                <div class="col-lg-12">
                  <a href="${MOVIE_BASE_URL}/${data.id}?language=${LANG}">See more</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  return body;
};

const getRandomPage = () => Math.floor(Math.random() * 10) % 5 + 1;

const buildCarouselErrorPage = () => {
  const html = `
    <div class="container'>
      <div class="row">
        <div class="col-sm-12">
          <h5 class="text-danger">Occorreu um erro. Recarregue a página.</h5>
        </div>
      </div>
    </div>
  `
  $('#carouselPopulares').html(html);
};

const fetchPopularMovies = () => {
  const endpoint = `${API_URL}/movie/popular`;

  $.ajax(
    endpoint,
    {
      data: {
        api_key: THE_MOVIE_DB_API_KEY,
        language: LANG,
        region: REGION,
        page: getRandomPage()
      },
      success: (data) => buildCarousel(data.results),
      error: buildCarouselErrorPage
    }
  );
}

const buildSearchItem = (result) => {
  const title = result.title;
  const width = 'w92';
  const body = `
    <li class="media">
      <img src="${buildPosterPath(result.poster_path, width)}" class="mr-3" alt="${title}">
      <div class="media-body">
        <h5 class="mt-0 mb-1">${title}</h5>
        <p>${result.overview}</p>
        <a href="${MOVIE_BASE_URL}/${result.id}?language=${LANG}">See more</a>
      </div>
    </li>
  `;

  return body;
};

const buildSearchResults = (results) => {
  let searchItems = "";

  for(let i = 0; i < results.length; i++) {
    searchItems += `<div class="col-sm-12 col-lg-6">${buildSearchItem(results[i])}</div>`;
  }

  const html = `<ul class="list-unstyled">${searchItems}</ul>`;

  $('#resultados-pesquisa').html(html);
}

const searchMovie = (query) => {
  const endpoint = `${API_URL}/search/movie`;

  $.ajax(
    endpoint,
    {
      data: {
        api_key: THE_MOVIE_DB_API_KEY,
        language: LANG,
        region: REGION,
        query: query
      },
      success: (data) => buildSearchResults(data.results),
      error: buildCarouselErrorPage
    }
  );
}

$(document).ready(() => {
  fetchPopularMovies();
  $('#search-button').click(() => {
    const input = $('#search-input');
    const inputVal = input.val();
    if (inputVal === undefined || inputVal === '') {
      return;
    }

    searchMovie(inputVal);
  });
});
