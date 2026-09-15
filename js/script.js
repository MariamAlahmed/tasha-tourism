// script.js — يقرأ مصفوفة events من data.js ويولّد كروت الفعاليات تلقائيًا

// يتتبّع اللغة الحالية لزر التبديل الفوري (data-ar / data-en) — منقول من ملف فريق العمل
let currentLang = 'ar';

// يحوّل مستوى الازدحام العربي إلى اسم صنف CSS إنجليزي
function crowdLevelToClass(level) {
    switch (level) {
        case "مرتفع": return "high";
        case "متوسط": return "medium";
        case "منخفض": return "low";
        default: return "medium";
    }
}

// يترجم مستوى الازدحام لعرضه بالإنجليزي عند التبديل
function crowdLevelToEn(level) {
    switch (level) {
        case "مرتفع": return "High";
        case "متوسط": return "Medium";
        case "منخفض": return "Low";
        default: return level;
    }
}

// يهيّئ التاريخ لعرض أوضح (مثال: 15 سبتمبر 2026) — يتبدّل حسب اللغة الحالية
function formatDate(dateStr) {
    const monthsAr = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    const monthsEn = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const d = new Date(dateStr);
    const months = currentLang === "en" ? monthsEn : monthsAr;
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// يبني عنصر كرت واحد بناءً على بيانات فعالية
function createEventCard(event) {
    const card = document.createElement("div");
    card.className = "event-card";

    const levelClass = crowdLevelToClass(event.crowdLevel);

    // أيقونات تصنيفات الفعالية (ممكن تكون أكثر من وحدة إذا الفعالية تشمل أكثر من قسم)
    const groupKeys = (typeof getEventGroups === "function") ? getEventGroups(event) : [];
    const iconsHtml = groupKeys.map(key => {
        const group = eventCategoryGroups[key];
        const label = currentLang === "en" ? group.en : group.ar;
        return `<span class="event-icon" title="${label}"><i class="fa-solid ${group.icon}"></i></span>`;
    }).join("");

    const isEn = currentLang === "en";
    const cityText = isEn ? (event.city_en || event.city) : event.city;
    const nameText = isEn ? (event.name_en || event.name) : event.name;
    const descText = isEn ? (event.description_en || event.description) : event.description;
    const venueText = isEn ? (event.venue_en || event.venue) : event.venue;
    const tagText = isEn
        ? `${crowdLevelToEn(event.crowdLevel)} Turnout — ${event.predictedScore}%`
        : `${event.crowdLevel} الإقبال — ${event.predictedScore}٪`;
    const ctaText = isEn ? "Details & Booking" : "التفاصيل والحجز";

    card.innerHTML = `
        <div class="event-card-header">
            <span class="event-city">${cityText}</span>
            <span class="event-tag ${levelClass}">${tagText}</span>
        </div>
        ${iconsHtml ? `<div class="event-icons">${iconsHtml}</div>` : ""}
        <div class="event-body">
            <div class="event-name">${nameText}</div>
            <div class="event-desc">${descText}</div>
            <div class="event-meta">
                <span>${venueText}</span>
                <span>${formatDate(event.date)} · ${event.time}</span>
            </div>
            <a href="details.html?id=${event.id}" class="event-cta">${ctaText}</a>
        </div>
    `;
    return card;
}

// يعرض كل الفعاليات داخل #experience-grid
function renderEvents(eventList) {
    const grid = document.getElementById("experience-grid");
    if (!grid) return;

    grid.innerHTML = "";

    if (eventList.length === 0) {
        const emptyText = currentLang === "en"
            ? "No experiences currently match this filter."
            : "لا توجد فعاليات مطابقة لهذا الفلتر حاليًا.";
        grid.innerHTML = `<div class="empty-state">${emptyText}</div>`;
        return;
    }

    eventList.forEach(event => {
        grid.appendChild(createEventCard(event));
    });
}

// يبني قائمة فلتر المناطق تلقائيًا من البيانات الفعلية
function populateFilters(eventList) {
    const citySelect = document.getElementById("filter-city");
    if (!citySelect) return;

    // نبني خريطة "مدينة عربي -> مدينة إنجليزي" من نفس بيانات الفعاليات (city_en)
    const cityEnMap = new Map();
    eventList.forEach(e => {
        if (e.city && !cityEnMap.has(e.city)) cityEnMap.set(e.city, e.city_en || e.city);
    });

    const cities = [...new Set(eventList.map(e => e.city))];

    cities.forEach(city => {
        const opt = document.createElement("option");
        opt.value = city;
        opt.dataset.ar = city;
        opt.dataset.en = cityEnMap.get(city) || city;
        opt.textContent = currentLang === "en" ? opt.dataset.en : opt.dataset.ar;
        citySelect.appendChild(opt);
    });
}

// يحدّث نص خيارات فلتر المناطق (غير خيار "الكل" اللي ينضبط تلقائيًا عبر data-ar/data-en)
// حسب اللغة الحالية، بدون ما يغيّر القيمة المختارة فعليًا
function relabelFilterOptions() {
    const citySelect = document.getElementById("filter-city");
    if (!citySelect) return;

    Array.from(citySelect.options).forEach(opt => {
        if (opt.value === "all" || !opt.dataset.ar) return;
        opt.textContent = currentLang === "en" ? opt.dataset.en : opt.dataset.ar;
    });
}

// يطبّق فلتر المنطقة المختار على القائمة الكاملة ويعيد العرض
function applyFilters(allEvents) {
    const citySelect = document.getElementById("filter-city");
    if (!citySelect) return;

    const city = citySelect.value;

    const filtered = allEvents.filter(e => city === "all" || e.city === city);

    renderEvents(filtered);
}

// ============ دوائر أقسام الفعاليات (Event Categories) ============

// يربط كل تصنيف عريض (من الدوائر) بواحد أو أكثر من قيم category الموجودة
// بملف data.js، ولبعض التصنيفات اللي ما لها category مطابق (مثل طعام وتذوق)
// نبحث بكلمات مفتاحية داخل اسم ووصف الفعالية بدل الاعتماد على category فقط
// icon نفس الأيقونة المستخدمة بدائرة التصنيف بالضبط، عشان الكرت والدائرة يتطابقوا بصريًا
const eventCategoryGroups = {
    culture:        { categories: ["ثقافي", "تراثي"], ar: "ثقافة وتراث",     en: "Culture & Heritage",       icon: "fa-landmark" },
    arts:           { categories: ["فنون"],            ar: "فنون وإبداع",     en: "Arts & Creativity",        icon: "fa-palette" },
    education:      { categories: ["تقني"],            ar: "تعليم وتطوير",    en: "Education & Development",  icon: "fa-graduation-cap" },
    nature:         { categories: ["سياحة"],           ar: "طبيعة واستكشاف",  en: "Nature & Exploration",     icon: "fa-mountain-sun" },
    adventure:      { categories: ["رياضي"],           ar: "مغامرات ورياضة",  en: "Adventure & Sports",       icon: "fa-person-hiking" },
    entertainment:  { categories: ["ترفيهي", "موسيقى"], ar: "ترفيه وعروض",    en: "Entertainment & Shows",    icon: "fa-masks-theater" },
    food:           { keywords: ["طعام", "مأكولات", "تذوق", "قهوة", "مطاعم", "food", "taste", "cuisine"], ar: "طعام وتذوق", en: "Food & Tasting", icon: "fa-utensils" },
    markets:        { categories: ["تسوق"],            ar: "أسواق ومجتمعات", en: "Markets & Communities",    icon: "fa-store" }
};

// يرجّع كل التصنيفات العريضة اللي تنطبق على فعالية معيّنة (ممكن تكون أكثر من وحدة)
function getEventGroups(event) {
    return Object.keys(eventCategoryGroups).filter(key => eventMatchesGroup(event, key));
}

// يتحقق هل فعالية معيّنة تنتمي لتصنيف عريض معيّن (عبر category أو كلمات مفتاحية)
function eventMatchesGroup(event, groupKey) {
    const group = eventCategoryGroups[groupKey];
    if (!group) return false;

    if (group.categories && group.categories.includes(event.category)) return true;

    if (group.keywords) {
        const haystack = `${event.name || ""} ${event.description || ""}`.toLowerCase();
        return group.keywords.some(kw => haystack.includes(kw.toLowerCase()));
    }

    return false;
}

// يحدد التصنيف العريض (من دوائر أقسام الفعاليات) المطابق لقيمة تصنيف واحدة
// تُستخدم لربط إجابات استبيان "خلنا نتعرف" بنفس تصنيفات الدوائر بالصفحة الرئيسية
function findGroupByCategoryValue(catValue) {
    if (!catValue) return null;
    return Object.keys(eventCategoryGroups).find(key => {
        const group = eventCategoryGroups[key];
        return group.categories && group.categories.includes(catValue);
    }) || null;
}

// يعرض/يحدّث شارة "تعرض فعاليات: ..." فوق شبكة الفعاليات مع زر لمسح الفلتر
// fromQuiz: true لما الفلتر يجي من نتيجة استبيان "خلنا نتعرف" (نص شارة مختلف أكثر شخصنة)
function showActiveCategoryBadge(groupKey, { fromQuiz = false } = {}) {
    const badge = document.getElementById("active-category-badge");
    const group = eventCategoryGroups[groupKey];
    if (!badge || !group) return;

    const label = currentLang === "en" ? group.en : group.ar;
    const prefix = fromQuiz
        ? (currentLang === "en" ? "Based on your answers — showing: " : "بناءً على إجاباتك، نعرض: ")
        : (currentLang === "en" ? "Showing: " : "تعرض فعاليات: ");

    badge.innerHTML = `<span>${prefix}${label}</span>`;
    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.setAttribute("aria-label", currentLang === "en" ? "Clear filter" : "مسح الفلتر");
    clearBtn.textContent = "×";
    clearBtn.addEventListener("click", clearActiveCategory);
    badge.appendChild(clearBtn);
    badge.classList.add("show");
}

// يمسح فلتر التصنيف النشط ويرجّع كل الفعاليات
function clearActiveCategory() {
    const badge = document.getElementById("active-category-badge");
    if (badge) badge.classList.remove("show");

    document.querySelectorAll(".category-item").forEach(b => b.classList.remove("active"));
    activeQuizCity = null;

    if (typeof events !== "undefined" && typeof predictEvents === "function") {
        renderEvents(predictEvents(events));
    }
}

// يفلتر الفعاليات حسب تصنيف عريض ويعرض النتائج (مع تمرير اختياري لقسم الفعاليات)
function applyCategoryGroup(groupKey, allEvents, { scroll = true } = {}) {
    if (!eventCategoryGroups[groupKey]) return;

    const filtered = allEvents.filter(e => eventMatchesGroup(e, groupKey));
    renderEvents(filtered);
    showActiveCategoryBadge(groupKey);

    // نرجّع فلتر المنطقة لوضع "الكل" حتى ما يتعارض بصريًا مع فلتر التصنيف
    const citySelect = document.getElementById("filter-city");
    if (citySelect) citySelect.value = "all";

    if (scroll) {
        const target = document.getElementById("experiences");
        if (target) target.scrollIntoView({ behavior: "smooth" });
    }
}

// مفتاح التخزين المحلي المستخدم لتمرير نتيجة استبيان "خلنا نتعرف" من صفحة
// الدخول إلى الصفحة الرئيسية عشان تُطبّق كفلتر فعلي على قسم الفعاليات
const QUIZ_PREFS_STORAGE_KEY = "tashaQuizPrefs";

// تتبّع بسيط: هل فلتر المدينة الحالي (إن وجد) جاي من نتيجة الاستبيان؟
// نحتاجه عشان لما نبدّل اللغة نعيد نفس الفلتر بالضبط (تصنيف + مدينة + نص شارة مخصص)
// بدل ما يرجع فلتر المدينة "الكل" تلقائيًا كأنه فلتر يدوي عادي
let activeQuizCity = null;

// يطبّق تفضيلات استبيان "خلنا نتعرف" (التصنيف + المدينة) كفلتر فعلي على
// الفعاليات المعروضة بالصفحة الرئيسية — تُستدعى مرة وحدة عند الوصول من الاستبيان
function applyQuizPreferences(prefs, allEvents) {
    if (!prefs || !prefs.group || !eventCategoryGroups[prefs.group]) return false;

    const groupMatches = allEvents.filter(e => eventMatchesGroup(e, prefs.group));
    const citySelect = document.getElementById("filter-city");

    // نحاول نجمع بين التصنيف والمدينة، لكن إذا ما فيه فعاليات تجمع بين الاثنين
    // نكتفي بفلتر التصنيف وحده عشان ما نطلع للمستخدم صفحة فاضية بعد أول استبيان يجاوب عليه
    let filtered = groupMatches;
    let cityApplied = false;
    if (prefs.city) {
        const cityAndGroup = groupMatches.filter(e => e.city === prefs.city);
        if (cityAndGroup.length > 0) {
            filtered = cityAndGroup;
            cityApplied = true;
        }
    }

    renderEvents(filtered);
    showActiveCategoryBadge(prefs.group, { fromQuiz: true });

    document.querySelectorAll(".category-item").forEach(b => {
        b.classList.toggle("active", b.dataset.group === prefs.group);
    });

    if (citySelect) citySelect.value = cityApplied ? prefs.city : "all";

    activeQuizCity = cityApplied ? prefs.city : null;

    return true;
}

// يربط دوائر التصنيفات بحدث الضغط
function setupCategoryFilters() {
    const buttons = document.querySelectorAll(".category-item");
    if (!buttons.length) return;

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            if (typeof events === "undefined" || typeof predictEvents !== "function") return;

            document.querySelectorAll(".category-item").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeQuizCity = null; // ضغطة يدوية على دائرة تصنيف تُلغي أي فلتر مدينة جاي من الاستبيان

            applyCategoryGroup(btn.dataset.group, predictEvents(events));
        });
    });
}

