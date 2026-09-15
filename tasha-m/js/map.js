// map.js — الخريطة الذكية: تعرض كل فعالية كنقطة على خريطة OpenStreetMap
// ملوّنة حسب مستوى الإقبال المتوقع (يُحسب فعليًا عبر predict.js)

function crowdColor(level) {
    switch (level) {
        case "مرتفع": return "#b8503f";
        case "متوسط": return "#b5772a";
        case "منخفض": return "#4f7d63";
        default: return "#b5772a";
    }
}

function initSmartMap() {
    const mapContainer = document.getElementById("smart-map");
    if (!mapContainer) return;

    // مركز الخريطة تقريبًا في منتصف المنطقة الشرقية
    const map = L.map("smart-map").setView([26.45, 49.95], 9);

    // طبقة الخرائط من OpenStreetMap — مجانية ولا تحتاج مفتاح API
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);

    const predicted = predictEvents(events);

    predicted.forEach(event => {
        const color = crowdColor(event.crowdLevel);

        const marker = L.circleMarker([event.lat, event.lng], {
            radius: 9,
            fillColor: color,
            color: "#fff",
            weight: 2,
            fillOpacity: 0.9
        }).addTo(map);

        marker.bindPopup(`
            <div style="font-family:'Cairo',sans-serif; text-align:right; direction:rtl; min-width:160px;">
                <strong>${event.name}</strong><br>
                <span style="color:#6b5c4d; font-size:12px;">${event.city} · ${event.category}</span><br>
                <span style="color:${color}; font-weight:700; font-size:13px;">${event.crowdLevel} الإقبال — ${event.predictedScore}٪</span><br>
                <a href="details.html?id=${event.id}" style="color:#b5772a; font-size:12px;">عرض التفاصيل</a>
            </div>
        `);
    });
}

document.addEventListener("DOMContentLoaded", initSmartMap);
