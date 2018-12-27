import fetchJson from './utils/fetchJson.js';

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

const CLASS_ACTIVE = 'is-active';

/**
 * カルーセル
 */
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

  get isFirstCurrentIndex() {
    return this.currentIndex === 0;
  }

  get isLastCurrentIndex() {
    return this.currentIndex === this.totalItemCount - 1;
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
    const html = createCarouselItemsHtml(json);
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
          result += `<li class="${i === this.currentIndex ? CLASS_ACTIVE : ''}"><a href="#"></a></li>`;
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
        item.classList.add(CLASS_ACTIVE);
      } else {
        item.classList.remove(CLASS_ACTIVE);
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
    if (!this.isFirstCurrentIndex) {
      this.prevBtn.classList.remove('is-none');
    } else {
      this.prevBtn.classList.add('is-none');
    }
    if (!this.isLastCurrentIndex) {
      this.nextBtn.classList.remove('is-none');
    } else {
      this.nextBtn.classList.add('is-none');
    }
  }


  /**
   * カルーセル移動
   */
  move() {
    const currentIndex = this.currentIndex;
    if (currentIndex < 0 || currentIndex >= this.totalItemCount) return;
    let position;
    if (this.isFirstCurrentIndex) {
      position = 0;
    } else {
      const itemDistances = this.carouselItemsWidths.slice(0, currentIndex);
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
    const listenerClick = (targetName) => (e) => {
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
        this.prevBtn.classList.add(CLASS_ACTIVE);
        this.nextBtn.classList.add(CLASS_ACTIVE);
      },
      containerMouseout: (e) => {
        // chromeでボタンをクリック時にマウスアウトが発生する不具合解消のため条件分岐
        if (carouselContainer.contains(e.relatedTarget)
          || (e.relatedTarget === null && (this.prevBtn.contains(e.target) || this.nextBtn.contains(e.target)))) return;
        this.prevBtn.classList.remove(CLASS_ACTIVE);
        this.nextBtn.classList.remove(CLASS_ACTIVE);
      },
      btnMouseover: (e) => {
        const target = e.target;
        target.classList.add(CLASS_ACTIVE);
      },
      btnMouseout: (e) => {
        const target = e.target;
        const { btnType } = option;
        // chromeでボタンをクリック時にマウスアウトが発生する不具合解消のため条件分岐
        if (btnType === 'next' && e.relatedTarget === null && !this.isLastCurrentIndex ) return;
        if (btnType === 'prev' && e.relatedTarget === null && !this.isFirstCurrentIndex ) return;
        target.classList.remove(CLASS_ACTIVE);
      },
      nextBtnClick: listenerClick('next'),
      prevBtnClick: listenerClick('prev'),
      indicatorClick: listenerClick('indicator')
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
    [this.nextBtn, this.prevBtn].forEach(item => {
      const anchor = item.querySelector('a');
      const isNextBtn = item.classList.contains('next');
      anchor.addEventListener('mouseover', this.listener('btnMouseover'));
      anchor.addEventListener('mouseout', this.listener('btnMouseout', { btnType: isNextBtn ? 'next' : 'prev' }));
    })
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