// ============ منقول من ملف فريق العمل (tasha-j) ============

// التحكم بالتبديل الفوري بين العربية والإنجليزية عبر خصائص data-ar / data-en
function setupLanguageToggle() {
    const langBtn = document.getElementById('lang-btn');
    if (!langBtn) return;

    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'ar' ? 'en' : 'ar';

        document.documentElement.lang = currentLang;
        document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

        langBtn.textContent = currentLang === 'ar' ? 'English' : 'العربية';

        const elements = document.querySelectorAll('[data-ar][data-en]');
        elements.forEach(el => {
            el.innerHTML = el.getAttribute(`data-${currentLang}`);
        });

        relabelFilterOptions();

        if (typeof events !== 'undefined' && typeof predictEvents === 'function') {
            const predictedEvents = predictEvents(events);
            const activeCategoryBtn = document.querySelector('.category-item.active');
            if (activeCategoryBtn) {
                const groupKey = activeCategoryBtn.dataset.group;
                if (activeQuizCity) {
                    // فلتر التصنيف حالياً جاي من نتيجة الاستبيان ومربوط بمدينة معيّنة —
                    // نعيد تطبيقه بنفس التركيبة (تصنيف + مدينة) بدل ما نفقد جزء المدينة
                    applyQuizPreferences({ group: groupKey, city: activeQuizCity }, predictedEvents);
                } else {
                    // فيه فلتر تصنيف نشط عادي (من ضغطة دائرة يدوية): نطبّقه من جديد بس بدون تمرير، فقط لتحديث لغة الشارة والنتائج
                    applyCategoryGroup(groupKey, predictedEvents, { scroll: false });
                }
            } else {
                renderEvents(predictedEvents);
            }
        }
    });
}

