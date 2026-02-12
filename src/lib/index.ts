export const ROUTE_PATHS = {
  HOME: "/",
} as const;

export interface BookingForm {
  fullName: string;
  phoneNumber: string;
  appointmentDate: string;
  appointmentTime: string;
}

export const COMPANY_INFO = {
  name: "Green International Medical",
  nameAr: "جرين إنترناشيونال ميديكال",
  social: {
    instagram: "https://www.instagram.com/gimcompany.bh/",
    whatsapp: "https://wa.me/97333305861",
  },
} as const;

export const SERVICES_LIST = [
  "التقييم لكل حالة واختيار المنظومة المناسبة لها",
  "توضيح طريقة أخذ المقاسات أونلاين",
  "متابعة مستمرة بعد التسليم لضمان أفضل استخدام",
  "توفير قطع الغيار وتعديلات تواكب النمو",
  "شحن لمختلف الدول",
] as const;

export const CONSULTATION_DETAILS = {
  duration: "15 دقائق",
  requirements: [
    "يفضل أن يكون المستخدم جالسًا على أي منظومة جلوس متاحة أثناء التقييم",
    "يتم التقييم عبر فتح الكاميرا والتواصل المباشر مع المختص أونلاين",
  ],
} as const;
