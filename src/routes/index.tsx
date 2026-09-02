import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { useScrollReveal, revealClass, staggerDelay } from "@/hooks/use-scroll-reveal";
import { useSiteData } from "@/contexts/SiteDataContext";
import { resolveImage, type Dish } from "@/data/siteData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "אמא אלופה - אוכל ביתי שכולם אוהבים | בנימינה" },
      {
        name: "description",
        content:
          "אמא אלופה, השריג 2 בנימינה: אוכל ביתי כשר בהשגחת הרבנות, לשבת במקום, לקחת או משלוח בוולט. פתוח א׳-ה׳ 8:30-19:00, ו׳ 8:00-14:00.",
      },
      { property: "og:title", content: "אמא אלופה - אוכל ביתי שכולם אוהבים" },
      {
        property: "og:description",
        content:
          "אוכל ביתי כשר, טרי ומבושל באהבה בבנימינה. לשבת אצלנו, לקחת או להזמין בוולט.",
      },
    ],
  }),
  component: Index,
});

/* ─────────────────────────────────  Section Title  ───────────────────────────────── */

function SectionTitle({ kicker, title }: { kicker?: string; title: string }) {
  const { ref, isRevealed } = useScrollReveal();
  return (
    <div ref={ref} className={`mb-8 text-center ${revealClass(isRevealed, "fade-up")}`}>
      {kicker ? (
        <p className="mb-2 text-sm font-semibold tracking-widest text-olive">{kicker}</p>
      ) : null}
      <h2 className="text-3xl leading-tight text-foreground sm:text-4xl">{title}</h2>
      <div
        className={`mx-auto mt-4 h-1 rounded-full bg-primary/40 transition-all duration-1000 ease-out ${isRevealed ? "w-16" : "w-0"}`}
      />
    </div>
  );
}

/* ─────────────────────────────────  Dish Card Component  ────────────────────────── */

function DishCard({ dish, index }: { dish: Dish; index: number }) {
  const reveal = useScrollReveal<HTMLLIElement>({ rootMargin: "0px 0px -40px 0px" });
  const imgSrc = resolveImage(dish.img);

  return (
    <li
      ref={reveal.ref}
      className={`overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-md ${revealClass(reveal.isRevealed, "scale-in", staggerDelay(index, 0, 80))}`}
    >
      <img
        src={imgSrc}
        alt={dish.name}
        loading="lazy"
        width={900}
        height={900}
        className="h-56 w-full object-cover"
        onError={(e) => {
          // Fallback if image fails to load
          (e.currentTarget as HTMLImageElement).src = resolveImage("dish-stew");
        }}
      />
      <div className="p-5">
        <h3 className="text-xl text-card-foreground">{dish.name}</h3>
        <p className="mt-1 text-muted-foreground">{dish.note}</p>
      </div>
    </li>
  );
}

/* ─────────────────────────────────  Hero Parallax  ───────────────────────────────── */

