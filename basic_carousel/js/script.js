import Carousel from './modules/Carousel.js';

function doCarousel() {
  const targets = document.querySelectorAll('.js-carousel');
  if (targets.length <= 0) return;
  [...targets].forEach(target => {
    const urlApi = target.dataset.apiImages;
    new Carousel(urlApi, target);
  });
}

window.addEventListener('load', () => {
  doCarousel();
});