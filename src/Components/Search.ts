import { actions } from '../actions';
import { BookDataType, BOOK_OPTIONS } from './Book';

const keys = {
    ENTER: 13
};

const API = {
    searchUrl: 'http://openlibrary.org/search.json',
    coverUrl: 'http://covers.openlibrary.org/b/ID'
};

export interface SearchBookDataType {
    cover_i: number,
    title: string
}

type BookType = SearchBookDataType | BookDataType;

export class SearchClass extends HTMLElement {
    $input: HTMLInputElement
    $stats: HTMLInputElement

    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                :host {
                    margin: 8px 16px;
                }
                input {
                    padding: 16px;
                    border: 1px solid #ddd;
                    border-radius: 3px;
                }
                .stats {
                    margin-top: 8px;
                    font-size: 12px;
                    color: #777;
                }
            </style>
            <input type="text" placeholder="Search"></input>
            <div class="stats"></div>
        `;

        this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
        this.$input = this.shadowRoot.querySelector('input');
        this.$stats = this.shadowRoot.querySelector('.stats');

        this.$input.addEventListener('keydown', this.onSearch);
    }

    onSearch = (event: KeyboardEvent) => {
        if(event.keyCode === keys.ENTER && this.$input.value.length > 0) {
            const timeBeforeSearch: Date = new Date();
            this.dispatchEvent(new CustomEvent(actions.FETCHING_STARTED, { composed: true, bubbles: true }));
            fetch(`${API.searchUrl}?title=${this.$input.value}`)
                .then((response) => response.json())
                .then((data) => {
                    const secondsSinceRequest: number = (+new Date() - +timeBeforeSearch) / 1000;
                    this.$stats.innerHTML = `stats: ${secondsSinceRequest} seconds`;

                    const books: BookType[] = data.docs
                        .filter((book: SearchBookDataType) => book.cover_i)
                        .map((book: SearchBookDataType, index: number) => ({
                            id: index,
                            left: index * BOOK_OPTIONS.width,
                            title: book.title,
                            image: {
                                small: `${API.coverUrl}/${book.cover_i}-S.jpg`,
                                medium: `${API.coverUrl}/${book.cover_i}-M.jpg`,
                                large: `${API.coverUrl}/${book.cover_i}-L.jpg`,
                            },
                            cover_i: book.cover_i
                        }));

                    this.dispatchEvent(new CustomEvent(actions.FETCHING_ENDED, { composed: true, bubbles: true }));
                    this.dispatchEvent(new CustomEvent(actions.SEARCH_RESULTS_RECEIVED, { detail: books, composed: true, bubbles: true }));
                });
        }
    }
}
