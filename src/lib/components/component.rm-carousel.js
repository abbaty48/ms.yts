customElements.define('ms-rm-carousel', class extends HTMLElement {
    #currentIndex = 0;
    #isLoading = true;
    #onplay = false;
    #interval = null;
    #direction = 'ltr';
    #movies = [];

    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).innerHTML = `
            <style>

                @keyframes loading {50% {opacity: 0.1;}}
                @media screen and (max-width: 425px) {
                    .carousel{
                        .carousel-wrapper{
                            > ul { >li.current{
                                    width: 25em !important;
                                }
                            }
                        }
                    }
                }
                                 
                @media screen and (min-width:767px) and (max-width: 992px) {
                    .carousel{
                        .carousel-wrapper{
                            > ul { >li.current{
                                    width: 50em !important;
                                }
                            }
                        }
                    }
                }

                .carousel {
                    display: flex;
                    height: 90%;
                    overflow: hidden;
                    position: relative;
                    flex-direction: column;

                    .carousel-controls button {
                        position: absolute;
                        top: 45%; 
                        transform: translate-y(-50%);
                        background: #0002;
                        border-radius: 100%;
                        width: 2rem; height:2rem;
                        border: none; outline: none;
                        font-size: 1.5em;
                        z-index:1000;
                        cursor: pointer; color:#fff;
                        transition: scale .4s ease-out;
                        display: flex; align-items:center; justify-content:center;

                        &:hover {scale: .9}
                        &:nth-child(1){left: 10px;}
                        &:nth-child(2){right: 10px;}
                    }

                    .carousel-wrapper {
                        height: 100%;
                        overflow: hidden;
                    > ul {
                        width: 5000px;
                        margin: 0;
                        padding:0;
                        height: 100%;
                        z-index: 1000;
                        margin-left: 10px;
                        transition: all .7s ease-in;

                        &.loading > li,
                        > li.loading_trailer,
                        > li> a#closeTrailer {
                            animation: loading 2s linear infinite;
                            background: hsla(0, 0%, 0%, 0.06666666666666667);
                        }
                        
                        > li {
                            float: left;
                            height: 100%;
                            width: 25em;
                            margin: 0em;
                            margin-right: 10px;
                            border-radius: .8em;
                            list-style-type: none;
                            background: white;
                            overflow: hidden;
                            position: relative;
                            transition: width .5s ease;

                          
                            &.current {
                                width: 75em;
                                figure {
                                    img {
                                }}
                            }

                            #trailer {
                                position: absolute;
                                z-index:1000;
                                inset:0;

                                object {
                                    width:100%;height:100%;object-fit:cover;z-index:90
                                }
                                
                                a#closeTrailer {
                                    position: absolute;
                                    right:220px;
                                    top: 15px;
                                    z-index: 100;
                                    width: 20px;
                                    height: 20px;
                                    display:flex;
                                    color: #000;
                                    background:#fff;
                                    border-radius: 50%;
                                    align-items: center;
                                    font-weight: bolder;
                                    justify-content: center;
                                    text-decoration: none;

                                    &:active {scale:.8}
                                    &:hover {scale: 1.2; background: #fff8;}
                                }
                            }

                            figure {
                                margin: 0;
                                padding: 0;
                                height: 100%;
                                position: relative;
                                img {
                                    width:100%;
                                    height:100%;
                                    object-fit: cover;
                                    filter: brightness(0.6);
                                    transition: all .8s ease-in-out;

                                    &:hover {
                                        scale:1.1;
                                        filter: brightness(0.8);
                                    }
                                }
                                figcaption {
                                    position: absolute;
                                    margin: 1em;
                                    top: 50%;
                                    color: hsl(0, 0%, 100%);

                                    h1 > span {color: var(--color-title); font-size: .5em; font-weight: bold;}
                                    ul {
                                        display:flex;
                                        gap: 1em;
                                        align-items: center;
                                        list-style-type: none;
                                        margin: 0; padding:0;
                                        li {
                                            a {transition: all .4s ease-out;}
                                            a.detail {
                                                color: hsl(0, 0%, 100%);
                                                border-radius:  5px;
                                                padding: .7em 1.5em;
                                                text-decoration: none;
                                                background: hsla(0, 0%, 100%, 0.5333333333333333);

                                                &:hover {background: hsla(0, 0%, 100%, 0.6);}
                                            }
                                            a.trailer {
                                                width: 2em; height: 2em; display: flex; align-items:center;justify-content:center;cursor: pointer; background:hsla(0, 0%, 100%, 0.26666666666666666); border-radius: 50%; ;padding:10px;
                                                &:hover { scale: .7;}
                                                svg {width: 1.5em; height: 1.5em; fill:var(--color-title)}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                      }
                    }

                    .carousel-paginator {
                            display: flex;
                            padding: 0;
                            gap: .3em;
                            align-self: center;
                            margin: 5px  auto;
                            justify-content: center;
                            
                            >li {
                                    width: 8px;
                                    height: 8px;
                                    cursor: pointer;
                                    list-style: none;
                                    border-radius: 50%;
                                    background-color: hsla(0, 0%, 0%, 0.3);
                                    transition: all .5s ease-in-out;

                                    &.current {
                                        width: 16px;
                                        border-radius: 50px;
                                        background-color: hsla(0, 0%, 0%, 0.53);
                                    }

                                    &:hover {
                                        background-color: hsla(0, 0%, 0%, 0.53);
                                    }
                                }
                            }
                    }
                }
                }}
                  
            </style>
          <div  class="carousel">
            <div class="carousel-controls">
                <button>&lsaquo;</button>
                <button>&rsaquo;</button>
            </div>
            <div  class="carousel-wrapper"></div>
            <ul  class="carousel-paginator"></ul>
        </div>
        `;
    }

    get $wrapper() {
        return this.shadowRoot.querySelector('.carousel-wrapper');
    }

    get $container() {
        return this.shadowRoot.querySelector('.carousel')
    }

    get $paginator() {
        return this.shadowRoot.querySelector('.carousel-paginator')
    }
    get $prevControl() {
        return this.shadowRoot.querySelector('.carousel-controls > button:nth-child(1)')
    }
    get $nextControl() {
        return this.shadowRoot.querySelector('.carousel-controls > button:nth-child(2)')
    }

    async connectedCallback() {
        await this.loadMovies();
        this.$handleControlDisable();
        this.$prevControl.addEventListener('click', this.handlePrev.bind(this));
        this.$nextControl.addEventListener('click', this.handleNext.bind(this));
        this.$wrapper.style.width = Math.floor(this.$wrapper.firstElementChild.clientWidth * this.$wrapper.childElementCount) + 'px';
    }

    disconnectedCallback() {
        this.$prevControl.removeEventListener('click', this.handlePrev);
        this.$nextControl.removeEventListener('click', this.handleNext);
    }

    $handleControlDisable(which) {
        switch (which) {
            case 0: {
                this.$prevControl.style.display = 'block';
                this.$nextControl.style.display = 'block';
            }
                break;
            case 1: {
                this.$prevControl.style.display = 'none';
                this.$nextControl.style.display = 'block';
            }
                break;
            case 2: {
                this.$prevControl.style.display = 'block';
                this.$nextControl.style.display = 'none';
            }
                break;
            default:
                this.$prevControl.style.display = 'none';
                this.$nextControl.style.display = 'none';
                break;
        }
    }

    $paginate() {
        for (let i = 0; i < this.$wrapper.getElementsByTagName('ul')[0].childElementCount; i++) {
            const li = document.createElement('li');
            li.addEventListener('click', () => this.handlePaginate(i, li))
            if (i == 0) li.className = 'current';
            this.$paginator.appendChild(li)
        }
        this.autoPaginate()
    }

    $mqCallback(callbacks) {
        // const pcMedia = globalThis.matchMedia('(min-width: 1024px)');
        const mobileMedia = globalThis.matchMedia('(max-width: 425px)').matches;
        const tabletMedia = globalThis.matchMedia('(min-width:767px) and (max-width: 992px)').matches;
        (mobileMedia) ? callbacks['mobile']() : (tabletMedia) ? callbacks['tablet']() : callbacks['pc']();
    }

    autoPaginate() {
        // start auto pagination
        this.#interval = setInterval(() => {
            if (this.#direction === 'ltr' && this.#currentIndex >= 0) {
                if (this.#currentIndex >= this.$paginator.children.length - 1) {
                    this.#direction = 'rtl';
                    this.#currentIndex--;
                } else {
                    this.#currentIndex++;
                }
            } else if (this.#direction === 'rtl' && this.#currentIndex < this.$paginator.children.length - 1) {
                if (this.#currentIndex <= 0) {
                    this.#direction = 'ltr';
                    this.#currentIndex++;
                } else {
                    this.#currentIndex--;
                }
            }
            this.handlePaginate(this.#currentIndex, this.$paginator.children[this.#currentIndex]);
        }, 2000);
    }

    handlePaginate(index, li) {
        const ul = this.$wrapper.querySelector('ul');
        const item = ul.children.item(index);
        //
        for (const li of ul.children) {
            li.classList.remove('current');
            if (li == item) {
                li.classList.add('current')
            }
        }
        // 
        for (const _li of this.$paginator.children) {
            _li.classList.remove('current');
            if (_li == li) _li.classList.add('current');
        }

        if (index == 0) {
            ul.style.marginLeft = 10 + 'px';
            this.$handleControlDisable(1);
        } else if ((index < ul.children.length - 1) && (this.#currentIndex < ul.children.length - 1)) {
            this.$mqCallback({
                pc: () => ul.style.marginLeft = '-' + (item.clientWidth * index) - (-Math.floor(item.clientWidth / ul.children.length)) + 'px',
                mobile: () => ul.style.marginLeft = -Math.round(item.clientWidth * index % total_ML) + 'px',
                tablet: () => ul.style.marginLeft = '-' + (item.clientWidth * index) - (-0) + 'px',
            });
            this.$handleControlDisable(0);
        }
        else if (index == ul.children.length - 1) {
            this.$mqCallback({
                pc: () => ul.style.marginLeft = -(item.clientWidth * (index - 1)) - 150 + 'px',
                mobile: () => ul.style.marginLeft = -(total_ML - item.clientWidth) - 40 + 'px',
                tablet: () => ul.style.marginLeft = -(total_ML - item.clientWidth) + 'px',
            });
            this.$handleControlDisable(2);
        }
        ul.querySelector('li.loading_trailer')?.classList.remove('loading_trailer');
        ul.querySelector('#trailer')?.remove();
        if (this.#onplay) {
            this.#onplay = false;
            this.handleLoop('resume');
        } else {
            this.#onplay = false;
        }
        this.#currentIndex = index;
    }

    handleTrailer(e) {
        this.handleLoop('pause');
        let trailer_id = e.currentTarget.dataset.code,
            li_index = e.currentTarget.dataset.index;
        if (li_index == this.#currentIndex) {
            const li = this.$wrapper.querySelector('ul').children[li_index];
            li.classList.add('loading_trailer')
            const trailerDiv = document.createElement('div')
            trailerDiv.innerHTML = `<div id="trailer"><object data="http://www.youtube.com/embed/${trailer_id}"></object><a id="closeTrailer" href="javascript:;">&times;</a></div>`;
            li.appendChild(trailerDiv);
            li.querySelector('#trailer > object').onload = (e) => {
                this.#onplay = true
                li.classList.remove('loading_trailer')
            }
            li.querySelector('#trailer > a#closeTrailer').onclick = (e) => {
                this.#onplay = false;
                li.removeChild(li.lastChild)
                li.classList.remove('loading_trailer')
                li.querySelectorAll('a.trailer').forEach(a => a.onclick = (e) => this.handleTrailer(e));
            }
        }
    }

    handleDetail(e) {
        this.dispatchEvent(new CustomEvent('ondetail', { detail: { movies: this.#movies[e.currentTarget.dataset.index] } }))
    }

    handleNext(e) {
        e.preventDefault();
        this.handleLoop('pause');
        const nextIndex = ++this.#currentIndex;
        this.handlePaginate(nextIndex, this.$paginator.children[nextIndex]);
        this.handleLoop('resume');
    }
    
    handlePrev(e) {
        e.preventDefault();
        this.handleLoop('pause');
        const prevIndex = --this.#currentIndex;
        this.handlePaginate(prevIndex, this.$paginator.children[prevIndex]);
        this.handleLoop('resume');
    }

    handleLoop(action) {
        switch (action) {
            case 'pause':
                clearInterval(this.#interval);
                break;
            case 'resume': {
                !this.#onplay && this.autoPaginate();
            }
                break;
        }
    }

    async loadMovies() {
        // fetch the data from internet
        try {
            this.#isLoading = true;
            this.$wrapper.innerHTML = '<ul class="loading"><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ul>';

            let { data } = await (await fetch('https://yts.mx/api/v2/list_movies.json?limit=10')).json();
            if (data?.movies.length) {
                let index = 0;
                this.#movies = data.movies;
                this.#isLoading = false;
                this.$wrapper.innerHTML = '';
                const ul = document.createElement('ul');
                for (const movie of data.movies) {
                    ul.innerHTML += `<li>
                          <figure>
                            <img src="${movie.large_cover_image}" alt="${movie.summary}">
                              <figcaption>
                                  <header>
                                      <h1>${movie.title} <span>${movie.year}</span></h1>
                                  </header>
                                  <p>${movie.summary}</p>
                                  <ul>
                                        <li><a href="javascript:;" class="detail" data-index="${index}">Details.</a></li>
                                        ${movie.yt_trailer_code && `<li><a href="javascript:;" class="trailer" title="Watch Trailer" data-index="${index}" data-code="${movie.yt_trailer_code}">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="bx-video"><path d="M18 7c0-1.103-.897-2-2-2H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-3.333L22 17V7l-4 3.333V7zm-1.998 10H4V7h12l.001 4.999L16 12l.001.001.001 4.999z"></path></svg>
                                            </a></li>`}
                                  </ul>
                              </figcaption>
                          </figure>
                      </li>`;
                    index++;
                }
                ul.firstChild.classList.add('current')
                ul.onmouseenter = (e) => { e.preventDefault(); this.handleLoop('pause'); },
                ul.onmouseleave = (e) => { e.preventDefault(); this.handleLoop('resume'); }
                ul.querySelectorAll('a.detail').forEach(a => a.onclick = (e) => this.handleDetail(e))
                ul.querySelectorAll('a.trailer').forEach(a => a.onclick = (e) => this.handleTrailer(e))
                this.$wrapper.replaceChildren(ul)
                this.$paginate();
                this.$handleControlDisable(1)
            }
        }
        catch (error) {
        }
    }

});

