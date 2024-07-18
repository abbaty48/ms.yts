(function ($) {
    $.fn.pageLoader = function ({ pages }) {
        const plugin = $(this);
        const pageHistory = {}
        if (pages.length) {
            for (const page of pages) {
                const { triggerSelector, pageUrl, active } = page;
                // set the active element
                if (active && active === true) {
                    setActivePage(pageUrl)
                    setActiveElement(triggerSelector)
                }
                // attach a event handler to the triggerElement
                $(triggerSelector).click(function (e) {
                    e.preventDefault();
                    setActivePage(pageUrl)
                    setActiveElement(triggerSelector)
                })
            }
        }

        function setActivePage(pageUrl) {

            if (pageHistory[pageUrl]) {
                plugin.fadeOut(400, function () {
                    $(this).fadeIn(200).html(pageHistory[pageUrl])
                })
            } else {
                plugin.fadeOut(400, function () {
                    $(this).fadeIn(200).load(pageUrl, function (responseText) {
                        pageHistory[pageUrl] = responseText;
                    })
                })
            }
        }

        function setActiveElement(triggerSelector) {
            for (const page of pages) {
                if (page.triggerSelector !== triggerSelector) {
                    $(page.triggerSelector).removeClass('active')
                } else {
                    $(triggerSelector).addClass('active')
                }
            }
        }
    }
})(jQuery)