// detail.js — يعرض تفاصيل فعالية واحدة ويدير فورم الحجز الفعلي

// يقرأ رقم الفعالية (id) من رابط الصفحة، مثل: details.html?id=3
function getEventIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("id"), 10);
}

function crowdLevelToClass(level) {
    switch (level) {
        case "مرتفع": return "high";
        case "متوسط": return "medium";
        case "منخفض": return "low";
        default: return "medium";
    }
}

function formatDate(dateStr) {
    const months = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    const d = new Date(dateStr);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// يبني صندوق التنبيه الاستباقي (Smart Alert) عند ارتفاع الإقبال المتوقع
function renderSmartAlert(event, alt) {
    const [startTime] = event.time.split(" - ");

    const altBlock = alt
        ? `
            <div class="alt-suggestion">
                <div>
                    <div class="alt-name">${alt.event.name}</div>
                    <div class="alt-meta">${alt.event.city} · ${alt.level} الإقبال — ${alt.score}٪</div>
                </div>
                <a href="details.html?id=${alt.event.id}" class="alt-link">التفاصيل</a>
            </div>
        `
        : `<span class="alert-option-text">لا توجد بدائل مناسبة حاليًا ضمن البيانات المتاحة</span>`;

    return `
        <div class="smart-alert">
            <div class="alert-tag">تنبيه استباقي</div>
            <p class="alert-msg">
                نتوقع ارتفاع الإقبال على هذه الفعالية حول موعد بدايتها (${startTime}).
                أمامك ثلاثة خيارات:
            </p>
            <div class="alert-options">
                <div class="alert-option">
                    <strong>1. اذهب مبكرًا</strong>
                    <span class="alert-option-text">احرص على الوصول قبل ${startTime} بنصف ساعة على الأقل</span>
                </div>
                <div class="alert-option">
                    <strong>2. جرّب بديل أقل ازدحامًا</strong>
                    ${altBlock}
                </div>
                <div class="alert-option">
                    <strong>3. استمر بالحجز</strong>
                    <span class="alert-option-text">إذا كانت هذه الفعالية أولوية لك، أكمل الحجز أدناه كما هو</span>
                </div>
            </div>
        </div>
    `;
}

// يبني كامل محتوى صفحة التفاصيل لفعالية واحدة
function renderEventDetail(event) {
    const { score, level } = predictDemand(event);
    const levelClass = crowdLevelToClass(level);
    const priceLabel = event.price === 0 ? "مجاني" : `${event.price} ريال`;

    // لو الإقبال المتوقع مرتفع، نجهّز بديل مقترح وننشئ صندوق التنبيه الاستباقي
    const smartAlertHtml = level === "مرتفع"
        ? renderSmartAlert(event, findAlternative(event, events))
        : "";

    const container = document.getElementById("detail-container");
    container.innerHTML = `
        <div class="detail-hero">
            <span class="event-tag ${levelClass}">${level} الإقبال — ${score}٪</span>
            <h1>${event.name}</h1>
            <p class="detail-city">${event.city} · ${event.venue}</p>
        </div>

        <div class="detail-body">
            <div class="detail-main">
                ${smartAlertHtml}

                <h2>عن الفعالية</h2>
                <p>${event.description}</p>

                <div class="detail-meta-grid">
                    <div class="meta-box">
                        <span class="meta-label">التاريخ</span>
                        <span class="meta-value">${formatDate(event.date)}</span>
                    </div>
                    <div class="meta-box">
                        <span class="meta-label">الوقت</span>
                        <span class="meta-value">${event.time}</span>
                    </div>
                    <div class="meta-box">
                        <span class="meta-label">السعر</span>
                        <span class="meta-value">${priceLabel}</span>
                    </div>
                    <div class="meta-box">
                        <span class="meta-label">المقاعد المتاحة</span>
                        <span class="meta-value" id="seats-remaining">${event.seatsAvailable}</span>
                    </div>
                </div>

                <div class="ai-reason">
                    <h3>لماذا نعرض لك هذه الفعالية؟</h3>
                    <ul>
                        <li>تقع في ${event.city} — ضمن نطاق المنطقة الشرقية</li>
                        <li>تصنيف "${event.category}" — من أنواع التجارب الشائعة بهذا الموسم</li>
                        <li>مستوى الإقبال المتوقع حاليًا: ${level} (${score}٪)</li>
                    </ul>
                </div>
            </div>

            <div class="detail-sidebar">
                <form id="booking-form" class="booking-form">
                    <h3>احجز مكانك</h3>

                    <label>
                        الاسم الكامل
                        <input type="text" id="full-name" required placeholder="اكتب اسمك">
                    </label>

                    <label>
                        رقم الجوال
                        <input type="tel" id="phone" required placeholder="05xxxxxxxx" pattern="05[0-9]{8}">
                    </label>

                    <label>
                        عدد المقاعد
                        <input type="number" id="seat-count" required min="1" max="${event.seatsAvailable}" value="1">
                    </label>

                    <div class="booking-total">
                        الإجمالي: <span id="total-price">${priceLabel}</span>
                    </div>

                    <button type="submit" class="cta-btn">تأكيد الحجز</button>
                    <p class="form-note">هذا حجز تجريبي ضمن نموذج طشّة الأولي، لا يتم خصم أي مبلغ فعلي.</p>
                </form>
            </div>
        </div>
    `;

    // تحديث الإجمالي تلقائيًا عند تغيير عدد المقاعد
    const seatInput = document.getElementById("seat-count");
    const totalLabel = document.getElementById("total-price");
    seatInput.addEventListener("input", () => {
        const count = parseInt(seatInput.value, 10) || 1;
        if (event.price === 0) {
            totalLabel.textContent = "مجاني";
        } else {
            totalLabel.textContent = `${event.price * count} ريال`;
        }
    });

    // عند إرسال الفورم: تحقق بسيط ثم توجيه لصفحة حجوزاتي مع بيانات الحجز بالرابط
    document.getElementById("booking-form").addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("full-name").value.trim();
        const seatCount = parseInt(seatInput.value, 10);

        if (seatCount > event.seatsAvailable) {
            alert("عدد المقاعد المطلوب أكبر من المتاح.");
            return;
        }

        const query = new URLSearchParams({
            booked: event.id,
            seats: seatCount,
            name: name
        });

        window.location.href = `bookings.html?${query.toString()}`;
    });
}

// نقطة الانطلاق
document.addEventListener("DOMContentLoaded", () => {
    const id = getEventIdFromUrl();
    const event = events.find(e => e.id === id);
    const container = document.getElementById("detail-container");

    if (!event) {
        container.innerHTML = `<div class="empty-state">لم يتم العثور على هذه الفعالية.</div>`;
        return;
    }

    renderEventDetail(event);
});
