'use strict';
(() => {
  const svg = document.querySelector('#travel-map');
  const ns = 'http://www.w3.org/2000/svg';
  const status = document.querySelector('#map-status');
  const detail = document.querySelector('#destination-detail');
  const list = document.querySelector('#destination-list');
  let zoom = 1;
  let visitedRegions = new Set();
  const paintRegions = () => {
    for (const path of document.querySelectorAll('.land')) path.classList.toggle('visited', visitedRegions.has(path.dataset.region));
  };
  let center = [500, 270];
  const project = (place) => [(place.longitude + 180) / 360 * 1000, (85 - place.latitude) / 170 * 540];
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const updateZoom = () => {
    const w = 1000 / zoom, h = 540 / zoom;
    const x = Math.max(0, Math.min(1000 - w, center[0] - w / 2));
    const y = Math.max(0, Math.min(540 - h, center[1] - h / 2));
    svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
    document.querySelector('#zoom-out').disabled = zoom === 1;
    document.querySelector('#zoom-in').disabled = zoom === 4;
  };
  document.querySelector('#zoom-in').addEventListener('click', () => { zoom = Math.min(4, zoom + 1); updateZoom(); });
  document.querySelector('#zoom-out').addEventListener('click', () => { zoom = Math.max(1, zoom - 1); updateZoom(); });
  document.querySelector('#zoom-reset').addEventListener('click', () => { zoom = 1; center = [500, 270]; updateZoom(); });
  updateZoom();
  const readJSON = async (url) => {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  };
  readJSON('assets/data/world-paths.json').then(paths => {
    for (const region of paths) {
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', region.d); path.setAttribute('class', 'land'); path.dataset.region = region.name;
      document.querySelector('#map-land').append(path);
    }
    paintRegions();
  }).catch(() => { document.querySelector('.map-bottom > span').textContent = 'Cartina non disponibile. Esplora le tappe nell’elenco.'; });
  readJSON('assets/data/travels.json').then(data => {
    if (!Array.isArray(data.destinations)) throw new Error('Invalid destinations');
    const ids = new Set();
    const places = data.destinations.filter(p => {
      const valid = p && typeof p.id === 'string' && p.id && !ids.has(p.id) && typeof p.name === 'string' && p.name && typeof p.country === 'string' && Number.isFinite(p.latitude) && Math.abs(p.latitude) <= 85 && Number.isFinite(p.longitude) && Math.abs(p.longitude) <= 180;
      if (valid) ids.add(p.id);
      return valid;
    });
    document.querySelector('#place-count').textContent = `${places.length} ${places.length === 1 ? 'destinazione' : 'destinazioni'}`;
    visitedRegions = new Set(places.flatMap(p => Array.isArray(p.mapRegions) ? p.mapRegions.filter(r => typeof r === 'string') : []));
    paintRegions();
    const controls = [];
    const select = (place, focusMap = false) => {
      detail.replaceChildren(element('h3', place.name), element('p', place.country));
      if (typeof place.note === 'string' && place.note) detail.append(element('p', place.note));
      if (typeof place.year === 'number' || typeof place.year === 'string') detail.append(element('p', String(place.year)));
      for (const c of controls) c.node.setAttribute('aria-pressed', String(c.id === place.id));
      center = project(place);
      if (focusMap) zoom = 3;
      updateZoom();
    };
    for (const place of places) {
      const button = element('button', place.name); button.type = 'button';
      button.append(element('span', '↗')); button.setAttribute('aria-label', `${place.name}, ${place.country}`); button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => select(place, true)); list.append(button);
      controls.push({ id: place.id, node: button });
      const pin = document.createElementNS(ns, 'g');
      const [x, y] = project(place);
      pin.setAttribute('transform', `translate(${x},${y})`); pin.setAttribute('class', 'pin');
      pin.setAttribute('role', 'button'); pin.setAttribute('tabindex', '0'); pin.setAttribute('aria-label', `${place.name}, ${place.country}`); pin.setAttribute('aria-pressed', 'false');
      const title = document.createElementNS(ns, 'title'); title.textContent = place.name; pin.append(title);
      for (const [r, cls] of [[13, 'halo'], [5, 'core']]) {
        const circle = document.createElementNS(ns, 'circle'); circle.setAttribute('r', r); circle.setAttribute('class', cls); pin.append(circle);
      }
      pin.addEventListener('click', () => select(place));
      pin.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(place); } });
      document.querySelector('#map-pins').append(pin); controls.push({ id: place.id, node: pin });
    }
    if (places.length) select(places[0]);
    else detail.replaceChildren(element('h3', 'Il viaggio continua'), element('p', 'Le prossime coordinate arriveranno qui.'));
    status.textContent = places.length !== data.destinations.length ? 'Alcune destinazioni non sono disponibili.' : '';
  }).catch(() => { status.textContent = 'Le destinazioni non sono disponibili al momento. Riprova tra poco.'; });
})();
