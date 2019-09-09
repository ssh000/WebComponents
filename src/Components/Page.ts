import { actions } from '../actions';
import { CarouselClass } from './Carousel';

const COMPONENTS = {
    carousel: 'app-carousel',
    search: 'app-search'
}

export class PageClass extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                :host {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    width: 100%;
                    flex-flow: column nowrap;
                }
            </style>
            <slot name="search">Search Bar</slot>
            <slot name="carousel">Carousel</slot>
        `;
        this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    }

    _updateCarouselBooks(event: CustomEvent) {
        const Carousel: CarouselClass = document.querySelector(COMPONENTS.carousel);
        Carousel.books = event.detail;
    }

    _startFetching() {
        const Carousel: CarouselClass = document.querySelector(COMPONENTS.carousel);
        Carousel.fetching = true;
    }

    _stopFetching() {
        const Carousel: CarouselClass = document.querySelector(COMPONENTS.carousel);
        Carousel.fetching = false;
    }

    connectedCallback() {
        Promise.all([
            customElements.whenDefined(COMPONENTS.search),
            customElements.whenDefined(COMPONENTS.carousel),
        ]).then(() => {
            this.addEventListener(actions.SEARCH_RESULTS_RECEIVED, this._updateCarouselBooks);
            this.addEventListener(actions.FETCHING_STARTED, this._startFetching);
            this.addEventListener(actions.FETCHING_ENDED, this._stopFetching);
        });
    }

    disconnectedCallback() {
        this.removeEventListener(actions.SEARCH_RESULTS_RECEIVED, this._updateCarouselBooks);
        this.removeEventListener(actions.FETCHING_STARTED, this._startFetching);
        this.removeEventListener(actions.FETCHING_ENDED, this._stopFetching);
    }
}