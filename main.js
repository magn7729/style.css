// Alle audiologer med bil, navn, postnummer, by og ca. koordinater
const audiologists = [
    { car: "Bil 1",  name: "Regitze",   postcode: 2300, city: "København S",    lat: 55.65, lng: 12.61 },
    { car: "Bil 2",  name: "Holger",    postcode: 4250, city: "Fuglebjerg",     lat: 55.32, lng: 11.57 },
    { car: "Bil 3",  name: "Sarah",     postcode: 6000, city: "Kolding",        lat: 55.49, lng: 9.47 },
    { car: "Bil 4",  name: "Janne",     postcode: 6705, city: "Esbjerg Ø",      lat: 55.48, lng: 8.49 },
    { car: "Bil 5",  name: "Ditte",     postcode: 4220, city: "Korsør",         lat: 55.33, lng: 11.14 },
    { car: "Bil 6",  name: "Jannie",    postcode: 4872, city: "Idestrup",       lat: 54.73, lng: 11.97 },
    { car: "Bil 7",  name: "Philip",    postcode: 9700, city: "Brønderslev",    lat: 57.27, lng: 9.94 },
    { car: "Bil 8",  name: "Jonas",     postcode: 6500, city: "Vojens",         lat: 55.25, lng: 9.31 },
    { car: "Bil 9",  name: "Louise",    postcode: 5500, city: "Middelfart",     lat: 55.51, lng: 9.75 },
    { car: "Bil 10", name: "Christian", postcode: 5700, city: "Svendborg",      lat: 55.06, lng: 10.61 },
    { car: "Bil 11", name: "Mette",     postcode: 8600, city: "Silkeborg",      lat: 56.17, lng: 9.55 },
    { car: "Bil 12", name: "Tina",      postcode: 9690, city: "Fjerritslev",    lat: 57.08, lng: 9.27 },
    { car: "Bil 13", name: "Thomas",    postcode: 3400, city: "Hillerød",       lat: 55.93, lng: 12.30 },
    { car: "Bil 14", name: "Rashel",    postcode: 8270, city: "Højbjerg",       lat: 56.12, lng: 10.21 },
    { car: "Bil 15", name: "Anne",      postcode: 8000, city: "Aarhus C",       lat: 56.16, lng: 10.20 },
    { car: "Bil 16", name: "Leif",      postcode: 7900, city: "Nykøbing Mors",  lat: 56.79, lng: 8.86 },
    { car: "Bil 17", name: "Bettina",   postcode: 4340, city: "Tølløse",        lat: 55.60, lng: 11.75 },
    { car: "Bil 18", name: "Bil 18",    postcode: 2300, city: "København S",    lat: 55.65, lng: 12.61 },
    { car: "Bil 19", name: "Celina",    postcode: 8940, city: "Randers SV",     lat: 56.43, lng: 10.01 },
    { car: "Bil 20", name: "Clara",     postcode: 8000, city: "Aarhus C",       lat: 56.16, lng: 10.20 },
    { car: "Bil 21", name: "Alexander", postcode: 2840, city: "Holte",          lat: 55.82, lng: 12.47 },
    { car: "Bil 22", name: "Arzu",      postcode: 9000, city: "Aalborg",        lat: 57.05, lng: 9.92 },
    { car: "Bil 23", name: "Maria",     postcode: 2760, city: "Måløv",          lat: 55.75, lng: 12.29 },
    { car: "Bil 24", name: "Leone",     postcode: 4622, city: "Havdrup",        lat: 55.54, lng: 12.07 }
];

// Initialiser Leaflet-kortet
const map = L.map('map', {
    zoomControl: true
}).setView([56.1, 10.5], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap-bidragsydere'
}).addTo(map);

// Tilføj markører til kortet
audiologists.forEach(a => {
    const marker = L.circleMarker([a.lat, a.lng], {
        radius: 7,
        weight: 2,
        color: '#1d4ed8',
        fillColor: '#60a5fa',
        fillOpacity: 0.9
    }).addTo(map);

    const popupHtml = `
    <strong>${a.name}</strong> – ${a.car}<br>
    Postnr: ${a.postcode}<br>
    By: ${a.city}
  `;
    marker.bindPopup(popupHtml);

    // Gem marker-reference på objektet til senere highlight
    a.marker = marker;
});

const searchInput   = document.getElementById('searchInput');
const searchBtn     = document.getElementById('searchBtn');
const resultBox     = document.getElementById('resultBox');
const errorMsg      = document.getElementById('errorMsg');
const listContainer = document.getElementById('audiologistList');

// Byg liste til venstre
function renderList(selected) {
    listContainer.innerHTML = "";
    audiologists.forEach(a => {
        const div = document.createElement('div');
        div.className = 'audiologist-item' +
            (selected && selected === a ? ' highlight' : '');
        div.innerHTML = `
      <span>
        <span class="label">${a.name}</span>
        <span class="car">(${a.car})</span>
      </span>
      <span>
        <span class="postcode">${a.postcode}</span>
        <span class="city">${a.city}</span>
      </span>
    `;
        listContainer.appendChild(div);
    });
}

renderList(null);

function findNearestAudiologist(postcode) {
    let nearest = null;
    let smallestDiff = Infinity;

    audiologists.forEach(a => {
        const diff = Math.abs(a.postcode - postcode);
        if (diff < smallestDiff) {
            smallestDiff = diff;
            nearest = a;
        }
    });

    return nearest;
}

function handleSearch() {
    const text = searchInput.value.trim();
    errorMsg.style.display = 'none';
    errorMsg.textContent = '';

    if (!text) {
        errorMsg.textContent = 'Skriv venligst et postnummer eller en adresse.';
        errorMsg.style.display = 'block';
        return;
    }

    // Find første 4 cifre i teksten (postnummer)
    const match = text.match(/\b(\d{4})\b/);
    if (!match) {
        errorMsg.textContent = 'Kunne ikke finde et 4-cifret postnummer i det du skrev.';
        errorMsg.style.display = 'block';
        return;
    }

    const postcode = parseInt(match[1], 10);
    const nearest = findNearestAudiologist(postcode);

    if (!nearest) {
        errorMsg.textContent = 'Der opstod en fejl ved beregning af nærmeste audiolog.';
        errorMsg.style.display = 'block';
        return;
    }

    // Opdater tekst-boksen med resultat
    resultBox.innerHTML = `
    <div class="result-main">
      ${postcode} – <strong>${nearest.name}</strong> (${nearest.car}) er bedst at få til denne adresse.
    </div>
    <div class="result-sub">
      Nærmeste ud fra postnummer-afstand: deres postnummer er ${nearest.postcode} (${nearest.city}).
    </div>
  ;

  `;

    // Zoom kortet ind på audiologen
    if (nearest.marker) {
        nearest.marker.openPopup();
        map.setView([nearest.lat, nearest.lng], 9, { animate: true });
    }

    // Highlight i listen
    renderList(nearest);
}

// Event listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

function estimateDriveMinutes(originPostcode, audiologistPostcode) {
    const diff = Math.abs(originPostcode - audiologistPostcode);

    // Simpelt estimat: ca. 1 minut pr. 5 postnumre forskel
    let minutes = Math.round(diff / 5);

    // Sæt nogle fornuftige grænser
    if (minutes < 5) minutes = 5;      // minimum 5 minutter
    if (minutes > 180) minutes = 180;  // maksimum 3 timer

    return minutes;
}