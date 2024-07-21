$(document).ready(function () {

    import('./helpers/theme_helper.js');
    import('./helpers/search_helper.js');
    import('./components/component.carousel.js');

    $('main').pageLoader(
        {
            pages: [
                { triggerSelector: '#home', pageUrl: './src/pages/home.html', active: true },
            ],
        }
    );
})