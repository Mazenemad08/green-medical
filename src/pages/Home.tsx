import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Camera,
  Phone,
  User,
  Calendar,
  ArrowRight,
  MessageSquare
} from "lucide-react";
import { SiInstagram, SiWhatsapp } from "react-icons/si";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { IMAGES } from "@/assets/images";
import heroMainImage from "@/assets/02.jpg";
import heroDetailImage from "@/assets/03.jpg";
import consultationVideo from "@/assets/horisntal.web.mp4";
import bookingImage from "@/assets/03.jpg";
import {
  SERVICES_LIST,
  CONSULTATION_DETAILS,
  COMPANY_INFO
} from "@/lib/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { springPresets, fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const bookingSchema = z.object({
  fullName: z.string().min(3, "يرجى إدخال الاسم الكامل"),
  phoneNumber: z.string().min(8, "يرجى إدخال رقم هاتف صحيح"),
  appointmentDate: z.string().min(1, "يرجى اختيار تاريخ الموعد"),
  appointmentTime: z.string().min(1, "يرجى اختيار الوقت"),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

type SiteImageDoc = {
  key: string;
  url: string;
  alt?: string;
  order?: number;
};

const IMAGE_KEYS = {
  HERO_MAIN: "HERO_MAIN",
  HERO_DETAIL: "HERO_DETAIL",
  SERVICES_IMAGE: "SERVICES_IMAGE",
  TEAM_IMAGE: "TEAM_IMAGE",
} as const;

type ImageSrcMap = {
  heroMain: string | null;
  heroDetail: string | null;
  services: string | null;
  team: string | null;
};

