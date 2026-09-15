// bookings.js — يقرأ بيانات حجز جديد قادم من details.html عبر رابط الصفحة
// ويعرضه فوق قائمة الحجوزات، مع بانر تأكيد نجاح.
//
// ملاحظة: هذا تخزين لجلسة التنقل الحالية فقط عبر رابط الصفحة (query params)،
// وليس تخزينًا دائمًا. عند الحاجة لحفظ الحجوزات فعليًا عبر الزيارات، يُستبدل
// هذا الملف بطلب حقيقي لقاعدة بيانات (بعد إضافة Backend).

function formatDate(dateStr) {
    const months = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    const d = new Date(dateStr);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const bookedId = parseInt(params.get("booked"), 10);
    const seats = params.get("seats");
    const name = params.get("name");

    if (!bookedId) return; // ما فيه حجز جديد جاي من صفحة التفاصيل

    const event = events.find(e => e.id === bookedId);
    if (!event) return;

    const slot = document.getElementById("new-booking-slot");

    slot.innerHTML = `
        <div class="booking-success-banner">
            تم تأكيد حجزك بنجاح${name ? "، " + name : ""} — ${seats} مقعد.
        </div>
        <div class="booking-item">
            <div class="booking-info">
                <div class="booking-name">${event.name}</div>
                <div class="booking-meta">${formatDate(event.date)} · ${event.venue} · ${seats} مقعد</div>
            </div>
            <span class="booking-status">مؤكد</span>
        </div>
    `;
});
