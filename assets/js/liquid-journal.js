(function () {
  'use strict';

  function initJournal() {
    var hero = document.querySelector('.journal-hero');
    var dashboard = document.querySelector('.journal-dashboard');
    var items = document.querySelectorAll('.reveal-item');

    if (hero && !hero.dataset.liquidReady) {
      hero.dataset.liquidReady = 'true';
      hero.addEventListener('pointermove', function (event) {
        var rect = hero.getBoundingClientRect();
        var x = ((event.clientX - rect.left) / rect.width) * 100;
        var y = ((event.clientY - rect.top) / rect.height) * 100;
        hero.style.setProperty('--glass-x', (x * 0.08 - 14) + 'rem');
        hero.style.setProperty('--glass-y', (y * 0.18 - 2) + '%');
      });
    }

    if (dashboard && !dashboard.dataset.liquidReady) {
      dashboard.dataset.liquidReady = 'true';
      dashboard.addEventListener('pointermove', function (event) {
        var panel = event.target.closest('.glass-panel');
        if (!panel) return;
        var panelRect = panel.getBoundingClientRect();
        panel.style.setProperty('--shine-x', (((event.clientX - panelRect.left) / panelRect.width) * 100) + '%');
        panel.style.setProperty('--shine-y', (((event.clientY - panelRect.top) / panelRect.height) * 100) + '%');
      });
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      Array.prototype.forEach.call(items, function (item, index) {
        item.style.setProperty('--delay', ((index % 3) * 80) + 'ms');
        observer.observe(item);
      });
    } else {
      Array.prototype.forEach.call(items, function (item) { item.classList.add('is-visible'); });
    }
  }

  document.addEventListener('DOMContentLoaded', initJournal);
  document.addEventListener('hy-push-state-load', initJournal);
}());
