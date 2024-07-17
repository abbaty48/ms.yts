/**
    A sleep function that delay a program flow for some milliseconds
    @returns a resolved promise
 */
export function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

/**  fetchMovies - get or paginate movies
 *  @returns an object with getMovies,paginateMovies, hasMore, pageNumber method
 */
export const fetchMovies = (function () {
    let pageNumber = 1;
    let hasMore = false;

    function getMovies({ query_term, page = 1, parameters } = {}) {
        return new Promise((resolve, reject) => {
            // base search url
            const yts = new URL(`https://yts.mx/api/v2/list_movies.json?page=${page}&limit=4`);
            // append search term
            (query_term) && (
                yts.searchParams.append('query_term', query_term)
            );
            if (parameters) {
                $.each(parameters, function (param, value) {
                    yts.searchParams.append(param, value)
                })
            }

            $.get({
                url: yts.href,
                // url: './query.json',
                method: 'GET',
                dataType: 'JSON',
                success: function ({ data }) { resolve(data) },
                error: function (_, textStatus, errorThrown) { reject(textStatus, errorThrown) }
            })
        })
    }

    async function paginateMovies({ query_term, page, parameters, successCallback, errorCallback } = {}) {
        try {
            const { limit, page_number, movies, movie_count } = await getMovies({ query_term, page, parameters });
            pageNumber = page_number;
            hasMore = (movies.length >= limit && movie_count > movies.length);
            if (movie_count && movies.length) {
                successCallback(movies)
            }
        } catch (error) {
            errorCallback(error)
        }
    }

    return {
        getMovies,
        paginateMovies,
        hasMore: () => hasMore,
        pageNumber: () => pageNumber,
    }
})()


/** yearRange  - generate a years from 1900 to the current
 * @returns an array of year between 1900 to the current year
 */
export  function yearRange() {
    const years = ['1900'];
    const currentYear = (new Date(Date.now()).getFullYear());
    for (let year = 1900, i = 0; year <= currentYear; year += 10, i++) {
        if (year > 1900 && year <= 1950) {
            year += 50;
        }
        if (year >= 1950) {
            const endYear = year - 10;
            years.push(`${endYear}-${year - 1}`)
            if (currentYear - (year - 1) < 10) {
                for (i = 0; year <= currentYear; year += 1, i++) {
                    years.push(`${year}`)
                }
            }
        }
    }
    years.push('0')
    return years;
}