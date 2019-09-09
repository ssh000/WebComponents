import { BookClass } from './Components/Book';
import { PageClass } from './Components/Page';
import { CarouselClass } from './Components/Carousel';
import { SearchClass } from './Components/Search';

customElements.define('app-search', SearchClass);
customElements.define('app-carousel', CarouselClass);
customElements.define('app-page', PageClass);
customElements.define('app-book', BookClass);