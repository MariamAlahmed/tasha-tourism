// provider-dashboard.js — يعرض توقع طلب أسبوعي حقيقي لتصنيف يختاره مقدم الخدمة
// البيانات كلها محسوبة عبر forecastWeek() الموجودة في predict.js

function crowdLevelToClass(level) {
    switch (level) {
        case "مرتفع": return "high";
        case "متوسط": return "medium";
        case "منخفض": return "low";
        default: return "medium";
    }
}

function renderForecast(category) {
    const forecast = forecastWeek(category);

    const table = document.getElementById("forecast-table");
    table.innerHTML = forecast.map(day => `
        <div class="forecast-row">
            <span class="forecast-day">${day.dayName}</span>
            <div class="forecast-bar-wrap">
                <div class="forecast-bar ${crowdLevelToClass(day.level)}" style="width:${day.score}%"></div>
            </div>
            <span class="forecast-value">${day.score}٪</span>
        </div>
    `).join("");

    // نحدد أفضل يوم لعرض خاص (الأقل طلبًا) وأعلى يوم ذروة
    const sorted = [...forecast].sort((a, b) => a.score - b.score);
    const lowestDay = sorted[0];
    const highestDay = sorted[sorted.length - 1];

    document.getElementById("dash-note").innerHTML = `
        اقتراح ذكي: الطلب على تصنيف "${category}" هذا الأسبوع أعلى ما يكون يوم
        <strong>${highestDay.dayName}</strong> (${highestDay.score}٪)، وأقله يوم
        <strong>${lowestDay.dayName}</strong> (${lowestDay.score}٪) —
        فكّر تطلق عرضًا خاصًا يوم ${lowestDay.dayName} لتحفيز الحجوزات.
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("category-select");

    // تعبئة القائمة بكل التصنيفات الموجودة فعليًا بالبيانات
    const categories = [...new Set(events.map(e => e.category))];
    select.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join("");

    renderForecast(select.value);

    select.addEventListener("change", () => renderForecast(select.value));
});
