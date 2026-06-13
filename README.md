# Cinematic Portfolio Hero

A premium, Apple-level-polished cinematic portfolio hero built with **Next.js
(App Router)**, **React**, **Three.js**, **GSAP**, and **CSS Modules**.

It uses a talking-head video as the primary visual source, layered with a
blurred ambient duplicate, cinematic gradient overlays, and a floating
Three.js bokeh/particle field for a dreamy movie-intro atmosphere.

## Features

- **Fullscreen sticky video hero** with autoplay, loop, inline playback
- **Blurred ambient background** duplicate of the same video
- **Cinematic gradient + vignette + grain** overlays for readability and mood
- **Glassmorphism play/pause & mute/unmute controls**
- **Animated "Tap for sound" badge** that auto-hides after a few seconds
- **Three.js cinematic layer** — warm-blue + white glowing particles, additive
  blending, soft DOF sprites, sine-wave float, smoothed mouse parallax
- **GSAP entrance animations** — staggered, blurred name reveal
- **Animated scroll indicator** that smooth-scrolls to the next section
- **Fully responsive** + `prefers-reduced-motion` aware
- **Performance**: capped DPR, off-screen/tab-hidden render pausing, full
  Three.js resource disposal on unmount

## Getting started

```bash
npm install
# add your video at public/hero.mp4  (see public/README.md)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

```
app/
  layout.js
  page.js                       # composes the hero + a sample next section
  page.module.css
  globals.css
components/
  VideoIntro/                   # video hero: layers, controls, content, GSAP
    VideoIntro.jsx
    VideoIntro.module.css
  CinematicLayer/               # standalone Three.js particle/bokeh field
    CinematicLayer.jsx
    CinematicLayer.module.css
public/
  hero.mp4                       # <- your talking-head video (add this)
```

## Customizing

Edit the props in `app/page.js`:

```jsx
<VideoIntro
  tagline="AI-Driven Creative Engineering"
  firstName="Muskan"
  lastName="Sharma"
  subtitle="Product Designer & Cinematic Frontend Developer…"
  videoSrc="/hero.mp4"
  nextSectionId="work"
/>
```