export default function Home() {
  const SLOT_START_HOUR = 10;
  const SLOT_END_HOUR = 14;
  const SLOT_INTERVAL_MINUTES = 20; // 15 min session + 5 min buffer
  const SLOT_DURATION_MINUTES = 15;

  const toLocalDateInputValue = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
  };

  const timeFormatter = useMemo(
    () => new Intl.DateTimeFormat("ar", { hour: "numeric", minute: "2-digit", hour12: true }),
    []
  );

  const slotOptions = useMemo(() => {
    const slots: { value: string; label: string }[] = [];
    const startMinutes = SLOT_START_HOUR * 60;
    const endMinutes = SLOT_END_HOUR * 60;

    for (
      let minutes = startMinutes;
      minutes + SLOT_DURATION_MINUTES <= endMinutes;
      minutes += SLOT_INTERVAL_MINUTES
    ) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const value = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
      const labelDate = new Date();
      labelDate.setHours(hours, mins, 0, 0);
      slots.push({ value, label: timeFormatter.format(labelDate) });
    }

    return slots;
  }, [SLOT_DURATION_MINUTES, SLOT_END_HOUR, SLOT_INTERVAL_MINUTES, SLOT_START_HOUR, timeFormatter]);

  const todayInput = useMemo(() => toLocalDateInputValue(new Date()), []);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      appointmentDate: "",
      appointmentTime: "",
    },
  });

  const onSubmit = async (data: BookingFormValues) => {
    const endpoint = import.meta.env.VITE_BOOKING_ENDPOINT as string | undefined;
    if (!endpoint) {
      alert("تعذر إرسال الطلب حالياً. الرجاء المحاولة لاحقاً.");
      return;
    }

    const appointmentDateTime = `${data.appointmentDate}T${data.appointmentTime}`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          appointmentDate: appointmentDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || "Booking failed");
      }

      alert("تم استلام طلبك بنجاح، سنتواصل معك قريباً لتأكيد الموعد.");
      form.reset();
    } catch (error) {
      console.error("Booking submission failed", error);
      alert("تعذر إرسال الطلب حالياً. الرجاء المحاولة لاحقاً.");
    }
  };

  const scrollToBooking = () => {
    const element = document.getElementById("booking");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const [remoteImages, setRemoteImages] = useState<Record<string, SiteImageDoc>>({});
  const [isImagesLoading, setIsImagesLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState({
    heroMain: true,
    heroDetail: true,
    services: true,
    team: true,
  });
  const consultationVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadImages = async () => {
      try {
        const snapshot = await getDocs(collection(db, "site_images"));
        if (!isMounted) return;
        const next: Record<string, SiteImageDoc> = {};
        snapshot.forEach((doc) => {
          const data = doc.data() as SiteImageDoc;
          if (data?.key && data?.url) {
            next[data.key] = data;
          }
        });
        setRemoteImages(next);
      } catch (err) {
        console.error("Failed to load site images:", err);
      } finally {
        if (isMounted) setIsImagesLoading(false);
      }
    };

    loadImages();
    return () => {
      isMounted = false;
    };
  }, []);

  const imageSrc: ImageSrcMap = useMemo(() => {
    const get = (key: string, fallback: string) =>
      remoteImages[key]?.url ?? (isImagesLoading ? null : fallback);
    return {
      heroMain: heroMainImage,
      heroDetail: heroDetailImage,
      services: get(IMAGE_KEYS.SERVICES_IMAGE, IMAGES.MEDICAL_EQUIPMENT_1),
      team: get(IMAGE_KEYS.TEAM_IMAGE, IMAGES.ONLINE_CONSULTATION_3),
    };
  }, [remoteImages, isImagesLoading]);

  const prevImageSrc = useRef<ImageSrcMap>(imageSrc);
  useEffect(() => {
    const prev = prevImageSrc.current;
    const updates: Partial<typeof imageLoading> = {};

    if (imageSrc.heroMain !== prev.heroMain) updates.heroMain = true;
    if (imageSrc.heroDetail !== prev.heroDetail) updates.heroDetail = true;
    if (imageSrc.services !== prev.services) updates.services = true;
    if (imageSrc.team !== prev.team) updates.team = true;

    if (Object.keys(updates).length > 0) {
      setImageLoading((current) => ({ ...current, ...updates }));
    }
    prevImageSrc.current = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    const video = consultationVideoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!video) return;
        if (entry.isIntersecting) {
          video.play().catch(() => { });
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(video);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Intro */}
      <section id="hero" className="relative pt-3 pb-14 lg:pt-28 lg:pb-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-6 lg:space-y-8"
            >
              <motion.h1
                variants={fadeInUp}
                className="text-4xl lg:text-4xl font-bold text-primary leading-tight"
              >
                شركة {COMPANY_INFO.nameAr} متخصصة في تقديم منظومات جلوس عالية الجودة، مفصلة خصيصًا لأصحاب الهمم، بهدف تعزيز الاستقلالية وتحسين جودة الحياة.
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-lg text-muted-foreground leading-relaxed"
              >
                اختيار الكرسي المناسب ليس رفاهية، بل خطوة أساسية لتحسين جودة الحياة وتعزيز الاستقلالية، ولذلك وفرنا لكم خدمة الاستشارة المجانية أونلاين، حيث يرافقكم المختص خطوة بخطوة ويشرح لكم الطريقة الصحيحة لأخذ المقاسات، حتى نتمكن من اختيار منظومة الجلوس الأنسب لكل حالة بدقة واهتمام.
              </motion.p>

              <motion.div variants={fadeInUp}>
                <Button
                  onClick={scrollToBooking}
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground text-xl px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105"
                >
                  احجز استشارة مجانية
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              transition={springPresets.gentle}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                {imageLoading.heroMain && (
                  <div className="absolute inset-0 z-10 bg-gradient-to-r from-muted via-muted/60 to-muted animate-pulse" />
                )}
                {imageSrc.heroMain && (
                  <img
                    src={imageSrc.heroMain}
                    alt="Wheelchair User"
                    className="w-full h-[500px] object-cover"
                    onLoad={() => setImageLoading((current) => ({ ...current, heroMain: false }))}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-2xl overflow-hidden shadow-xl border-4 border-white hidden md:block">
                {imageLoading.heroDetail && (
                  <div className="absolute inset-0 z-10 bg-gradient-to-r from-muted via-muted/60 to-muted animate-pulse" />
                )}
                {imageSrc.heroDetail && (
                  <img
                    src={imageSrc.heroDetail}
                    alt="Quality Detail"
                    className="w-full h-full object-cover"
                    onLoad={() => setImageLoading((current) => ({ ...current, heroDetail: false }))}
                  />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Service Section*/}
      <section id="services" className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">خدماتنا</h2>
            <div className="w-24 h-1 bg-accent mx-auto rounded-full" />
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {SERVICES_LIST.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow bg-card rounded-2xl">
                  <CardContent className="p-5 flex items-center justify-between gap-4">
                    <p className="text-base font-semibold text-foreground leading-snug">
                      {service}
                    </p>
                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation Section */}
      <section id="consultation" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center space-y-8"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-primary leading-tight">
                احجز موعد الاستشارة المجانية أونلاين لمساعدتك في أخذ المقاسات لاختيار المنظومة المناسبة لك
              </h2>

              <div className="grid sm:grid-cols-2 gap-6 text-right">
                <Card className="bg-white border-primary/10">
                  <CardContent className="p-6 flex items-center gap-4">
                    <Clock className="w-8 h-8 text-accent shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">مدة الاستشارة</p>
                      <p className="text-xl font-bold">{CONSULTATION_DETAILS.duration}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-primary/10">
                  <CardContent className="p-6 flex items-center gap-4">
                    <Camera className="w-8 h-8 text-accent shrink-0" />
                    <p className="text-lg leading-tight">{CONSULTATION_DETAILS.requirements[1]}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl flex items-center gap-3 text-right">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <p className="text-md">{CONSULTATION_DETAILS.requirements[0]}</p>
              </div>

              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
                <video
                  ref={consultationVideoRef}
                  className="w-full h-full object-cover"
                  src={consultationVideo}
                  controls
                  muted
                  playsInline
                  preload="metadata"
                />
              </div>

              <Button
                onClick={scrollToBooking}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-2xl px-12 py-8 rounded-full shadow-xl transition-all hover:scale-105"
              >
                احجز استشارة مجانية
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-4xl font-bold mb-4">احجز استشارتك الآن</h2>
                <p className="text-primary-foreground/80 text-lg">
                  يرجى تعبئة النموذج أدناه وسيقوم فريقنا بالتواصل معك في أقرب وقت ممكن لتأكيد الموعد.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-4 shadow-2xl text-foreground">
                <iframe
                  src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ0zCcIWVH9hx6GdhTqI2Q-ruUuPJ2iJu63ABiX5LSJCwdirioM79-oW4k_vSb_V9__sUdbm5KFT?gv=true"
                  className="w-full rounded-2xl"
                  style={{ border: 0, minHeight: "800px" }}
                  title="حجز موعد"
                  loading="lazy"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-12 lg:pt-12"
            >
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">معلومات تواصل الشركة</h3>
                <div className="space-y-4">
                  <a href={COMPANY_INFO.social.whatsapp} className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10 group">
                    <div className="bg-accent p-3 rounded-xl">
                      <SiWhatsapp className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl">تواصل معنا عبر واتساب</span>
                    <ArrowRight className="w-5 h-5 mr-auto transition-transform group-hover:-translate-x-2" />
                  </a>
                  <a href={COMPANY_INFO.social.instagram} className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10 group">
                    <div className="bg-pink-500 p-3 rounded-xl">
                      <SiInstagram className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl">تابعنا على إنستجرام</span>
                    <ArrowRight className="w-5 h-5 mr-auto transition-transform group-hover:-translate-x-2" />
                  </a>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10">
                <p className="text-primary-foreground/70 mb-6">
                  للتواصل أو الاطلاع على مزيد من التفاصيل يرجى زيارتنا على المواقع التالية
                </p>
                <div className="flex gap-6">
                  <a href={COMPANY_INFO.social.whatsapp} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:scale-110 transition-all">
                    <SiWhatsapp className="w-6 h-6" />
                  </a>
                  <a href={COMPANY_INFO.social.instagram} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:scale-110 transition-all">
                    <SiInstagram className="w-6 h-6" />
                  </a>
                </div>
              </div>

              <div className="hidden lg:block relative">
                {imageLoading.team && (
                  <div className="absolute inset-0 z-10 bg-gradient-to-r from-muted via-muted/60 to-muted animate-pulse rounded-3xl" />
                )}
                {imageSrc.team && (
                  <img
                    src={bookingImage}
                    alt="Team Member"
                    className="w-full h-64 object-cover rounded-3xl opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
                    onLoad={() => setImageLoading((current) => ({ ...current, team: false }))}
                  />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="py-8 bg-primary-foreground text-primary/60 text-center text-sm border-t">
        <div className="container mx-auto px-4">
          © 2026 {COMPANY_INFO.nameAr}. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}
