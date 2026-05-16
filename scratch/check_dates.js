
const ar = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-arab", { year: "numeric" });
const id = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura-nu-arab", { year: "numeric" });
const date = new Date();
console.log("AR Hijri Year:", ar.format(date));
console.log("ID Hijri Year:", id.format(date));

const arGreg = new Intl.DateTimeFormat("ar-SA", { year: "numeric" });
console.log("AR Greg Year:", arGreg.format(date));
