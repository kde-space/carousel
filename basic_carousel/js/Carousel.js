async function fetchJson(url) {
  try {
    const res = await fetch(url);
    if (res.ok) {
      return res.json();
    }
    throw new Error(`Not res.ok... ${res.statusText}`);
  } catch (error) {
    throw error;
  }
}

/**
 * カルーセルアイテムのHTML作成
 * @param {Object} json 
 */
function createCarouselItemsHtml(json) {
  return `
  <div class="carousel-itemsContainer">
    <ul class="carousel-items">
      ${json.map(item => `<li><a href="${item.linkUrl}"><img src="${item.imgPath}"></a></li>`).join('\n')}
    </ul>
  </div>`;
}


class Carousel {
  constructor(urlRequest, container) {
    this.carouselContainer = container;
    this.carouselItems = null;
    this.indicators = null;
    this.btns = null;
    this.carouselItemsContainer = null;
    this.carouselMoveElement = null;
    this.carouselContainerWidth = null;
    this.carouselItemsWidths = [];
    this.currentIndex = 0;
    this.init(urlRequest);
  }

  async init(url) {
    const json = await fetchJson(url);
    const html = createCarouselItemsHtml(json);
    this.carouselContainer.innerHTML = html;
    this.setCarouselItemsContainerToProps();
    this.setCarouselItemsToProp();
    this.setCarouselItemsWidths();
    this.createIndicator();
    this.createBtns();

    // this.adEvent();
    this.move(2);
  }

  setCarouselItemsContainerToProps() {
    const itemsContainer = this.carouselContainer.querySelector('.carousel-itemsContainer');
    if (!itemsContainer) return;
    this.carouselItemsContainer = itemsContainer;
    this.carouselMoveElement = itemsContainer.querySelector('.carousel-items');
  }

  setCarouselItemsToProp() {
    const items = this.carouselContainer.getElementsByTagName('li');
    if (items.length <= 0) return;
    this.carouselItems = items;
  }

  setCarouselItemsWidths() {
    const items = this.carouselItems;
    const resultWidths = [];
    Array.prototype.slice.call(items).forEach(item => {
      const width = item.clientWidth;
      const margin = parseInt(window.getComputedStyle(item).marginRight, 10);
      const itemOuterWidth = width + margin;
      resultWidths.push(itemOuterWidth);
    });
    this.carouselItemsWidths = resultWidths;
  }

  createIndicator() {
    const totalItemCount = this.totalItemCount;
    const ul = document.createElement('ul');
    ul.className = 'carousel-indicator';
    const liHtml = `
      ${(() => {
        let result = '';
        for (let i = 0; i < totalItemCount; i++) {
          result += `<li class="${i === this.currentIndex ? 'is-active' : ''}"><a href="#"></a></li>`;
        }
        return result;
      })()}`;
    ul.innerHTML = liHtml;
    this.carouselItemsContainer.insertAdjacentElement('afterend', ul);
    this.indicators = ul;
  }

  createBtns() {
    const ul = document.createElement('ul');
    ul.className = 'carousel-btns';
    const liHtml = `
    <li class="prev"><a href="#"></a></li>
    <li class="next"><a href="#"></a></li>`;
    ul.innerHTML = liHtml;
    this.indicators.insertAdjacentElement('afterend', ul);
    this.btns = ul;
  }

  move(index) {
    if (index < 0 || index >= this.totalItemCount) return;
    let position;
    if (index == 0) {
      position = 0;
    } else {
      const ary = this.carouselItemsWidths.slice(0, index);
      position = ary.reduce((prev, current) => prev + current);
    }
    this.carouselMoveElement.style.transform = `translateX(-${position}px)`;
  }

  get totalItemCount() {
    return this.carouselItems.length;
  }

  get totalCarouselItemsWidth() {
    return this.carouselItemsWidths.reduce((prev, current) => prev + current);
  }
}

export default Carousel;