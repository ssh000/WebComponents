import { BookClass, BookDataType, BOOK_OPTIONS } from './Book';
import FetchingSvg from '../../icons/fetching.svg';

export class CarouselClass extends HTMLElement {
    $list: HTMLElement
    $virualList: HTMLElement
    $fetching: HTMLElement
    _books: BookDataType[]
    _booksToRender: number = 10
    _rafId: number
    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                @keyframes spin {
                    100% {
                        transform: rotate(360deg);
                    }
                }
                :host {
                    width: 100vw;
                }
                .list {
                    overflow: hidden;
                    margin: 0 16px;
                    height: auto;
                }
                .virtual-list {
                    overflow: hidden;
                    display: flex;
                    position: relative;
                    height: 320px;
                }
                .list[hidden], .fetching[hidden] {
                    display: none;
                }
                .fetching {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 16px;
                }
                .fetching svg {
                    width: 24px;
                    height: 24px;
                    fill: #777;
                    animation: spin 1s linear infinite
                }
            </style>
            <div hidden class="fetching">${FetchingSvg}</div>
            <div hidden class="list">
                <div class="virtual-list">
                </div>
            </div>
        `;
        this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
        this.$list = this.shadowRoot.querySelector('.list');
        this.$virualList = this.shadowRoot.querySelector('.virtual-list');
        this.$fetching = this.shadowRoot.querySelector('.fetching');
    }

    init(books: BookDataType[]) {
        // books to render based on the viewport size
        this._booksToRender = Math.round((this.$list.clientWidth) / BOOK_OPTIONS.width);
        // illusion of the infinity scroll
        this._books = [...books, ...books.slice(0, this._booksToRender)].map((book: BookDataType, index: number) => ({ ...book, id: index, left: index * BOOK_OPTIONS.width }));
        // infinity scroll
        this.$virualList.style.width = `${this._books.length * BOOK_OPTIONS.width}px`;
        this.$list.scrollLeft = 0;
        this.$virualList.innerHTML = '';
        if (this._rafId) cancelAnimationFrame(this._rafId);
        this._rafId = requestAnimationFrame(this.autoScroll);
    }

    set fetching(value: boolean) {
        if (value) {
            this.$fetching.removeAttribute('hidden');
            this.$list.removeAttribute('hidden');
        } else {
            this.$fetching.setAttribute('hidden', '');
        }
    }

    set books(books: BookDataType[]) {
        this.init(books);
        this.render(this._books.slice(0, this._booksToRender));
    }

    autoScroll = () => {
        if (this._endOfListReached()) {
            this.$list.scrollLeft = 0;
        } else {
            const arrayPosToViewportPos = (Math.round(this.$list.scrollLeft / BOOK_OPTIONS.width)) % this._books.length;
            this.render(this._books.slice(arrayPosToViewportPos, arrayPosToViewportPos + this._booksToRender + 3));
            this.$list.scrollLeft += 1;
        }
        this._rafId = requestAnimationFrame(this.autoScroll);
    }

    _endOfListReached(): boolean {
        return (this.$list.scrollWidth - this.$list.clientWidth) === Math.round(this.$list.scrollLeft)
    }

    _isBookRendered(book: BookDataType): boolean {
        const renderedBooks: BookClass[] = Array.from(this.$list.querySelectorAll('app-book'));
        return !renderedBooks.map((bookElement: BookClass) => bookElement.data.id).includes(book.id);
    }

    render = (books: BookDataType[]) => {
        // do not re-render books which is already in DOM
        books.forEach((book: BookDataType) => {
            if(this._isBookRendered(book) ) {
                const bookElement: BookClass = <BookClass>document.createElement('app-book');
                bookElement.book = book;
                this.$virualList.appendChild(bookElement);
            }
        });
    }
}
