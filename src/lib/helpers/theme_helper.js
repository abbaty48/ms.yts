   /*----------------------- THEMES TOGGLE --------------------------------------*/
    $('button#theme_switcher').click(function () {
        const isDarkMode = $('html').is('[theme=dark]');
        $('html').attr('theme', isDarkMode ? 'light' : 'dark');
        $(this).html(isDarkMode ?
            '<svg><use xlink:href="./src/svgs/site_symbols.svg#bxs-moon" fill="#333" /></svg>' :
            '<svg><use xlink:href="./src/svgs/site_symbols.svg#bx-sun" /></svg>'
        )
    })