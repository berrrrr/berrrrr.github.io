(function () {
  'use strict';

  function setupRail() {
    var rail = document.querySelector('[data-category-rail]');
    var open = document.querySelector('[data-rail-toggle]');
    var close = document.querySelector('[data-rail-close]');
    var backdrop = document.querySelector('[data-rail-backdrop]');
    if (!rail || !open || !backdrop) return;

    function setOpen(value) {
      rail.classList.toggle('is-open', value);
      backdrop.hidden = !value;
      document.body.classList.toggle('rail-open', value);
      open.setAttribute('aria-expanded', value ? 'true' : 'false');
    }
    open.addEventListener('click', function () { setOpen(true); });
    if (close) close.addEventListener('click', function () { setOpen(false); });
    backdrop.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') setOpen(false); });
  }

  function setupReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (item) { item.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    Array.prototype.forEach.call(items, function (item, index) {
      item.style.setProperty('--delay', ((index % 5) * 65) + 'ms');
      observer.observe(item);
    });
  }

  function setupLiquidLight() {
    document.addEventListener('pointermove', function (event) {
      var card = event.target.closest('.bento-card--latest');
      if (!card) return;
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--shine-x', (((event.clientX - rect.left) / rect.width) * 100) + '%');
      card.style.setProperty('--shine-y', (((event.clientY - rect.top) / rect.height) * 100) + '%');
    });
  }

  function detectLanguage(block) {
    var source = block.querySelector('code') || block;
    var classes = (source.className + ' ' + block.className).split(/\s+/);
    for (var i = 0; i < classes.length; i += 1) {
      var match = classes[i].match(/(?:language-|lang-)([\w+-]+)/);
      if (match) return match[1];
    }
    var outer = block.closest('[class*="language-"]');
    if (outer) {
      var outerMatch = outer.className.match(/language-([\w+-]+)/);
      if (outerMatch) return outerMatch[1];
    }
    return 'code';
  }

  function setupCodeBlocks() {
    var prose = document.querySelector('[data-prose]');
    if (!prose) return;
    var blocks = prose.querySelectorAll('.highlighter-rouge, pre');
    Array.prototype.forEach.call(blocks, function (block) {
      if (block.matches('pre') && block.closest('.highlighter-rouge')) return;
      if (block.closest('.code-shell')) return;
      var shell = document.createElement('div');
      shell.className = 'code-shell';
      var toolbar = document.createElement('div');
      toolbar.className = 'code-toolbar';
      var language = document.createElement('span');
      language.className = 'code-lang';
      language.textContent = detectLanguage(block);
      var copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'code-copy';
      copy.textContent = 'COPY';
      block.parentNode.insertBefore(shell, block);
      toolbar.appendChild(language);
      toolbar.appendChild(copy);
      shell.appendChild(toolbar);
      shell.appendChild(block);
      copy.addEventListener('click', function () {
        var code = block.querySelector('code') || block;
        navigator.clipboard.writeText(code.textContent).then(function () {
          copy.textContent = 'COPIED';
          window.setTimeout(function () { copy.textContent = 'COPY'; }, 1400);
        });
      });
    });
  }

  function setupAds() {
    var prose = document.querySelector('[data-prose]');
    var ads = document.querySelectorAll('[data-native-ad]');
    if (!prose || !ads.length) return;
    var inlineAd = document.querySelector('[data-ad-position="inline"]');
    if (inlineAd) {
      var paragraphs = prose.querySelectorAll(':scope > p');
      var headings = prose.querySelectorAll(':scope > h2');
      var anchor = paragraphs.length >= 4 ? paragraphs[3] : (headings[0] || prose.lastElementChild);
      if (anchor && anchor.parentNode === prose) anchor.insertAdjacentElement('afterend', inlineAd);
    }
    Array.prototype.forEach.call(ads, function (ad) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        ad.classList.add('is-requested');
      } catch (error) {
        ad.classList.add('is-unavailable');
      }
    });
  }

  function setupDisqus() {
    var thread = document.getElementById('disqus_thread');
    var settings = window.moongchiDisqus;
    if (!thread || !settings) return;
    window.disqus_config = function () {
      this.page.title = settings.title;
      this.page.identifier = settings.identifier;
      this.page.url = settings.url;
    };
    var loaded = false;
    function load() {
      if (loaded) return;
      loaded = true;
      var script = document.createElement('script');
      script.src = 'https://' + settings.shortname + '.disqus.com/embed.js';
      script.setAttribute('data-timestamp', String(Date.now()));
      document.head.appendChild(script);
    }
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { load(); observer.disconnect(); }
      }, { rootMargin: '400px' });
      observer.observe(thread);
    } else load();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupRail();
    setupReveal();
    setupLiquidLight();
    setupCodeBlocks();
    setupAds();
    setupDisqus();
  });
}());
