'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import CinematicLayer from '@/components/CinematicLayer/CinematicLayer';
import styles from './VideoIntro.module.css';

export default function VideoIntro({
  tagline = 'Cinematic Frontend Engineering',
  firstName = 'First',
  lastName = 'Last',
  subtitle = 'Designer & developer crafting immersive digital experiences.',
  videoSrc = '/hero.mp4',
  nextSectionId = 'work',
}) {
  const fgVideoRef = useRef(null);
  const bgVideoRef = useRef(null);
  const rootRef = useRef(null);
  const contentRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showSoundHint, setShowSoundHint] = useState(true);

  // Keep the blurred background layer in sync & autoplay both inline.
  useEffect(() => {
    const fg = fgVideoRef.current;
    const bg = bgVideoRef.current;
    [fg, bg].forEach((v) => {
      if (!v) return;
      v.muted = true;
      const p = v.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    });
  }, []);

  // GSAP cinematic entrance.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        rootRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.2 }
      )
        .fromTo(
          `.${styles.tagline}`,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 1 },
          '-=0.4'
        )
        .fromTo(
          `.${styles.nameLine}`,
          { y: 60, opacity: 0, filter: 'blur(12px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.3,
            stagger: 0.18,
          },
          '-=0.7'
        )
        .fromTo(
          `.${styles.subtitle}`,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 1 },
          '-=0.8'
        )
        .fromTo(
          `.${styles.controls}`,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9 },
          '-=0.7'
        )
        .fromTo(
          `.${styles.scrollIndicator}`,
          { opacity: 0 },
          { opacity: 1, duration: 0.9 },
          '-=0.5'
        );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // Auto-hide the sound hint after a few seconds.
  useEffect(() => {
    const id = setTimeout(() => setShowSoundHint(false), 6000);
    return () => clearTimeout(id);
  }, []);

  const togglePlay = useCallback(() => {
    const fg = fgVideoRef.current;
    const bg = bgVideoRef.current;
    if (!fg) return;
    if (fg.paused) {
      fg.play();
      bg?.play();
      setIsPlaying(true);
    } else {
      fg.pause();
      bg?.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const fg = fgVideoRef.current;
    if (!fg) return;
    const next = !fg.muted;
    fg.muted = next;
    setIsMuted(next);
    setShowSoundHint(false);
  }, []);

  const scrollToNext = useCallback(() => {
    const el = document.getElementById(nextSectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  }, [nextSectionId]);

  return (
    <section ref={rootRef} className={styles.hero}>
      <div className={styles.sticky}>
        {/* Blurred ambient background layer */}
        <video
          ref={bgVideoRef}
          className={styles.bgVideo}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />

        {/* Main foreground video */}
        <video
          ref={fgVideoRef}
          className={styles.fgVideo}
          src={videoSrc}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
        />

        {/* Cinematic gradient overlays */}
        <div className={styles.gradientTop} />
        <div className={styles.gradientBottom} />
        <div className={styles.vignette} />
        <div className={styles.grain} />

        {/* Three.js particle / bokeh field */}
        <CinematicLayer />

        {/* Content */}
        <div ref={contentRef} className={styles.content}>
          <p className={styles.tagline}>{tagline}</p>
          <h1 className={styles.name}>
            <span className={styles.nameLine}>{firstName}</span>
            <span className={`${styles.nameLine} ${styles.nameLast}`}>
              {lastName}
            </span>
          </h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {/* Glassmorphism controls */}
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.glassBtn}
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            className={styles.glassBtn}
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 00-2.5-4.03v8.06A4.5 4.5 0 0016.5 12z" opacity="0.4" />
                <path d="M19 19L5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 00-2.5-4.03v8.06A4.5 4.5 0 0016.5 12zM14 3.23v2.06a7 7 0 010 13.42v2.06a9 9 0 000-17.54z" />
              </svg>
            )}
          </button>

          {/* Tap for sound badge */}
          {showSoundHint && isMuted && (
            <button
              type="button"
              className={styles.soundHint}
              onClick={toggleMute}
            >
              <span className={styles.pulseDot} />
              Tap for sound
            </button>
          )}
        </div>

        {/* Scroll indicator */}
        <button
          type="button"
          className={styles.scrollIndicator}
          onClick={scrollToNext}
          aria-label="Scroll to next section"
        >
          <span className={styles.scrollText}>Scroll</span>
          <span className={styles.scrollLine}>
            <span className={styles.scrollPulse} />
          </span>
        </button>
      </div>
    </section>
  );
}
