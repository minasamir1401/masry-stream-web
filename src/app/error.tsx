"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <section className="discovery-empty my-16" role="alert">
    <h1>تعذّر تحميل الصفحة مؤقتًا</h1>
    <p>حصلت مشكلة أثناء جلب البيانات. حاول مرة أخرى بعد قليل.</p>
    <button className="discovery-primary" onClick={reset}>إعادة المحاولة</button>
  </section>;
}
