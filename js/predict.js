// predict.js — محرك تنبؤ مبسّط (Rule-based) بمستوى الإقبال المتوقع
//
// هذا الملف يحاكي عمل نموذج ذكاء اصطناعي حقيقي عن طريق حساب نسبة
// الإقبال المتوقعة بناءً على عوامل واقعية بدل ما تكون رقم ثابت.
// لاحقًا، عند توفر بيانات حقيقية، يُستبدل هذا الملف بالكامل بطلب
// إلى API لنموذج تعلم آلة فعلي — دون تغيير أي شيء في data.js أو script.js،
// المطلوب فقط أن ترجع دالة predictDemand نفس الشكل: { score, level }.

// وزن نسبي لشعبية كل تصنيف (كلما زاد الرقم زاد احتمال الازدحام)
const CATEGORY_WEIGHT = {
    "تسوق": 25,
    "ترفيهي": 22,
    "موسيقى": 24,
    "سياحة": 18,
    "ثقافي": 12,
    "تراثي": 10,
    "فنون": 8,
    "تقني": 8,
    "رياضي": 14
};

// التاريخ المرجعي = تاريخ اليوم الفعلي عند فتح الصفحة (وليس تاريخ ثابت بالكود)
// هذا يخلي التنبؤ يتحدث تلقائيًا يوم بعد يوم بدون أي تدخل يدوي
const TODAY = new Date();

// هل يقع تاريخ معيّن في عطلة نهاية الأسبوع بالسعودية (خميس/جمعة)؟
function isWeekend(date) {
    const day = date.getDay(); // 4 = الخميس، 5 = الجمعة
    return day === 4 || day === 5;
}

// عدد الأيام المتبقية على الفعالية من اليوم المرجعي
function daysUntil(dateStr) {
    const eventDate = new Date(dateStr);
    const diffMs = eventDate - TODAY;
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// الدالة الأساسية: تحسب نسبة ومستوى الإقبال المتوقع لفعالية واحدة
function predictDemand(event) {
    const eventDate = new Date(event.date);

    let score = 30; // نقطة بداية أساسية لكل فعالية

    // 1) وزن التصنيف
    score += CATEGORY_WEIGHT[event.category] || 10;

    // 2) هل نهاية الأسبوع؟
    if (isWeekend(eventDate)) score += 15;

    // 3) قرب الموعد — كلما قرب الموعد زاد التنبيه والاهتمام
    const remaining = daysUntil(event.date);
    if (remaining >= 0 && remaining <= 10) score += 25;
    else if (remaining > 10 && remaining <= 25) score += 12;
    else if (remaining > 25 && remaining <= 45) score += 4;

    // 4) تذبذب بسيط يحاكي تحديث الطلب اللحظي (Live Demand)
    score += Math.floor(Math.random() * 7) - 3;

    // حصر النتيجة بين 5 و97 عشان تبقى نسبة منطقية
    score = Math.max(5, Math.min(97, Math.round(score)));

    let level;
    if (score >= 65) level = "مرتفع";
    else if (score >= 38) level = "متوسط";
    else level = "منخفض";

    return { score, level };
}

// يرشّح بديلاً مناسبًا لفعالية معينة — يُستخدم في التنبيه الاستباقي (Smart Alert)
// المعيار: نفس التصنيف + تقاطع بالـ vibe + أقل ازدحامًا يُفضَّل أكثر
function findAlternative(currentEvent, allEvents) {
    const candidates = allEvents
        .filter(e => e.id !== currentEvent.id)
        .map(e => {
            const { score, level } = predictDemand(e);
            let matchScore = 0;
            if (e.category === currentEvent.category) matchScore += 10;
            const sharedVibe = e.vibe.filter(v => currentEvent.vibe.includes(v)).length;
            matchScore += sharedVibe * 4;
            matchScore -= score * 0.1; // كل ما زاد الازدحام قل الترشيح
            return { event: e, score, level, matchScore };
        })
        .sort((a, b) => b.matchScore - a.matchScore);

    return candidates[0] || null;
}

// يحسب توقع الطلب لتصنيف معين على مدار الأيام السبعة القادمة
// يُستخدم بلوحة مقدم الخدمة بدل أرقام ثابتة مكتوبة يدويًا
function forecastWeek(category) {
    const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const forecast = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(TODAY);
        date.setDate(date.getDate() + i);

        let score = 30 + (CATEGORY_WEIGHT[category] || 10);
        if (isWeekend(date)) score += 15;
        score += Math.floor(Math.random() * 9) - 4; // تذبذب يومي
        score = Math.max(5, Math.min(97, Math.round(score)));

        let level;
        if (score >= 65) level = "مرتفع";
        else if (score >= 38) level = "متوسط";
        else level = "منخفض";

        forecast.push({ dayName: dayNames[date.getDay()], score, level });
    }

    return forecast;
}

// يطبّق التنبؤ على قائمة فعاليات كاملة ويرجعها مع بيانات الإقبال مضافة
function predictEvents(eventList) {
    return eventList.map(event => {
        const { score, level } = predictDemand(event);
        return { ...event, predictedScore: score, crowdLevel: level };
    });
}
