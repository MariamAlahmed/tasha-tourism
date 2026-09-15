// register.js — واجهة إنشاء حساب بروتوتايب (Prototype) فقط
//
// ملاحظة: لا يوجد Backend حقيقي بهالمرحلة، لذا هذا الفورم لا ينشئ حساب فعلي
// ولا يحفظ أي بيانات (ولا حتى ملف الـ PDF نفسه — يتم فقط التحقق من نوعه واسمه
// شكليًا لأغراض العرض). أي إدخال صحيح الشكل يُقبل تلقائيًا لأغراض العرض فقط.

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("register-form");
    const name = document.getElementById("register-name");
    const identifier = document.getElementById("register-identifier");
    const password = document.getElementById("register-password");
    const successBanner = document.getElementById("register-success");
    const submitBtn = document.getElementById("register-submit");

    const roleTourist = document.getElementById("role-tourist");
    const roleProvider = document.getElementById("role-provider");
    const providerFields = document.getElementById("provider-fields");
    const providerBusinessName = document.getElementById("provider-business-name");
    const providerCategory = document.getElementById("provider-category");
    const providerCrNumber = document.getElementById("provider-cr-number");
    const providerCrFile = document.getElementById("provider-cr-file");
    const providerCrFileStatus = document.getElementById("provider-cr-file-status");

    if (!form) return;

    // نتحقق هل نوع الحساب المختار حاليًا "مقدم خدمة"
    function isProviderSelected() {
        return roleProvider.checked;
    }

    // إظهار/إخفاء حقول مقدم الخدمة حسب نوع الحساب المختار، وتحديث required بما يتوافق
    function toggleProviderFields() {
        const providerMode = isProviderSelected();
        providerFields.hidden = !providerMode;

        providerBusinessName.required = providerMode;
        providerCategory.required = providerMode;
        providerCrNumber.required = providerMode;
        providerCrFile.required = providerMode;

        if (!providerMode) {
            providerCrFileStatus.hidden = true;
        }
    }

    roleTourist.addEventListener("change", toggleProviderFields);
    roleProvider.addEventListener("change", toggleProviderFields);
    toggleProviderFields();

    // عند اختيار ملف، نتحقق أنه PDF فعلاً (بالامتداد ونوع الملف) قبل قبوله
    providerCrFile.addEventListener("change", () => {
        const file = providerCrFile.files[0];
        if (!file) {
            providerCrFileStatus.hidden = true;
            return;
        }

        const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
        if (!isPdf) {
            providerCrFileStatus.hidden = false;
            providerCrFileStatus.style.color = "var(--red)";
            providerCrFileStatus.textContent = "الملف المختار ليس بصيغة PDF — الرجاء إرفاق السجل التجاري كملف PDF.";
            providerCrFile.value = "";
            return;
        }

        providerCrFileStatus.hidden = false;
        providerCrFileStatus.style.color = "var(--green)";
        providerCrFileStatus.textContent = `تم اختيار الملف: ${file.name} ✓`;
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!name.value.trim() || !identifier.value.trim() || !password.value.trim()) {
            return;
        }

        const providerMode = isProviderSelected();

        if (providerMode) {
            const hasBusinessName = providerBusinessName.value.trim();
            const hasCategory = providerCategory.value;
            const hasCrNumber = providerCrNumber.value.trim();
            const hasCrFile = providerCrFile.files.length > 0;

            if (!hasBusinessName || !hasCategory || !hasCrNumber || !hasCrFile) {
                if (!hasCrFile) {
                    providerCrFileStatus.hidden = false;
                    providerCrFileStatus.style.color = "var(--red)";
                    providerCrFileStatus.textContent = "إرفاق ملف السجل التجاري (PDF) إلزامي لإنشاء حساب مقدم خدمة.";
                }
                return;
            }
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "جارٍ الإنشاء...";

        setTimeout(() => {
            successBanner.hidden = false;
            successBanner.textContent = providerMode
                ? `تم إنشاء حساب مقدم الخدمة (محاكاة عرض) باسم "${name.value.trim()}" — سجلّك التجاري قيد المراجعة. سيتم تحويلك لتسجيل الدخول.`
                : `تم إنشاء الحساب (محاكاة عرض) باسم "${name.value.trim()}" — سيتم تحويلك لتسجيل الدخول.`;
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1400);
        }, 600);
    });
});
