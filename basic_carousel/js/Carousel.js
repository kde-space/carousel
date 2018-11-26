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

function getContainerElement() {
  return new Promise((resolve, reject) => {
    document.addEventListener('DOMContentLoaded', () => {
      const target = document.getElementsByClassName('js-carousel')[0];
      if (!target) {
        reject(new Error('target is not defined.'));
        return;
      }
      resolve(target);
    });
  });
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
  constructor(urlRequest) {
    this.items = [];
    this.container = null;
    this.init(urlRequest);
  }

  async init(url) {
    const [json, containerElement] = await Promise.all([fetchJson(url), getContainerElement()]);
    const html = createCarouselItemsHtml(json);
    console.log(html);
    console.log(containerElement);
    containerElement.innerHTML = html;
  }
}

export default Carousel;