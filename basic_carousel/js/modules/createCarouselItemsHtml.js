/**
 * カルーセルアイテムのHTML作成
 * @param {Object} json
 */
export default function createCarouselItemsHtml(json) {
  return `
    <div class="carousel-itemsContainer">
      <ul class="carousel-items">
        ${json.map((item, index) => `<li><a href="${item.linkUrl}${index + 1}" tabindex="-1"><img src="${item.imgPath}"></a></li>`).join('\n')}
      </ul>
    </div>`;
}