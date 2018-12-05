'use strict';

document.addEventListener('DOMContentLoaded', function() {
  const container = document.querySelector('.container');
  const btn = container.querySelector('.btn');
  
  container.addEventListener('mouseover', function(e) {
    if (container.contains(e.relatedTarget) || e.relatedTarget === null) return
    console.log('container mouseover');
    btn.classList.remove('is-none');
  });
  
  container.addEventListener('mouseout', function(e) {
    // console.log('target', e.target);
    // console.log('relatedTarget', e.relatedTarget);
    if (container.contains(e.relatedTarget) || e.relatedTarget === null) return
    console.log('container mouseout');
    btn.classList.add('is-none');
  });

  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log('click');
  })

  btn.addEventListener('mouseover', function(e) {
    if (!container.contains(e.relatedTarget)) return;
    // console.log('target', e.target);
    // console.log('relatedTarget', e.relatedTarget);
    e.stopPropagation();
    console.log('btn mouseover');
    btn.classList.add('is-active');
  });

  btn.addEventListener('mouseout', function(e) {
    if (!container.contains(e.relatedTarget)) return;
    e.stopPropagation();
    console.log('btn mouseout');
    btn.classList.remove('is-active');
  });
});