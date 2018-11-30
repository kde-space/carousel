import Carousel from './Carousel.js';

function doCarousel() {
  const targets = document.querySelectorAll('.js-carousel');
  if (targets.length <= 0) return;
  [...targets].forEach(target => {
    const apiImages = target.dataset.apiImages;
    new Carousel(apiImages, target);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  doCarousel();
});