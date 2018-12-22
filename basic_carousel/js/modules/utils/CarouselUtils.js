/**
 * Carousel.jsで使用する汎用クラス
 */
export default class CarouselUtils {
  static get CLASS_ACTIVE() {
    return 'is-active';
  }

  /**
   * カルーセルアイテムのHTML作成
   * @param {Object} json
   */
  static createCarouselItemsHtml(json) {
    return `
      <div class="carousel-itemsContainer">
        <ul class="carousel-items">
          ${json.map((item, index) => `<li><a href="${item.linkUrl}${index + 1}" tabindex="-1"><img src="${item.imgPath}"></a></li>`).join('\n')}
        </ul>
      </div>`;
  }
}