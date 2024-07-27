$(document).ready(function () {
    import('./helpers/theme_helper.js');
    import('./helpers/search_helper.js');
    import('./components/component.rm-carousel.js');
    import('./components/component.yearly-movies.js');

    $('main').pageLoader(
        {
            pages: [
                { triggerSelector: '#home', pageUrl: './src/pages/home.html', active: true },
            ],
        }
    );
})