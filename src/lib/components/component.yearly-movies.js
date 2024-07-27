customElements.define('ms-yearly-movies', class extends HTMLElement {
    #isLoading = true;
    #limit = 8;
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).innerHTML = `
            <style>
                @keyframes loading {50% {opacity: 0.1;}}
        
                    ul.loading li,
                    [id="002"].loading span
                    {
                        animation: loading 2s linear infinite;
                        background: hsla(0, 0%, 0%, 0.06666666666666667);
                    }

                    [id="01"] {
                    position:relative;
                        >[id="001"]{
                            >ul{
                                gap:1em;
                                display:grid;
                                margin:0; padding:0;
                                margin-right:3em;
                                grid-template-columns: repeat(auto-fit, minmax(min(20em, 100%), 1fr));
                                
                                li{
                                    margin:1em;
                                    min-height: 300px;
                                    border-radius: .8em;
                                    list-style-type: none;
                                    background: white;
                                    overflow: hidden;
                                    position: relative;
                                    transition: width .5s ease;
                                         figure {
                                            margin: 0;
                                            padding: 0;
                                            height: 100%;
                                            position: relative;
                                            img {
                                                width:100%;
                                                height:100%;
                                                object-fit: cover;
                                                max-width:100%;
                                                transition: all .8s ease-in-out;

                                                &:hover {
                                                    filter: brightness(0.8);
                                                }
                                            }
                                            figcaption {
                                                position: absolute;
                                                margin: 1em;
                                                bottom: 10%;
                                                color: hsl(0, 0%, 100%);

                                                h1 > span {color: var(--color-title); font-size: .5em; font-weight: bold;}
                                                a.detail {
                                                    color: hsl(0, 0%, 100%);
                                                    border-radius:  5px;
                                                    padding: .7em 1.5em;
                                                    text-decoration: none;
                                                    background: hsla(0, 0%, 100%, 0.5333333333333333);

                                                    &:hover {background: hsla(0, 0%, 100%, 0.6);}
                                                }
                                            }
                                    }                  
                                }
                            }
                        }
                        >[id="002"]{
                            position:absolute;
                            right: .8em;
                            top: 50%;
                            display: flex;
                            gap: .5em;
                            align-items: center;
                            flex-direction: column;
                            &.loading span {width: .5em;height:.5em; border-radius:50%; pointer-events: none;}
                            
                            > span {
                                display:block;
                                font-size:2em;
                                transition: all .5s ease-out;
                                &:nth-child(2) {font-size:1.5rem; user-select: none;}
                                &:nth-child(odd){cursor:pointer;}
                                &:nth-child(odd):active{scale: 1.2;}
                                &:nth-child(odd)[disabled]{opacity: 0.2; pointer-events:none;}
                                &:nth-child(odd):hover {background: #0005; border-radius: 50%;}
                            }
                        }
                    }

            </style>
            <div id="01">
                <div id="001"></div>
                <div id="002"></div>
            </div>
        `;
    }


    get $paginator() {
        return this.shadowRoot.querySelector('[id="002"]');
    }
    get $listContainer() {
        return this.shadowRoot.querySelector('[id="001"]');
    }
    get $currentYear() {
        let _y = new Date();
        // if the month is january and less than 2weeks, return the year lastYear-currentYear, else currentYear
        _y = (_y.getMonth() == 0 && _y.getUTCDate() <= 14) ? `${_y.getUTCFullYear() - 1}-${_y.getUTCFullYear()}` : _y.getUTCFullYear();
        return _y;
    }

    $paginate(total, pageNumber, limit = 8) {
        this.$paginator.replaceChildren();
        if (this.#isLoading) {
            this.$paginator.className = 'loading';
            this.$paginator.innerHTML = `<span></span><span></span><span></span>`;
        } else {
            const lastPage = Math.ceil(total / limit), firstPage = 1;
            this.$paginator.classList.remove('loading');
            this.$paginator.innerHTML = `
                <span role='button' ${pageNumber === firstPage && 'disabled'} data-paging='previous'>\u25b4</span>
                <span>${pageNumber ?? 1}</span>
                <span role='button' ${pageNumber === lastPage && 'disabled'} data-paging='next'>\u25be</span>
            `;
            this.$paginator.querySelectorAll('span:nth-child(odd)').forEach(span => span.addEventListener('click', (evt) => {
                evt.preventDefault()
                if (evt.currentTarget.dataset.paging === 'next') {
                    if (pageNumber >= firstPage) {
                        this.getMovies(this.$url(pageNumber + 1))
                    }
                } else {
                    if (pageNumber < lastPage) {
                        this.getMovies(this.$url(pageNumber - 1))
                    }
                }
            }));
        }
    }

    $url(page, year) {
        return `https://yts.mx/api/v2/list_movies.json?limit=${this.#limit}&sort_by=year&year=${year ?? this.$currentYear}&page=${page ?? 1}`
    }

    connectedCallback() {
        this.#mediaQuery();
        this.getMovies();
    }

    #mediaQuery() {
        const pcMedia = globalThis.matchMedia('(min-width: 1024px)');
        const mobileMedia = globalThis.matchMedia('(max-width: 425px)');
        const tabletMedia = globalThis.matchMedia('(min-width:767px) and (max-width: 992px)');

        (mobileMedia.matches) ? this.#limit = 2 :
            (tabletMedia.matches) ? this.#limit = 4 : this.#limit = 8;

        pcMedia.onchange = (evt) => { evt.matches && (this.#limit = 8, this.getMovies()); }
        tabletMedia.onchange = (evt) => { evt.matches && (this.#limit = 4, this.getMovies()); }
        mobileMedia.onchange = (evt) => { evt.matches && (this.#limit = 2, this.getMovies()); }
    }

    async getMovies(url = this.$url()) {
        // fetch the data from internet
        try {
            this.#isLoading = true;
            this.$listContainer.innerHTML = `<ul class="loading">${Array.from({length: this.#limit}, () => '<li></li>').join('')}</ul>`;
            this.$paginate()

            let { data: { movies, movie_count, page_number, limit } } = await (await fetch(url)).json();
            if (movies?.length) {
                let index = 0;
                this.#isLoading = false;
                this.$listContainer.innerHTML = '';
                const ul = document.createElement('ul');
                for (const movie of movies) {
                    ul.innerHTML += `<li>
                          <figure>
                            <img src="${movie.medium_cover_image}" alt="${movie.summary}">
                              <figcaption>
                                    <h1>${movie.title} <span>${movie.year}</span></h1>
                                    <a href="javascript:;" class="detail" data-index="${index}">Details.</a>
                              </figcaption>
                          </figure>
                      </li>`;
                    index++;
                }
                ul.querySelectorAll('a.detail').forEach(a => a.onclick = (e) => this.handleDetail(e))
                this.$listContainer.replaceChildren(ul);
                this.$paginate(movie_count, page_number, limit);
            }
        }
        catch (error) {
            // console.log('ERR ', error);
        }
    }
})