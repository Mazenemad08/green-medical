import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { SiInstagram, SiWhatsapp } from "react-icons/si";
import { ROUTE_PATHS, COMPANY_INFO } from "@/lib/index";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import bannerImage from "@/assets/01.jpg";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty("--header-height", `${height}px`);
      }
    };

    updateHeaderHeight();
    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  const navLinks = [
    { name: "خدماتنا", href: "#services" },
    { name: "الاستشارة المجانية", href: "#consultation" },
    { name: "حجز موعد", href: "#booking" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans" dir="rtl">
      <div className="w-full sm:-mb-2">
        <div className="relative w-full">
          <img
            src={bannerImage}
            alt="Banner"
            className="w-full h-[220px] md:h-[360px] lg:h-[460px] object-cover"
          />
        </div>
      </div>

      <header
        ref={headerRef}
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300 border-b",
          isScrolled
            ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 py-3 shadow-sm border-border"
            : "bg-background py-5 border-transparent"
        )}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link
            to={ROUTE_PATHS.HOME}
            className="flex items-center gap-2 group"
          >
            <img
              src={logo}
              alt={`${COMPANY_INFO.nameAr} Logo`}
              className="h-14 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-foreground/80 hover:text-primary font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-full px-6 shadow-md transition-all hover:scale-105">
              <a href="#booking">احجز استشارة مجانية</a>
            </Button>
          </nav>

          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        <div
          className={cn(
            "absolute top-full left-0 w-full bg-background border-b shadow-xl transition-all duration-300 md:hidden overflow-hidden",
            isMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          )}
        >
          <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-lg font-medium text-foreground py-2 border-b border-border/50"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold w-full py-6 text-lg mt-2">
              <a href="#booking" onClick={() => setIsMenuOpen(false)}>
                احجز استشارة مجانية
              </a>
            </Button>
          </div>
        </div>

      </header>

      <main className="flex-grow pt-2 sm:pt-[var(--header-height)]">
        {children}
      </main>

      <footer className="bg-primary text-primary-foreground pt-16 pb-8 border-t border-primary/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{COMPANY_INFO.nameAr}</h2>
              <p className="text-primary-foreground/80 max-w-md mx-auto">
                للتواصل أو الاطلاع على مزيد من التفاصيل يرجى زيارتنا على المواقع التالية
              </p>
            </div>

            <div className="flex items-center gap-6">
              <a
                href={COMPANY_INFO.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300 transform hover:scale-110"
                aria-label="WhatsApp"
              >
                <SiWhatsapp size={24} />
              </a>
              <a
                href={COMPANY_INFO.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300 transform hover:scale-110"
                aria-label="Instagram"
              >
                <SiInstagram size={24} />
              </a>
            </div>

            <div className="w-full pt-8 mt-8 border-t border-white/10 text-primary-foreground/60 text-sm">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p>© 2026 {COMPANY_INFO.nameAr}. جميع الحقوق محفوظة.</p>
                <div className="flex items-center gap-6">
                  <a href="#hero" className="hover:text-white transition-colors">الرئيسية</a>
                  <a href="#services" className="hover:text-white transition-colors">خدماتنا</a>
                  <a href="#booking" className="hover:text-white transition-colors">احجز موعدك</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
