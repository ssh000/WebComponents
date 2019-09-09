export interface BookDataType {
    id: number,
    title: string,
    image: {
        small: string,
        medium: string,
        large: string
    },
    left: number,
    cover_i: number
}

// We need that in order to calculate a book position for a virual scroll
export const BOOK_OPTIONS = {
    width: 180
};

export class BookClass extends HTMLElement {
    _book: BookDataType
    _destroyId: number
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    set destroyIn(delay: number) {
        if (this._destroyId) return;
        this._destroyId = setTimeout(() => this.remove(), delay);
    }

    set book(book: BookDataType) {
        this._book = book;
        this.render();
    }

    get data(): BookDataType {
        return this._book;
    }

    render = () => {
        this.innerHTML = '';
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                :host {
                    display: block;
                    height: auto;
                    width: ${BOOK_OPTIONS.width}px;
                    position: absolute;
                    left: ${this._book.left}px;
                }
                img {
                    width: ${BOOK_OPTIONS.width}px;
                    height: 265px;
                    display: block;
                    object-fit: cover;
                }
                .title {
                    padding: 16px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    text-align: center;
                    font-weight: bold;
                }
            </style>
            <div class="book">
                <picture>
                    <source srcset="${this._book.image.large}" media="(min-width: 1921px)">
                    <source srcset="${this._book.image.medium}" media="(min-width: 801px)">
                    <source srcset="${this._book.image.small}" media="(min-width: 300px) and (max-width: 800px)">
                    <img src="${this._book.image.medium}">
                </picture>
                <div class="title" title=${this._book.title}>
                    ${this._book.title}
                </div>
            </div>
        `;
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}