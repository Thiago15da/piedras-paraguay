'use strict';

const materials = [
  { name: 'Mármol', image: 'marmol.webp', tone: 'Claro · veta suave', description: 'Una referencia de fondo claro con vetas suaves. Contanos qué ambiente tenés en mente para consultar por tonos y acabados.' },
  { name: 'Granito', image: 'granito.webp', tone: 'Oscuro · grano visible', description: 'Una referencia oscura con grano visible. Indicá las medidas y el uso para consultar por opciones para tu proyecto.' },
  { name: 'Cuarzo', image: 'cuarzo.webp', tone: 'Cálido · veta sutil', description: 'Una referencia de tono cálido y veta discreta. Podés consultar por alternativas que acompañen los colores de tu ambiente.' },
  { name: 'Cuarcita', image: 'cuarcita-demo.webp', tone: 'Crema · vetas marcadas', description: 'Una referencia con fondo crema y vetas marcadas. Elegí esta familia para consultar por placas y variaciones de tono.' },
  { name: 'Piedras exóticas', image: 'exoticos.webp', tone: 'Rojizo · alto contraste', description: 'Una referencia rojiza de vetas contrastantes para explorar ideas en las que la piedra es protagonista.' },
  { name: 'Láminas ultracompactas', image: 'ultracompactos.webp', tone: 'Gris · acabado visual uniforme', description: 'Una referencia gris de apariencia uniforme. Indicá qué superficie querés revestir o equipar para consultar por opciones.' }
];

const gallery = {
  placas: { name: 'Placa clara con vetas', image: 'placas.webp', description: 'Vista de una placa clara en depósito.' },
  cocina: { name: 'Cocina de tonos oscuros', image: 'cocina.webp', description: 'Una mesada oscura en un ambiente con luminarias colgantes.' },
  negra: { name: 'Placa oscura con vetas', image: 'negra.webp', description: 'Detalle del contraste entre la placa oscura y sus vetas claras.' }
};

const filters = document.querySelector('#filters');
const grid = document.querySelector('#material-grid');
const detail = document.querySelector('#detail');
const detailImage = document.querySelector('#detail-image');
const materialQuote = document.querySelector('#material-quote');
const form = document.querySelector('#quote-form');
const fields = form.elements;
const materialSelect = document.querySelector('#material-select');
const surface = document.querySelector('#surface');
const preview = document.querySelector('#message-preview');
const whatsappLink = document.querySelector('#whatsapp-link');
const areaFormat = new Intl.NumberFormat('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
const dimensionFormat = new Intl.NumberFormat('es-PY', { maximumFractionDigits: 8 });
let selectedMaterial = '';

function showDetail(item, isMaterial) {
  selectedMaterial = isMaterial ? item.name : '';
  detail.classList.toggle('gallery-detail', !isMaterial);
  detailImage.src = item.image;
  detailImage.alt = isMaterial ? `Textura ilustrativa de ${item.name.toLowerCase()}` : item.name;
  document.querySelector('#detail-label').textContent = isMaterial ? 'Textura ilustrativa' : 'De las publicaciones de Paraguay Piedras';
  document.querySelector('#detail-title').textContent = item.name;
  document.querySelector('#detail-description').textContent = item.description;
  materialQuote.hidden = !isMaterial;
  detail.showModal();
}

function renderCards(selected) {
  for (const button of filters.children) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === selected));
  }
  for (const card of grid.children) {
    card.hidden = Boolean(selected && selected !== card.dataset.material);
  }
}

for (const option of [{ name: '' }, ...materials]) {
  const filter = document.createElement('button');
  filter.className = 'filter';
  filter.type = 'button';
  filter.dataset.filter = option.name;
  filter.textContent = option.name || 'Todos';
  filter.addEventListener('click', () => renderCards(option.name));
  filters.append(filter);
}

for (const item of materials) {
  const card = document.createElement('button');
  card.className = 'card';
  card.type = 'button';
  card.dataset.material = item.name;
  card.innerHTML = `<img src="${item.image}" alt="" width="540" height="350" loading="lazy"><span class="card-copy"><span class="card-title">${item.name}</span><span class="card-tone">${item.tone}</span><span class="arrow" aria-hidden="true">↗</span></span>`;
  card.addEventListener('click', () => showDetail(item, true));
  grid.append(card);
  materialSelect.add(new Option(item.name, item.name));
}
renderCards('');

document.querySelectorAll('[data-gallery]').forEach((button) => {
  button.addEventListener('click', () => showDetail(gallery[button.dataset.gallery], false));
});

document.querySelector('#close-detail').addEventListener('click', () => detail.close());
detail.addEventListener('click', (event) => {
  if (event.target !== detail) return;
  const rect = detail.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom) detail.close();
});

materialQuote.addEventListener('click', (event) => {
  event.preventDefault();
  materialSelect.value = selectedMaterial;
  preview.hidden = true;
  detail.close();
  document.querySelector('#cotizar').scrollIntoView();
  materialSelect.focus({ preventScroll: true });
});

function readDimension(input) {
  const value = input.value.trim();
  if (!value) return null;
  if (!/^\d+(?:[.,]\d+)?$/.test(value)) return NaN;
  const number = Number(value.replace(',', '.'));
  return number > 0 ? number : NaN;
}

function checkMeasurements() {
  const length = readDimension(fields.length);
  const width = readDimension(fields.width);
  fields.length.setCustomValidity('');
  fields.width.setCustomValidity('');
  const invalid = 'Ingresá una medida mayor que cero en centímetros.';
  if (Number.isNaN(length)) fields.length.setCustomValidity(invalid);
  if (Number.isNaN(width)) fields.width.setCustomValidity(invalid);
  if (length !== null && width === null) fields.width.setCustomValidity('Ingresá el ancho o borrá el largo.');
  if (width !== null && length === null) fields.length.setCustomValidity('Ingresá el largo o borrá el ancho.');
  const area = length && width ? length * width / 10000 : null;
  return { length, width, area };
}

function formatArea(area) {
  return area < 0.0001 ? 'menos de 0,0001 m²' : `${areaFormat.format(area)} m²`;
}

function refreshMeasurements() {
  const { area } = checkMeasurements();
  surface.textContent = area ? `Área aproximada · ${formatArea(area)}` : 'Si ya tenés medidas, completá el largo y el ancho.';
}

form.addEventListener('input', () => {
  refreshMeasurements();
  preview.hidden = true;
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const { length, width, area } = checkMeasurements();
  if (!form.reportValidity()) return;
  const lines = [
    'Hola, Paraguay Piedras. Me gustaría consultar por un proyecto.',
    `Proyecto: ${fields.use.value}`,
    `Material: ${materialSelect.value || 'Necesito orientación'}`
  ];
  if (area) lines.push(`Medidas aproximadas: ${dimensionFormat.format(length)} × ${dimensionFormat.format(width)} cm (${formatArea(area)})`);
  if (fields.city.value.trim()) lines.push(`Ciudad: ${fields.city.value.trim()}`);
  lines.push('¿Me podrían orientar sobre opciones y cotización? Gracias.');
  const message = lines.join('\n');
  document.querySelector('#message-text').textContent = message;
  whatsappLink.href = `https://wa.me/595982125979?text=${encodeURIComponent(message)}`;
  preview.hidden = false;
  preview.scrollIntoView({ block: 'nearest' });
  whatsappLink.focus({ preventScroll: true });
});

refreshMeasurements();
