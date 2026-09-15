// script-en.js — نسخة إنجليزية من منطق عرض الفعاليات بالرئيسية
//
// ملاحظة نطاق: تمت ترجمة نصوص الواجهة الثابتة فقط (تسميات المدن، التصنيفات،
// مستوى الإقبال، التاريخ). أسماء ووصف كل فعالية تُعرض كما هي بالعربي لأن
// ترجمة تفاصيل الـ22 فعالية بالكامل خارج نطاق هذا الديمو حاليًا.

const cityNamesEn = {
    "الظهران": "Dhahran",
    "الدمام": "Dammam",
    "الجبيل": "Jubail",
    "الخبر": "Khobar",
    "القطيف": "Qatif",
    "الأحساء": "Al-Ahsa",
    "رأس تنورة": "Ras Tanura",
};

const categoryNamesEn = {
    "ثقافي": "Cultural",
    "تسوق": "Shopping",
    "فنون": "Arts",
    "سياحة": "Tourism",
    "تراثي": "Heritage",
    "تقني": "Tech",
    "موسيقى": "Music",
    "رياضي": "Sports",
    "ترفيهي": "Entertainment",
};

const crowdLevelEn = {
    "مرتفع": "High",
    "متوسط": "Medium",
    "منخفض": "Low",
};

function cityEn(city) { return cityNamesEn[city] || city; }
function categoryEn(cat) { return categoryNamesEn[cat] || cat; }

function crowdLevelToClassEn(level) {
    switch (level) {
        case "مرتفع": return "high";
        case "متوسط": return "medium";
        case "منخفض": return "low";
        default: return "medium";
    }
}

function formatDateEn(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

function createEventCardEn(event) {
    const card = document.createElement("div");
    card.className = "event-card";

    const levelClass = crowdLevelToClassEn(event.crowdLevel);
    const levelLabel = crowdLevelEn[event.crowdLevel] || event.crowdLevel;

    card.innerHTML = `
        <div class="event-card-header">
            <span class="event-city">${cityEn(event.city)}</span>
            <span class="event-tag ${levelClass}">${levelLabel} demand — ${event.predictedScore}%</span>
        </div>
        <div class="event-body">
            <div class="event-name">${event.name}</div>
            <div class="event-desc">${event.description}</div>
            <div class="event-meta">
                <span>${event.venue}</span>
                <span>${formatDateEn(event.date)} · ${event.time}</span>
            </div>
            <a href="details.html?id=${event.id}" class="event-cta">Details &amp; booking</a>
        </div>
    `;
    return card;
}

function renderEventsEn(eventList) {
    const grid = document.getElementById("experience-grid");
    if (!grid) return;

    grid.innerHTML = "";

    if (eventList.length === 0) {
        grid.innerHTML = `<div class="empty-state">No matching experiences for this filter right now.</div>`;
        return;
    }

    eventList.forEach(event => {
        grid.appendChild(createEventCardEn(event));
    });
}

function populateFiltersEn(eventList) {
    const citySelect = document.getElementById("filter-city");
    const categorySelect = document.getElementById("filter-category");
    if (!citySelect || !categorySelect) return;

    const cities = [...new Set(eventList.map(e => e.city))];
    const categories = [...new Set(eventList.map(e => e.category))];

    cities.forEach(city => {
        const opt = document.createElement("option");
        opt.value = city;
        opt.textContent = cityEn(city);
        citySelect.appendChild(opt);
    });

    categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = categoryEn(cat);
        categorySelect.appendChild(opt);
    });
}

function applyFiltersEn(allEvents) {
    const citySelect = document.getElementById("filter-city");
    const categorySelect = document.getElementById("filter-category");
    if (!citySelect || !categorySelect) return;

    const city = citySelect.value;
    const category = categorySelect.value;

    const filtered = allEvents.filter(e => {
        const cityMatch = city === "all" || e.city === city;
        const categoryMatch = category === "all" || e.category === category;
        return cityMatch && categoryMatch;
    });

    renderEventsEn(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
    const predictedEvents = predictEvents(events);

    populateFiltersEn(predictedEvents);
    renderEventsEn(predictedEvents);

    const citySelect = document.getElementById("filter-city");
    const categorySelect = document.getElementById("filter-category");
    if (citySelect && categorySelect) {
        citySelect.addEventListener("change", () => applyFiltersEn(predictedEvents));
        categorySelect.addEventListener("change", () => applyFiltersEn(predictedEvents));
    }
});