function useHeroParallax() {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId: number;
    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        if (imgRef.current) {
          const scroll = window.scrollY;
          imgRef.current.style.transform = `translateY(${scroll * 0.2}px) scale(1.05)`;
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return imgRef;
}

/* ─────────────────────────────────  Hero Entrance  ───────────────────────────────── */

function useHeroEntrance() {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return entered;
}

/* ═══════════════════════════════════  Page  ═══════════════════════════════════ */

function Index() {
  const { data } = useSiteData();
  const { dishes, openingHours, gallery, texts, settings } = data;

  const heroImgRef = useHeroParallax();
  const heroEntered = useHeroEntrance();

  // Section-level reveal hooks
  const aboutSection = useScrollReveal();
  const aboutCard = useScrollReveal({ rootMargin: "0px 0px -40px 0px" });
  const menuSection = useScrollReveal();
  const gallerySection = useScrollReveal();
  const locationSection = useScrollReveal();
  const locationCard = useScrollReveal({ rootMargin: "0px 0px -40px 0px" });
  const locationMap = useScrollReveal({ rootMargin: "0px 0px -40px 0px" });
  const ctaSection = useScrollReveal();
  const footerSection = useScrollReveal({ threshold: 0.08 });

  return (
    <main className="bg-warm-grain min-h-screen bg-background">
      {/* ─── Hero ─── */}
      <header className="relative overflow-hidden">
        <img
          ref={heroImgRef}
          src={resolveImage("hero-table")}
          alt="שולחן ערוך עם קדרת בשר, חלה טרייה ותוספות ביתיות"
          width={1600}
          height={1104}
          className="absolute inset-0 h-full w-full origin-center object-cover will-change-transform"
          style={{ transform: "scale(1.05)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/60 to-foreground/85" />
        <div className="relative mx-auto flex min-h-[92svh] max-w-3xl flex-col items-center justify-center px-5 py-20 text-center">
          <span
            className={`rounded-full border border-cream/40 px-4 py-1 text-sm text-cream transition-all duration-700 ease-out ${heroEntered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            {texts.heroKashrut}
          </span>
          <img
            src={resolveImage("logo")}
            alt="אמא אלופה - אוכל ביתי שכולם אוהבים"
            width={320}
            height={320}
            className={`mt-6 h-auto w-56 rounded-2xl shadow-2xl sm:w-72 transition-all duration-1000 ease-out delay-200 ${heroEntered ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
          />
          <h1
            className={`text-balance-hero mt-5 text-4xl leading-[1.15] text-cream sm:text-6xl transition-all duration-700 ease-out delay-[400ms] ${heroEntered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            {texts.heroTitle}
          </h1>
          <p
            className={`mt-5 max-w-xl text-lg leading-relaxed text-cream/85 transition-all duration-700 ease-out delay-[550ms] ${heroEntered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            {texts.heroSubtitle}
          </p>
          <div
            className={`mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row transition-all duration-700 ease-out delay-[700ms] ${heroEntered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            <a
              href={settings.woltUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition hover:brightness-110 active:scale-[0.97]"
            >
              {texts.heroCta1}
            </a>
            <a
              href="#menu"
              className="rounded-full border border-cream/60 px-8 py-4 text-lg font-semibold text-cream transition hover:bg-cream/10 active:scale-[0.97]"
            >
              {texts.heroCta2}
            </a>
          </div>
        </div>
      </header>

      {/* ─── About ─── */}
      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <SectionTitle kicker={texts.aboutKicker} title={texts.aboutTitle} />
        <div ref={aboutSection.ref}>
          <p className={`text-xl leading-relaxed text-foreground/90 ${revealClass(aboutSection.isRevealed, "fade-up", 100)}`}>
            {texts.aboutP1}
          </p>
          <p className={`mt-4 text-lg leading-relaxed text-muted-foreground ${revealClass(aboutSection.isRevealed, "fade-up", 200)}`}>
            {texts.aboutP2}
          </p>
        </div>
        <div
          ref={aboutCard.ref}
          className={`mt-10 rounded-3xl border border-border bg-card p-6 shadow-sm ${revealClass(aboutCard.isRevealed, "scale-in", 100)}`}
        >
          <p className="font-display text-lg text-olive">{texts.kashrut}</p>
          <p className="mt-2 text-muted-foreground">
            {texts.kashrutDetail}
          </p>
        </div>
      </section>

      {/* ─── Menu ─── */}
      <section id="menu" className="bg-secondary/60 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <SectionTitle kicker={texts.menuKicker} title={texts.menuTitle} />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dishes.map((dish, i) => (
              <DishCard key={dish.id || dish.name} dish={dish} index={i} />
            ))}
          </ul>
          <div ref={menuSection.ref}>
            <p className={`mt-8 text-center text-muted-foreground ${revealClass(menuSection.isRevealed, "fade-up", 100)}`}>
              {texts.menuNote}
            </p>
            <p className={`mt-3 text-center ${revealClass(menuSection.isRevealed, "fade-up", 200)}`}>
              <a href="#gallery" className="inline-block font-semibold text-primary underline-offset-4 hover:underline">
                {texts.menuGalleryLink}
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ─── Gallery ─── */}
      <section id="gallery" className="mx-auto max-w-6xl px-5 py-20">
        <div ref={gallerySection.ref}>
          <SectionTitle kicker={texts.galleryKicker} title={texts.galleryTitle} />
        </div>
        <div className={`grid gap-6 ${gallery.length > 2 ? "sm:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"}`}>
          {gallery.map((item, idx) => {
            return (
              <figure
                key={item.id || idx}
                className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:shadow-md"
              >
                <img
                  src={resolveImage(item.img)}
                  alt={item.alt}
                  loading="lazy"
                  width={1200}
                  height={800}
                  className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = resolveImage("gallery-couscous");
                  }}
                />
                {item.caption ? (
                  <figcaption className="p-5 text-center text-muted-foreground">
                    {item.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          })}
        </div>
      </section>

      {/* ─── Location & hours ─── */}
      <section id="location" className="mx-auto max-w-6xl px-5 py-20">
        <SectionTitle kicker={texts.locationKicker} title={texts.locationTitle} />
        <div className="grid gap-8 lg:grid-cols-2">
          <div
            ref={locationCard.ref}
            className={`rounded-3xl border border-border bg-card p-7 shadow-sm ${revealClass(locationCard.isRevealed, "slide-right")}`}
          >
            <h3 className="text-2xl text-card-foreground">{texts.locationAddress}</h3>
            <p className="mt-1 text-muted-foreground">{texts.locationArea}</p>
            <dl className="mt-7 space-y-3 text-lg">
              {openingHours.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`flex items-center justify-between ${idx !== openingHours.length - 1 ? "border-b border-border pb-3" : ""}`}
                >
                  <dt className="text-muted-foreground">{item.label}</dt>
                  <dd className="font-semibold">{item.hours}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-muted-foreground">
              {texts.deliveryNote}
            </p>
          </div>
          <div
            ref={locationMap.ref}
            className={`overflow-hidden rounded-3xl border border-border shadow-sm ${revealClass(locationMap.isRevealed, "slide-left", 120)}`}
          >
            <iframe
              title={`מפת הדרך לאמא אלופה - ${texts.locationAddress}`}
              src={`https://www.google.com/maps?q=${settings.mapQuery}&hl=iw&z=16&output=embed`}
              loading="lazy"
              className="h-80 w-full lg:h-full"
            />
          </div>
        </div>
      </section>

      {/* ─── Order & delivery ─── */}
      <section className="px-5 pb-20">
        <div
          ref={ctaSection.ref}
          className={`mx-auto max-w-4xl rounded-[2rem] bg-primary px-6 py-14 text-center shadow-lg ${revealClass(ctaSection.isRevealed, "blur-in")}`}
        >
          <h2 className="text-3xl text-primary-foreground sm:text-4xl">
            {texts.ctaTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/85">
            {texts.ctaSubtitle}
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={settings.woltUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-cream px-8 py-4 text-lg font-semibold text-primary shadow transition hover:brightness-105 active:scale-[0.97]"
            >
              {texts.ctaCta1}
            </a>
            <a
              href="#location"
              className="rounded-full border border-primary-foreground/50 px-8 py-4 text-lg font-semibold text-primary-foreground transition hover:bg-primary-foreground/10 active:scale-[0.97]"
            >
              {texts.ctaCta2}
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-secondary/60 py-14">
        <div
          ref={footerSection.ref}
          className={`mx-auto grid max-w-6xl gap-8 px-5 text-center sm:grid-cols-3 sm:text-right ${revealClass(footerSection.isRevealed, "fade-up")}`}
        >
          <div>
            <img
              src={resolveImage("logo")}
              alt="אמא אלופה"
              width={160}
              height={160}
              className="mx-auto h-auto w-36 rounded-xl sm:mx-0"
            />
          </div>
          <div className="text-muted-foreground">
            <p className="font-semibold text-foreground">כתובת</p>
            <p className="mt-2">{texts.footerAddress}</p>
            <p>{texts.footerArea}</p>
          </div>
          <div className="text-muted-foreground">
            <p className="font-semibold text-foreground">שעות פתיחה</p>
            {openingHours.slice(0, 2).map((item, idx) => (
              <p key={item.id || idx} className={idx === 0 ? "mt-2" : ""}>
                {item.label} {item.hours}
              </p>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl px-5">
          <p className="rounded-2xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
            {texts.footerKashrut}
          </p>
          <div className="mt-6 flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} אמא אלופה. כל הזכויות שמורות.</p>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs text-muted-foreground/60 transition hover:bg-muted hover:text-foreground"
            >
              🔒 כניסת ניהול (Admin)
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
