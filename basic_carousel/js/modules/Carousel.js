import fetchJson from './utils/common/fetchJson.js';
import CarouselUtils from './utils/CarouselUtils.js';

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

  /**
   * カルーセル要素の数を取得
   */
  get totalItemCount() {
    return this.carouselItems.length;
  }

  /**
   * カルーセル全体の横幅取得
   */
  get totalCarouselItemsWidth() {
    return this.carouselItemsWidths.reduce((prev, current) => prev + current);
  }

  /**
   * カルーセル要素群の横幅取得が完了したか
   */
  get isSettedCarouselItemsWidths() {
    return this.carouselItemsWidths.length !== 0;
  }

  /**
   * カルーセル要素群の横幅を取得
   */
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

  /**
   * カルーセル要素群の横幅を取得。一度だけ実行
   */
  onceSetCarouselItemsWidths() {
    if (this.isSettedCarouselItemsWidths) return;
    this.setCarouselItemsWidths();
  }

  /**
   * thisから参照できるようにカルーセル要素群をプロパティに設定
   */
  setCarouselItemsContainerToProp() {
    const itemsContainer = this.carouselContainer.querySelector('.carousel-itemsContainer');
    if (!itemsContainer) return;
    this.carouselItemsContainer = itemsContainer;
    this.carouselMoveElement = itemsContainer.querySelector('.carousel-items');
  }

  /**
   * thisから参照できるようにカルーセルの要素とアンカー要素をプロパティに設定
   */
  setCarouselItemsAndAnchorsToProp() {
    const items = this.carouselMoveElement.getElementsByTagName('li');
    const anchors = this.carouselMoveElement.getElementsByTagName('a');
    if (items.length <= 0 || anchors.length <= 0) return;
    this.carouselItems = items;
    this.carouselItemAnchors = Array.prototype.slice.call(anchors);
  }

  /**
   * カルーセルのメイン部分要素の作成
   * @param {object} json 
   */
  createCarouselMainContents(json) {
    const html = CarouselUtils.createCarouselItemsHtml(json);
    this.carouselContainer.innerHTML = html;
    this.setCarouselItemsContainerToProp();
    this.setCarouselItemsAndAnchorsToProp();
  }

  /**
   * 表示されているカルーセル要素だけタブでフォーカス当たるようにする
   */
  updateTabIndex() {
    const carouselItemAnchors = this.carouselItemAnchors;
    carouselItemAnchors.forEach((anchor, index) => {
      if (index === this.currentIndex) {
        anchor.tabIndex = 0;
      } else {
        anchor.tabIndex = -1;
      }
    });
  }

  /**
   * インジケーター作成
   */
  createIndicator() {
    const totalItemCount = this.totalItemCount;
    const ul = document.createElement('ul');
    ul.className = 'carousel-indicator';
    const liHtml = `
      ${(() => {
        let result = '';
        for (let i = 0; i < totalItemCount; i++) {
          result += `<li class="${i === this.currentIndex ? CarouselUtils.CLASS_ACTIVE : ''}"><a href="#"></a></li>`;
        }
        return result;
      })()}`;
    ul.innerHTML = liHtml;
    this.carouselItemsContainer.insertAdjacentElement('afterend', ul);
    this.indicatorContainer = ul;
    this.indicatorItems = Array.prototype.slice.call(ul.children);
  }

  /**
   * インジケーターの更新
   */
  updateIndicator() {
    const indicators = this.indicatorItems;
    indicators.forEach((item, index) => {
      if (index === this.currentIndex) {
        item.classList.add(CarouselUtils.CLASS_ACTIVE);
      } else {
        item.classList.remove(CarouselUtils.CLASS_ACTIVE);
      }
    });
  }

  /**
   * 左右のボタンの作成
   */
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

  /**
   * 左右のボタンの更新
   */
  updateBtns() {
    const index = this.currentIndex;
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


  /**
   * カルーセル移動
   */
  move() {
    const index = this.currentIndex;
    if (index < 0 || index >= this.totalItemCount) return;
    let position;
    if (index === 0) {
      position = 0;
    } else {
      const itemDistances = this.carouselItemsWidths.slice(0, index);
      position = itemDistances.reduce((prev, current) => prev + current);
    }
    this.carouselMoveElement.style.transform = `translateX(-${position}px)`;
  }

  /**
   * カルーセルが動いてプロパティを更新
   * @param {number} index 
   */
  moveAndUpdateProperties(index) {
    this.currentIndex = index;
    this.move();
    this.updateBtns();
    this.updateTabIndex();
    this.updateIndicator();
  }

  /**
   * イベントリスナーを管理
   * @param {string} type 
   * @param {object} option 
   */
  listener(type, option = {}) {
    const carouselContainer = this.carouselContainer;

    /**
     * クリック系を管理
     * @param {string} targetName 
     * @param {object} option 
     */
    const listenerClick = (targetName, option = {}) => (e) => {
      e.preventDefault();
      this.onceSetCarouselItemsWidths();
      let nextIndex;
      switch (targetName) {
        case 'next':
          nextIndex = this.currentIndex + 1;
          break;
        case 'prev':
          nextIndex = this.currentIndex - 1;
          break;
        case 'indicator':
          if (option.index === undefined || option.index === this.currentIndex) return;
          nextIndex = option.index;
          break;
        default:
          console.error('targetName is not defined.');
          nextIndex = this.currentIndex;
          break;
      }
      this.moveAndUpdateProperties(nextIndex);
    };

    const funcs = {
      containerMouseover: (e) => {
        // chromeでボタンをクリック時にマウスアウトが発生する不具合解消のため条件分岐
        if (carouselContainer.contains(e.relatedTarget)
          || (e.relatedTarget === null
            && (this.prevBtn.contains(e.target) || this.nextBtn.contains(e.target)))) return;
        this.prevBtn.classList.add(CarouselUtils.CLASS_ACTIVE);
        this.nextBtn.classList.add(CarouselUtils.CLASS_ACTIVE);
      },
      containerMouseout: (e) => {
        // chromeでボタンをクリック時にマウスアウトが発生する不具合解消のため条件分岐
        if (carouselContainer.contains(e.relatedTarget)
          || (e.relatedTarget === null && (this.prevBtn.contains(e.target) || this.nextBtn.contains(e.target)))) return;
        this.prevBtn.classList.remove(CarouselUtils.CLASS_ACTIVE);
        this.nextBtn.classList.remove(CarouselUtils.CLASS_ACTIVE);
      },
      nextBtnClick: listenerClick('next'),
      prevBtnClick: listenerClick('prev'),
      indicatorClick: listenerClick('indicator', option)
    }
    return funcs[type];
  }

  /**
   * イベントリスナーを設定
   */
  addListener() {
    const carouselContainer = this.carouselContainer;
    carouselContainer.addEventListener('mouseover', this.listener('containerMouseover'));
    carouselContainer.addEventListener('mouseout', this.listener('containerMouseout'));
    this.nextBtn.addEventListener('click', this.listener('nextBtnClick'));
    this.prevBtn.addEventListener('click', this.listener('prevBtnClick'));
    this.indicatorItems.forEach((item, index) => {
      item.addEventListener('click', this.listener('indicatorClick', { index }));
    });
  }

  /**
   * 初期処理
   * @param {string} url 
   */
  async init(url) {
    const json = await fetchJson(url);
    this.createCarouselMainContents(json)
    this.updateTabIndex();
    this.createIndicator();
    this.createBtns();
    this.updateBtns();
    this.addListener();
  }
}

export default Carousel;