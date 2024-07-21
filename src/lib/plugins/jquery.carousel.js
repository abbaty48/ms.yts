(function ($) {

    $.fn.carousel = function (options) {
        const opts = $.extend({
            items: [],
            carouselCss: {},
            wrapperCss: {},
            carouselItemCss: {},
            carouselPaginatorCss: {}
        }, options);

        const template = $(`
        <div class="carousel">
            <ul class="carousel-wrapper"></ul>
            <ul class="carousel-pagins"></ul>
        </div>
        `).appendTo(this);
        // apply style to carouselCss
        $('.carousel').css({ ...opts.carouselCss });
        /* get wrapper, add class and create  a li element  and append it to the wrapper*/
        const carouselWrapper = template.find('.carousel-wrapper');
        carouselWrapper.css({ ...opts.wrapperCss })
        $.each(opts.items, function (i, item) {
            $('<li/>', { class: 'carousel-item', html: item, css: opts.carouselItemCss }).appendTo(carouselWrapper)
        })
        // 
        const carouselPagins = template.find('.carousel-pagins');
        // total number of li
        const carouselItemlength = carouselWrapper.find('li').length;
        // a width of a li
        const carouselItemwidth = carouselWrapper.first().width();
        // 
        const carouselWidth = (carouselItemwidth * carouselItemlength)
        // set the width of carouselWrapper base on the number of items
        carouselWrapper.css({ width: `${carouselWidth}px` });
        // store the current index
        let currentIndex = 0;
        // create pagins base on the lenght of items and attach a click function
        for (let i = 0; i < carouselItemlength % carouselItemwidth; i++) {
            const current = i === 0 ? 'class="current"' : '';
            const li = $(`<li ${current} />`).css({...opts.carouselPaginatorCss}).click(function () {
                $.move(this)
            }) //end click
            li.appendTo(carouselPagins)
        }

        $.move = function (ctx) {
            const index = $(ctx).index();
            if (currentIndex === index) {
                return
            } else {
                let marginLeft = '-' + carouselItemwidth * (index % carouselItemlength);
                carouselWrapper.animate({ 'margin-left': `${marginLeft}px` }, 1000, 'swing')
                carouselPagins.find('li.current').removeClass('current').end().find(`li:eq(${index})`).addClass('current')
                currentIndex = index;
            }
        }
    }
})(jQuery)