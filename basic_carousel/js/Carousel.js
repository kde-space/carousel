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
    this.carouselItemsConteiner = null;
    this.carouselContainerWidth = null;
    this.carouselItems = null;
    this.indicators = null;
    this.btns = null;
    this.init(urlRequest);
  }

  async init(url) {
    const json = await fetchJson(url);
    const html = createCarouselItemsHtml(json);
    this.carouselContainer.innerHTML = html;
    this.setCarouselItemsContainerToProps();
    this.setCarouselItemsToProp();
    this.setIndicator();
    this.setBtns();
  }

  setCarouselItemsContainerToProps() {
    const itemsContainer = this.carouselContainer.querySelector('.carousel-itemsContainer');
    if (!itemsContainer) return;
    this.itemsContainer = itemsContainer;
  }

  setCarouselItemsToProp() {
    const items = this.carouselContainer.getElementsByTagName('li');
    if (items.length <= 0) return;
    this.carouselItems = items;
  }

  setIndicator() {
    const totalItemCount = this.totalItemCount;
    const ul = document.createElement('ul');
    ul.className = 'carousel-indicator';
    const liHtml = `
      ${(() => {
        let result = '';
        for (let i = 0; i < totalItemCount; i++) {
          result += `<li><a href="#"></a></li>`;
        }
        return result;
      })()}`;
    ul.innerHTML = liHtml;
    this.itemsContainer.insertAdjacentElement('afterend', ul);
    this.indicators = ul;
  }

  setBtns() {
    const ul = document.createElement('ul');
    ul.className = 'carousel-btns';
    const liHtml = `
    <li class="prev"><a href="#"></a></li>
    <li class="next"><a href="#"></a></li>`;
    ul.innerHTML = liHtml;
    this.indicators.insertAdjacentElement('afterend', ul);
    this.btns = ul;
  }

  get totalItemCount() {
    return this.carouselItems.length;
  }
}

export default Carousel;