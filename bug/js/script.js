'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const container = document.querySelector('.container');
  const btn = container.querySelector('.btn');

  container.addEventListener('mouseover', function (e) {
    if (container.contains(e.relatedTarget) ||
      (e.relatedTarget === null && e.target === btn)) return;
    btn.classList.remove('is-none');
  });

  container.addEventListener('mouseout', function (e) {
    if (container.contains(e.relatedTarget) ||
      (e.relatedTarget === null && e.target === btn)) return;
    btn.classList.add('is-none');
  });

  btn.addEventListener('click', function (e) {
    console.log('btn clicked');
  });

  btn.addEventListener('mouseover', function (e) {
    e.stopPropagation();
    if (e.relatedTarget === null) return;
    btn.classList.add('is-active');
  });

  btn.addEventListener('mouseout', function (e) {
    e.stopPropagation();
    if (e.relatedTarget === null) return;
    btn.classList.remove('is-active');
  });
});