// التحكم بفتح/إغلاق استبيان "خلنا نتعرف" من زر صفحة الدخول
function setupQuizToggle() {
    const toggleBtn = document.getElementById('toggle-quiz-btn');
    const quizWrapper = document.getElementById('quiz-wrapper');

    if (toggleBtn && quizWrapper) {
        toggleBtn.addEventListener('click', () => {
            quizWrapper.classList.toggle('hidden');
            if (!quizWrapper.classList.contains('hidden')) {
                quizWrapper.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// إعداد خوارزمية التوصية للأسئلة
function setupQuiz() {
    const quizForm = document.getElementById('quiz-form');
    if (!quizForm) return;

    quizForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(quizForm);
        const userCat1 = formData.get('q1');
        const userCat2 = formData.get('q2');
        const userCity = formData.get('q7');

        // نحدد التصنيف العريض (نفس تصنيفات دوائر "أقسام الفعاليات") المطابق
        // لأهم اهتمام اختاره المستخدم، ونحفظه مؤقتًا عشان يُطبّق كفلتر فعلي
        // بالصفحة الرئيسية بعد ما يضغط "شاهد كل الفعاليات المناسبة لك"
        const matchedGroup = findGroupByCategoryValue(userCat1) || findGroupByCategoryValue(userCat2);
        try {
            if (matchedGroup) {
                localStorage.setItem(QUIZ_PREFS_STORAGE_KEY, JSON.stringify({ group: matchedGroup, city: userCity || null }));
            } else {
                localStorage.removeItem(QUIZ_PREFS_STORAGE_KEY);
            }
        } catch (err) {
            // نتجاهل أي خطأ بالتخزين المحلي (مثلاً متصفح بوضع خاص) — النتيجة بصفحة الدخول تبقى تشتغل عادي
        }

        let bestMatch = null;
        let highestScore = -1;

        if (typeof events !== 'undefined' && events.length > 0) {
            events.forEach(event => {
                let score = 0;

                const catAr = event.category_ar || event.category;
                if (catAr === userCat1) score += 40;
                if (catAr === userCat2) score += 30;

                const cityAr = event.city_ar || event.city;
                if (cityAr === userCity) score += 30;

                if (score > highestScore) {
                    highestScore = score;
                    bestMatch = event;
                }
            });

            if (!bestMatch) {
                bestMatch = events[0];
                highestScore = 40;
            }
        }

        const resultDiv = document.getElementById('quiz-result');
        const matchText = document.getElementById('match-text');
        const cardContainer = document.getElementById('recommended-card-container');

        const matchPercentage = Math.min(98, Math.max(75, 60 + Math.round(highestScore / 2)));

        const isEn = currentLang === 'en';
        matchText.textContent = isEn
            ? `Based on your choices, we found an event matching ${matchPercentage}% of your preferences!`
            : `بناءً على اختياراتك، اخترنا لك فعالية تناسب اهتمامك بنسبة ${matchPercentage}٪!`;

        cardContainer.innerHTML = '';
        if (bestMatch) {
            const eventWithPrediction = (typeof predictEvents === 'function') ? predictEvents([bestMatch])[0] : bestMatch;
            const card = createEventCard(eventWithPrediction);
            card.style.maxWidth = '100%';
            cardContainer.appendChild(card);
        }

        resultDiv.classList.remove('hidden');
        resultDiv.scrollIntoView({ behavior: 'smooth' });
    });
}

// نقطة الانطلاق: تشغيل العرض بعد تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    // predictEvents() معرّفة داخل predict.js — تحسب مستوى الإقبال المتوقع
    // لكل فعالية قبل ما نعرضها (بدل رقم ثابت مكتوب يدويًا)
    if (typeof events !== 'undefined' && typeof predictEvents === 'function') {
        const predictedEvents = predictEvents(events);

        populateFilters(predictedEvents);
        renderEvents(predictedEvents);

        const citySelect = document.getElementById("filter-city");
        if (citySelect) {
            citySelect.addEventListener("change", () => {
                activeQuizCity = null; // تغيير يدوي لفلتر المنطقة يُلغي ربطه بنتيجة الاستبيان
                applyFilters(predictedEvents);
            });
        }

        // لو المستخدم جاي لتوّه من استبيان "خلنا نتعرف" بصفحة الدخول، نطبّق
        // إجاباته كفلتر فعلي على قسم الفعاليات مباشرة (مرة وحدة ثم نمسحها)
        try {
            const storedPrefsRaw = localStorage.getItem(QUIZ_PREFS_STORAGE_KEY);
            if (storedPrefsRaw) {
                localStorage.removeItem(QUIZ_PREFS_STORAGE_KEY);
                const storedPrefs = JSON.parse(storedPrefsRaw);
                applyQuizPreferences(storedPrefs, predictedEvents);
            }
        } catch (err) {
            // بيانات تخزين محلي تالفة أو غير متاحة — نتجاهلها ونكمل عرض كل الفعاليات عادي
        }
    }

    setupLanguageToggle();
    setupQuizToggle();
    setupQuiz();
    setupCategoryFilters();
});
