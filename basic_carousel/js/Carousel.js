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
        ${json.map((item, index) => `<li><a href="${item.linkUrl}${index + 1}" tabindex="-1"><img src="${item.imgPath}"></a></li>`).join('\n')}
      </ul>
    </div>`;
}


class Carousel {
  constructor(urlRequest, container) {
    this.carouselContainer = container;
    this.carouselItems = null;
    this.carouselItemAnchors = null;
    this.indicatorContainer = null;
    this.indicatorItems = null;
    this.prevBtn = null;
    this.nextBtn = null;
    this.carouselItemsContainer = null;
    this.carouselMoveElement = null;
    this.carouselContainerWidth = null;
    this.carouselItemsWidths = [];
    this.currentIndex = 0;
    this.init(urlRequest);
  }

  get totalItemCount() {
    return this.carouselItems.length;
  }

  get totalCarouselItemsWidth() {
    return this.carouselItemsWidths.reduce((prev, current) => prev + current);
  }

  get isSettedCarouselItemsWidths() {
    return this.carouselItemsWidths.length !== 0;
  }

  setCarouselItemsContainerToProp() {
    const itemsContainer = this.carouselContainer.querySelector('.carousel-itemsContainer');
    if (!itemsContainer) return;
    this.carouselItemsContainer = itemsContainer;
    this.carouselMoveElement = itemsContainer.querySelector('.carousel-items');
  }

  setCarouselItemsAndAnchorsToProp() {
    const items = this.carouselMoveElement.getElementsByTagName('li');
    const anchors = this.carouselMoveElement.getElementsByTagName('a');
    if (items.length <= 0 || anchors.length <= 0) return;
    this.carouselItems = items;
    this.carouselItemAnchors = Array.prototype.slice.call(anchors);
  }

  createCarouselMainContents(json) {
    const html = createCarouselItemsHtml(json);
    this.carouselContainer.innerHTML = html;
    this.setCarouselItemsContainerToProp();
    this.setCarouselItemsAndAnchorsToProp();
  }

  updateTabIndex(currentIndex) {
    const carouselItemAnchors = this.carouselItemAnchors;
    carouselItemAnchors.forEach((anchor, index) => {
      if (index === currentIndex) {
        anchor.tabIndex = 0;
      } else {
        anchor.tabIndex = -1;
      }
    });
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
    this.indicatorContainer = ul;
    this.indicatorItems = Array.prototype.slice.call(ul.children);
  }

  updateIndicator(currentIndex) {
    const indicators = this.indicatorItems;
    indicators.forEach((item, index) => {
      if (index === currentIndex) {
        item.classList.add('is-active');
      } else {
        item.classList.remove('is-active');
      }
    });
  }

  createBtns() {
    const ul = document.createElement('ul');
    ul.className = 'carousel-btns';
    const liHtml = `
      <li class="prev is-none"><a href="#"></a></li>
      <li class="next is-none"><a href="#"></a></li>`;
    ul.innerHTML = liHtml;
    this.indicatorContainer.insertAdjacentElement('afterend', ul);
    this.prevBtn = ul.querySelector('.prev');
    this.nextBtn = ul.querySelector('.next');
  }

  updateBtns(index) {
    if (index !== 0) {
      this.prevBtn.classList.remove('is-none');
    } else {
      this.prevBtn.classList.add('is-none');
    }
    if (index !== this.totalItemCount - 1) {
      this.nextBtn.classList.remove('is-none');
    } else {
      this.nextBtn.classList.add('is-none');
    }
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

  move(index) {
    if (index < 0 || index >= this.totalItemCount) return;
    let position;
    if (index === 0) {
      position = 0;
    } else {
      const itemDistances = this.carouselItemsWidths.slice(0, index);
      console.log(itemDistances);
      position = itemDistances.reduce((prev, current) => prev + current);
    }
    this.carouselMoveElement.style.transform = `translateX(-${position}px)`;
    this.currentIndex = index;
    this.updateBtns(index);
    this.updateTabIndex(index);
    this.updateIndicator(index);
  }

  listener(type, option = {}) {
    const carouselContainer = this.carouselContainer;

    const onceSetCarouselItemsWidths = () => {
      if (this.isSettedCarouselItemsWidths) return;
      this.setCarouselItemsWidths();
    };

    const listenerClick = (target, option = {}) => (e) => {
      e.preventDefault();
      onceSetCarouselItemsWidths();
      let nextIndex;
      switch (target) {
        case 'next':
          nextIndex = this.currentIndex + 1;
          break;
        case 'prev':
          nextIndex = this.currentIndex - 1;
          break;
        case 'indicator':
          if (option.index !== undefined) {
            nextIndex = option.index;
          }
          break;
        default:
          console.error('target is not defined.');
          nextIndex = this.currentIndex;
          break;
      }
      this.move(nextIndex);
    };

    const func = {
      containerMouseover: (e) => {
        if (carouselContainer.contains(e.relatedTarget)
          || (e.relatedTarget === null
            && (this.prevBtn.contains(e.target) || this.nextBtn.contains(e.target)))) return;
        this.prevBtn.classList.add('is-active');
        this.nextBtn.classList.add('is-active');
      },
      containerMouseout: (e) => {
        if (carouselContainer.contains(e.relatedTarget)
          || (e.relatedTarget === null && (this.prevBtn.contains(e.target) || this.nextBtn.contains(e.target)))) return;
        this.prevBtn.classList.remove('is-active');
        this.nextBtn.classList.remove('is-active');
      },
      nextBtnClick: listenerClick('next'),
      prevBtnClick: listenerClick('prev'),
      indicatorClick: listenerClick('indicator', option)
    }
    return func[type];
  }

  addListener() {
    const carouselContainer = this.carouselContainer;
    // carouselContainer.addEventListener('mouseover', this.handleEvent('containerMouseover').bind(this));
    carouselContainer.addEventListener('mouseover', this.listener('containerMouseover'));
    carouselContainer.addEventListener('mouseout', this.listener('containerMouseout'));
    this.nextBtn.addEventListener('click', this.listener('nextBtnClick'));
    this.prevBtn.addEventListener('click', this.listener('prevBtnClick'));
    this.indicatorItems.forEach((item, index) => {
      item.addEventListener('click', this.listener('indicatorClick', { index }));
    });
  }

  async init(url) {
    const json = await fetchJson(url);
    this.createCarouselMainContents(json)
    this.updateTabIndex(this.currentIndex);
    this.createIndicator();
    this.createBtns();
    this.updateBtns(this.currentIndex);
    this.addListener();
  }
}

export default Carousel;