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
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setOpen(false);
    });
  }

  function setupReveal(root) {
    var items = root.querySelectorAll('.reveal');
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
    }, { threshold: 0 });
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

  function setupCodeBlocks(root) {
    var prose = root.querySelector('[data-prose]');
    if (!prose) return;
    var blocks = prose.querySelectorAll('div.highlighter-rouge, pre');
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

  function setupAds(root) {
    var prose = root.querySelector('[data-prose]');
    var ads = root.querySelectorAll('[data-native-ad]');
    if (!ads.length) return;
    var inlineAd = root.querySelector('[data-ad-position="inline"]');
    if (prose && inlineAd) {
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

  function setupPage(root) {
    setupReveal(root);
    setupCodeBlocks(root);
    setupAds(root);
  }

  function setupLofiPlayer() {
    var player = document.querySelector('[data-lofi-player]');
    if (!player) return;
    var stations = [
      { name: 'ChillHop', source: 'https://streams.fluxfm.de/Chillhop/mp3-128/streams.fluxfm.de/' },
      { name: 'Chillout Radio', source: 'https://streams.fluxfm.de/chillout/mp3-128/streams.fluxfm.de/' },
      { name: 'Electronic Chillout', source: 'https://streams.fluxfm.de/klubradio/mp3-128/streams.fluxfm.de/' },
      { name: 'FluxLounge', source: 'https://streams.fluxfm.de/lounge/mp3-128/streams.fluxfm.de/' }
    ];
    var audio = player.querySelector('[data-lofi-audio]');
    var toggle = player.querySelector('[data-lofi-toggle]');
    var previous = player.querySelector('[data-lofi-previous]');
    var next = player.querySelector('[data-lofi-next]');
    var mute = player.querySelector('[data-lofi-mute]');
    var volume = player.querySelector('[data-lofi-volume]');
    var collapse = player.querySelector('[data-lofi-collapse]');
    var status = player.querySelector('[data-lofi-status]');
    var volumeStorageKey = 'moongchi-radio-volume';
    var stationStorageKey = 'moongchi-radio-station';
    var collapsedStorageKey = 'moongchi-radio-collapsed';
    var lastVolume = 0.35;
    var stationIndex = 0;
    var collapsed = false;
    var wantsPlayback = false;

    try {
      var storedVolume = window.localStorage.getItem(volumeStorageKey);
      var savedVolume = Number(storedVolume);
      if (storedVolume !== null && !Number.isNaN(savedVolume) && savedVolume >= 0 && savedVolume <= 1) lastVolume = savedVolume;
      var storedStation = Number(window.localStorage.getItem(stationStorageKey));
      if (Number.isInteger(storedStation) && storedStation >= 0 && storedStation < stations.length) stationIndex = storedStation;
      collapsed = window.localStorage.getItem(collapsedStorageKey) === 'true';
    } catch (error) {
      lastVolume = 0.35;
    }

    function setStatus(message) {
      status.textContent = message;
    }

    function renderVolume() {
      var value = audio.muted ? 0 : audio.volume;
      volume.value = audio.volume;
      volume.style.setProperty('--volume', (value * 100) + '%');
      mute.classList.toggle('is-muted', audio.muted || audio.volume === 0);
      mute.setAttribute('aria-label', audio.muted ? '음소거 해제' : '음소거');
    }

    function renderCollapsed() {
      player.classList.toggle('is-collapsed', collapsed);
      collapse.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      collapse.setAttribute('aria-label', collapsed ? '플레이어 펼치기' : '플레이어 최소화');
    }

    function updateMediaSession() {
      if (!('mediaSession' in navigator) || !('MediaMetadata' in window)) return;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: stations[stationIndex].name,
        artist: 'FluxFM'
      });
    }

    function setPlaying(value) {
      player.classList.toggle('is-playing', value);
      if (value) player.classList.remove('is-loading');
      toggle.setAttribute('aria-label', value ? '라디오 일시정지' : '라디오 재생');
      setStatus(value ? stations[stationIndex].name + ' 재생 중' : '라디오 정지됨');
    }

    function playAudio() {
      wantsPlayback = true;
      player.classList.add('is-loading');
      setStatus(stations[stationIndex].name + ' 연결 중');
      var playRequest = audio.play();
      if (playRequest) {
        playRequest.catch(function () {
          wantsPlayback = false;
          player.classList.remove('is-loading');
          setStatus('라디오를 재생할 수 없습니다. 잠시 후 다시 시도해주세요.');
        });
      }
    }

    function changeStation(direction) {
      var resumePlayback = wantsPlayback || !audio.paused;
      stationIndex = (stationIndex + direction + stations.length) % stations.length;
      audio.src = stations[stationIndex].source;
      audio.load();
      updateMediaSession();
      setStatus(stations[stationIndex].name + ' 선택됨');
      try { window.localStorage.setItem(stationStorageKey, String(stationIndex)); } catch (error) { /* noop */ }
      if (resumePlayback) playAudio();
    }

    audio.src = stations[stationIndex].source;
    audio.volume = lastVolume;
    renderVolume();
    renderCollapsed();
    updateMediaSession();

    toggle.addEventListener('click', function () {
      if (!audio.paused || player.classList.contains('is-loading')) {
        wantsPlayback = false;
        audio.pause();
        player.classList.remove('is-loading');
        setPlaying(false);
        return;
      }
      playAudio();
    });

    previous.addEventListener('click', function () { changeStation(-1); });
    next.addEventListener('click', function () { changeStation(1); });

    collapse.addEventListener('click', function () {
      collapsed = !collapsed;
      renderCollapsed();
      try { window.localStorage.setItem(collapsedStorageKey, String(collapsed)); } catch (error) { /* noop */ }
    });

    mute.addEventListener('click', function () {
      if (audio.muted || audio.volume === 0) {
        audio.muted = false;
        audio.volume = lastVolume || 0.35;
      } else {
        audio.muted = true;
      }
      renderVolume();
    });

    volume.addEventListener('input', function () {
      audio.volume = Number(volume.value);
      audio.muted = false;
      lastVolume = audio.volume;
      renderVolume();
      try { window.localStorage.setItem(volumeStorageKey, String(lastVolume)); } catch (error) { /* noop */ }
    });

    audio.addEventListener('playing', function () {
      wantsPlayback = true;
      setPlaying(true);
    });
    audio.addEventListener('pause', function () { setPlaying(false); });
    audio.addEventListener('waiting', function () { player.classList.add('is-loading'); });
    audio.addEventListener('canplay', function () { player.classList.remove('is-loading'); });
    audio.addEventListener('error', function () {
      wantsPlayback = false;
      player.classList.remove('is-loading');
      setPlaying(false);
      setStatus('라디오 연결에 실패했습니다.');
    });

    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', playAudio);
        navigator.mediaSession.setActionHandler('pause', function () {
          wantsPlayback = false;
          audio.pause();
        });
        navigator.mediaSession.setActionHandler('previoustrack', function () { changeStation(-1); });
        navigator.mediaSession.setActionHandler('nexttrack', function () { changeStation(1); });
      } catch (error) { /* unsupported action */ }
    }
  }

  function setupPageNavigation() {
    if (!window.fetch || !window.DOMParser || !window.AbortController || !window.history || !history.pushState) return;
    var cache = new Map();
    var controller = null;
    var headSelectors = [
      'meta[name="description"]',
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[property="og:type"]',
      'meta[property="og:url"]',
      'link[rel="canonical"]'
    ];

    function isPageLink(anchor, event) {
      if (!anchor || event.defaultPrevented || event.button !== 0) return false;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
      if (anchor.hasAttribute('download') || anchor.dataset.noPjax !== undefined) return false;
      if (anchor.target && anchor.target !== '_self') return false;
      var url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return false;
      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return false;
      if (/\.[a-z0-9]+$/i.test(url.pathname) && !/\.html$/i.test(url.pathname)) return false;
      return true;
    }

    function syncHead(nextDocument) {
      document.title = nextDocument.title;
      document.documentElement.lang = nextDocument.documentElement.lang || document.documentElement.lang;
      headSelectors.forEach(function (selector) {
        var current = document.head.querySelector(selector);
        var next = nextDocument.head.querySelector(selector);
        if (current && next) {
          Array.prototype.forEach.call(next.attributes, function (attribute) {
            current.setAttribute(attribute.name, attribute.value);
          });
        }
      });
      Array.prototype.forEach.call(nextDocument.head.querySelectorAll('script[src]'), function (script) {
        var source = script.getAttribute('src');
        var exists = Array.prototype.some.call(document.scripts, function (currentScript) {
          return currentScript.getAttribute('src') === source;
        });
        if (!exists) document.head.appendChild(script.cloneNode(true));
      });
    }

    function syncRail(nextDocument) {
      var currentRail = document.querySelector('[data-category-rail]');
      var nextRail = nextDocument.querySelector('[data-category-rail]');
      if (!currentRail || !nextRail) return;
      var nextLinks = {};
      Array.prototype.forEach.call(nextRail.querySelectorAll('a[href]'), function (link) {
        nextLinks[new URL(link.href, window.location.href).pathname] = link.className;
      });
      Array.prototype.forEach.call(currentRail.querySelectorAll('a[href]'), function (link) {
        var path = new URL(link.href, window.location.href).pathname;
        if (Object.prototype.hasOwnProperty.call(nextLinks, path)) link.className = nextLinks[path];
      });
    }

    function activateScripts(root) {
      Array.prototype.forEach.call(root.querySelectorAll('script'), function (oldScript) {
        var newScript = document.createElement('script');
        Array.prototype.forEach.call(oldScript.attributes, function (attribute) {
          newScript.setAttribute(attribute.name, attribute.value);
        });
        newScript.text = oldScript.text;
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    }

    function scrollToTarget(url, position) {
      if (url.hash) {
        var id = decodeURIComponent(url.hash.slice(1));
        var target = document.getElementById(id) || document.getElementsByName(id)[0];
        if (target) {
          target.scrollIntoView();
          return;
        }
      }
      window.scrollTo(position.x || 0, position.y || 0);
    }

    function saveScrollPosition() {
      var state = Object.assign({}, history.state || {}, {
        moongchi: true,
        scrollX: window.scrollX,
        scrollY: window.scrollY
      });
      history.replaceState(state, '', window.location.href);
    }

    function parsePage(html) {
      return new DOMParser().parseFromString(html, 'text/html');
    }

    function loadPage(url, options) {
      options = options || {};
      var href = url.href;
      if (controller) controller.abort();
      controller = new AbortController();
      document.body.classList.remove('rail-open');
      var rail = document.querySelector('[data-category-rail]');
      var backdrop = document.querySelector('[data-rail-backdrop]');
      var railToggle = document.querySelector('[data-rail-toggle]');
      if (rail) rail.classList.remove('is-open');
      if (backdrop) backdrop.hidden = true;
      if (railToggle) railToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.add('is-navigating');
      document.querySelector('#main-content').setAttribute('aria-busy', 'true');

      var request = cache.has(href)
        ? Promise.resolve(cache.get(href))
        : fetch(href, {
          credentials: 'same-origin',
          headers: { 'X-Requested-With': 'moongchi-navigation' },
          signal: controller.signal
        }).then(function (response) {
          if (!response.ok || !/text\/html/i.test(response.headers.get('content-type') || '')) throw new Error('Not an HTML page');
          return response.text();
        }).then(function (html) {
          cache.set(href, html);
          return html;
        });

      return request.then(function (html) {
        var nextDocument = parsePage(html);
        var nextMain = nextDocument.querySelector('#main-content');
        var currentMain = document.querySelector('#main-content');
        if (!nextMain || !currentMain) throw new Error('Page content is missing');

        syncHead(nextDocument);
        syncRail(nextDocument);
        document.body.className = nextDocument.body.className;
        nextMain = document.importNode(nextMain, true);
        currentMain.parentNode.replaceChild(nextMain, currentMain);
        activateScripts(nextMain);
        setupPage(nextMain);

        if (options.push) history.pushState({ moongchi: true, scrollX: 0, scrollY: 0 }, '', href);
        scrollToTarget(url, options.position || { x: 0, y: 0 });
        nextMain.setAttribute('tabindex', '-1');
        nextMain.focus({ preventScroll: true });
        nextMain.addEventListener('blur', function () { nextMain.removeAttribute('tabindex'); }, { once: true });
        if (window.gtag) window.gtag('event', 'page_view', { page_title: document.title, page_location: window.location.href });
        document.dispatchEvent(new CustomEvent('moongchi:page-loaded', { detail: { url: href } }));
      }).catch(function (error) {
        if (error.name === 'AbortError') return;
        window.location.href = href;
      }).finally(function () {
        var main = document.querySelector('#main-content');
        document.body.classList.remove('is-navigating');
        if (main) main.removeAttribute('aria-busy');
      });
    }

    history.scrollRestoration = 'manual';
    saveScrollPosition();

    document.addEventListener('click', function (event) {
      var anchor = event.target.closest('a[href]');
      if (!isPageLink(anchor, event)) return;
      event.preventDefault();
      saveScrollPosition();
      loadPage(new URL(anchor.href, window.location.href), { push: true });
    });

    window.addEventListener('popstate', function (event) {
      var state = event.state || {};
      loadPage(new URL(window.location.href), {
        push: false,
        position: { x: state.scrollX || 0, y: state.scrollY || 0 }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupRail();
    setupLiquidLight();
    setupLofiPlayer();
    setupPage(document);
    setupPageNavigation();
  });
}());
