// login.js — واجهة تسجيل دخول بروتوتايب (Prototype) فقط
//
// ملاحظة مهمة: لا يوجد Backend حقيقي بالمشروع بهالمرحلة، لذا هذا الفورم
// لا يتحقق من بيانات حقيقية ولا ينشئ جلسة مصادقة فعلية. أي إدخال صحيح الشكل
// (بريد/جوال + كلمة مرور) يُقبل تلقائيًا لأغراض العرض فقط. عند إضافة Backend
// حقيقي لاحقًا، يُستبدل هذا الملف بطلب فعلي لتسجيل الدخول والتحقق من المستخدم.

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    const identifier = document.getElementById("login-identifier");
    const password = document.getElementById("login-password");
    const successBanner = document.getElementById("login-success");
    const submitBtn = document.getElementById("login-submit");

    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!identifier.value.trim() || !password.value.trim()) {
            return;
        }

        // ملاحظة: تسجيل الدخول لا يطلب تحديد نوع الحساب (سائح / مقدم خدمة)،
        // لأن هذا التصنيف يُحدَّد مرة واحدة فقط عند إنشاء الحساب ويبقى محفوظًا معه.
        // بما إنه ما فيه Backend حقيقي بهالمرحلة، التحويل الافتراضي يكون للرئيسية.

        // محاكاة تأخير شبكة بسيط لأغراض العرض فقط
        submitBtn.disabled = true;
        submitBtn.textContent = "جارٍ الدخول...";

        setTimeout(() => {
            successBanner.hidden = false;
            successBanner.textContent = `تم تسجيل الدخول (محاكاة عرض) باسم "${identifier.value.trim()}" — سيتم تحويلك للرئيسية.`;
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1400);
        }, 600);
    });
});
