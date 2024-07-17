import { sleep, yearRange, fetchMovies } from './fn_helper.js';
import { languages, orders } from '../utils/utils.js'

/*------------------------  LOAD UP FILTER ---------------------------------------*/
$('#sPanelFilter').ready(function () {

    // Genres
    const genreSelect = $('#sPanelFilter').find('select[name=genre]');
    'All,Action,Adventure,Animation,Biography,Comedy,Crime,Documentary,Drama,Family,Fantasy,Film-Noir,Game-Show,History,Horror,Romance,News,Music,Musical,Mystery,Reality-TV,Sci-Fi,Sport,Thriller,Talk-Show,War,Western'.split(',').forEach(genre => {
        $('<option />', { text: genre, value: genre.toLowerCase() }).appendTo(genreSelect);
    });
    // Qualities
    const qualitySelect = $('#sPanelFilter').find('[name=quality]');
    'All,480p,720p,1080p,1080p.x265,2160p,3D'.split(',').forEach(quality => {
        $('<option />', { text: quality, value: quality }).appendTo(qualitySelect);
    });
    // Years
    const yearSelect = $('#sPanelFilter').find('select[name=year]');
    yearRange().reverse().forEach(range => {
        $('<option />', { text: range === '0' ? 'All' : range, value: range }).appendTo(yearSelect);
    });
    // Rating
    const rateSelect = $('#sPanelFilter').find('select[name=rating]');
    Array.from({ length: 10 }).reverse().forEach((i, item) => {
        const content = item === 0 ? 'All' : `${item}+`;
        $('<option />', { text: content, value: item }).appendTo(rateSelect);
    });
    // OrderBy
    const orderBySelect = $('#sPanelFilter').find('select[name=order_by]');
    for (const key in orders) {
        $('<option />', { text: orders[key], value: key }).appendTo(orderBySelect);
    }
    // SortBy
    const sortBySelect = $('#sPanelFilter').find('select[name=sort_by]');
    for (const key of ['date_added', 'title', 'year', 'rating', 'peers', 'seeds', 'download_count', 'like_count']) {
        $('<option />', { text: key, value: key }).appendTo(sortBySelect);
    }
    // Languages
    const langSelect = $('#sPanelFilter').find('select[name=language]');
    for (const key in languages) {
        $('<option />', { text: languages[key], value: key }).appendTo(langSelect);
    }

    $('#sPanelFilter').find('select').on('change', function () {
        if ($(this).attr('name') === 'year') {
            const sort_by = $('#sPanelFilter').find('select[name="sort_by"]');
            ($(this).val() != 0) ? sort_by.val('year') : sort_by.val('date_added')
        }
    })
});


/*------------------------ SEARCHING FOR A MOVIE ------------------------------*/
$('form#searchForm').on('submit', async function (evt) {

    evt.preventDefault();

    const _this = $(this);
    _this.find('#sPanelFilter').hide();
    _this.find('#sPanelResult').show();
    const searchPanel = _this.find('#sPanelResult #sPanelData');
    const query_term = _this.find('input[type=search]').val()

    searchPanel.html(`<p style="display:flex;gap:1em;align-items:center;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" width="200" height="200" style="shape-rendering: auto; display: inline-block; background: transparent;" xmlns:xlink="http://www.w3.org/1999/xlink"><g>
                    <circle stroke-linecap="round" fill="none" stroke-dasharray="69.11503837897544 69.11503837897544" stroke="#6ac045" stroke-width="10" r="44" cy="50" cx="50">
                    <animateTransform values="0 50 50;360 50 50" keyTimes="0;1" dur="3.4482758620689653s" repeatCount="indefinite" type="rotate" attributeName="transform"></animateTransform>
                        </circle><g></g></g></svg>Searching for <strong>"${query_term || 'Any movies.'}"</strong></p>`).slideDown('slow', 'swing');

    await sleep(500);
    await fetchMovies.paginateMovies({
        query_term,
        parameters: queryParameters(),
        errorCallback: () => {
            searchPanel.html('<p style="color:red">Oops!, something went wrong, please try again.</p>')
        },
        successCallback: (movies) => {
            if (movies.length) {
                const ul = $('<ul />');
                uList(ul, movies);
                searchPanel.html(ul)
            } else {
                searchPanel.html(`<p>No Match found for <strong>${term}<strong></p>`)
            }
        }
    })
})


/*------------------------ FILTER BUTTON ---------------------------------------*/
$('form#searchForm').on('click', '[type=button]#filterButton', function () {
    // Toggle the Filter Pane
    $('#sPanelResult').hide();
    $('#sPanelFilter').slideToggle().css({ display: 'grid' });
})


/*------------------------ CLOSE RESULT PANEL BUTTON ---------------------------------------*/
$('#sPanelResult').on('click', '#closeSPanelBtn', function () {
    $('#sPanelResult').slideUp();
})


$('#sPanelResult #sPanelData').on('scroll', async function (e) {
    const _this = $(this);
    if (_this.scrollTop() + e.target.clientHeight >= e.target.scrollHeight) {
        if (fetchMovies.hasMore()) {
            _this.prev().find('#sPanelLoading').css({ display: 'flex' }).fadeIn();
            await getMore();
        } else {
            _this.prev().find('#sPanelLoading').text('No more data...').fadeIn(async function () {
                await sleep(5000);
                $(this).fadeOut();
            })
        }
    }
})

async function getMore() {

    const sPanel = $('#sPanelResult');
    const loadingPanel = sPanel.find('#sPanelLoading');
    const query_term = $('form#searchForm input[type=search]').val();

    await sleep(500);
    await fetchMovies.paginateMovies({
        query_term: query_term,
        parameters: queryParameters(),
        page: fetchMovies.pageNumber() + 1,
        errorCallback: (error) => {
            loadingPanel.text('Oops!, error.').fadeIn(
                async function () {
                    await sleep(5000);
                    $(this).fadeOut();
                }
            )
        },
        successCallback: (movies) => {
            if (movies.length) {
                uList(sPanel.find('#sPanelData ul'), movies);
                loadingPanel.fadeOut()
            }
        }
    })
}

const queryParameters = () => {
    const parameters = {}
    $('#sPanelFilter').find('select').each(function (_, select) {
        parameters[$(select).attr('name')] = $(select).val();
    })
    return parameters;
}

const uList = (ul, movies) => {
    const strong = (torrents, prop1, prop2) => {
        let strong = '<strong>';
        torrents.forEach(v => {
            strong += v[prop1] ?? v;
            (prop2) && (strong += '-' + v[prop2])
            strong += ' , ';
        })
        strong += '</strong>';
        return strong
    }
    $.each(movies, function (_, movie) {
        $(`
                <li>
                    <a href="${movie.url}">
                        <figure>
                            <img src="${movie.large_cover_image}" alt="${movie.summary}">
                                <figcaption>
                                    <header>
                                        <h1>${movie.title}  <sup>${movie.year}</sup></h1>
                                        <span></span>
                                        <span><strong>Rate ${movie.rating}</strong></span>
                                    </header>
                                    <table>
                                        <thead><tr><th>Qualities</th><th>Sizes</th><th>Genres</th></tr></thead>
                                        <tbody>
                                                <tr>
                                                    <td>${strong(movie.torrents, 'type', 'quality')}</td>
                                                    <td>${strong(movie.torrents, 'size')}</td> 
                                                    <td>${strong(movie.genres)}</td>
                                                </tr>
                                        </tbody>
                                    </table>
                                </figcaption>
                        </figure>
                    </a>
                </li>
        `).appendTo(ul)
    })
}