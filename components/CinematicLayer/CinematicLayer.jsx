'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from './CinematicLayer.module.css';

/**
 * CinematicLayer
 * A floating bokeh / particle field rendered with Three.js.
 * - Warm-blue + white glowing sprites with additive blending
 * - Soft, dreamy depth-of-field feel via a radial-gradient sprite texture
 * - Slow sine-wave float + gentle mouse-parallax camera
 * - Fully self-disposing on unmount, pauses when off-screen / tab hidden
 */
export default function CinematicLayer({ particleCount = 220 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Scale particle density down on small / low-power devices.
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? Math.round(particleCount * 0.55) : particleCount;

    let width = mount.clientWidth;
    let height = mount.clientHeight;

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // --- Scene & camera ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 60;

    // --- Soft circular sprite texture (radial gradient) ---
    const makeSprite = () => {
      const size = 128;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      const g = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
      );
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.25, 'rgba(220,236,255,0.85)');
      g.addColorStop(0.55, 'rgba(120,180,255,0.35)');
      g.addColorStop(1, 'rgba(80,140,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter;
      return tex;
    };
    const sprite = makeSprite();

    // --- Particle geometry ---
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    // Per-particle animation params kept on the CPU.
    const phase = new Float32Array(count);
    const speed = new Float32Array(count);
    const amp = new Float32Array(count);
    const baseY = new Float32Array(count);

    const warm = new THREE.Color('#ffd9a8');
    const blue = new THREE.Color('#4ea3ff');
    const white = new THREE.Color('#eaf3ff');

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * 140;
      const y = (Math.random() - 0.5) * 90;
      const z = (Math.random() - 0.5) * 80;
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      baseY[i] = y;

      // Mostly blue/white with rare warm accents for cinematic warmth.
      const r = Math.random();
      const c =
        r > 0.92 ? warm : r > 0.5 ? blue.clone().lerp(white, Math.random()) : blue;
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;

      scales[i] = Math.random() * 6 + 1.5;
      phase[i] = Math.random() * Math.PI * 2;
      speed[i] = 0.15 + Math.random() * 0.35;
      amp[i] = 1.5 + Math.random() * 4;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(scales, 1));

    // Custom shader so each sprite can have its own size + soft falloff.
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: sprite },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: /* glsl */ `
        attribute float size;
        varying vec3 vColor;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uTexture;
        varying vec3 vColor;
        void main() {
          vec4 tex = texture2D(uTexture, gl_PointCoord);
          gl_FragColor = vec4(vColor, 1.0) * tex;
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // --- Mouse parallax (smoothed) ---
    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const onPointerMove = (e) => {
      const px = (e.touches ? e.touches[0].clientX : e.clientX) / window.innerWidth;
      const py = (e.touches ? e.touches[0].clientY : e.clientY) / window.innerHeight;
      target.x = (px - 0.5) * 2;
      target.y = (py - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // --- Animation loop with visibility / intersection gating ---
    const clock = new THREE.Clock();
    let rafId = null;
    let visible = true;

    const posAttr = geometry.getAttribute('position');

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        const arr = posAttr.array;
        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          arr[i3 + 1] =
            baseY[i] + Math.sin(t * speed[i] + phase[i]) * amp[i];
          arr[i3] += Math.sin(t * speed[i] * 0.3 + phase[i]) * 0.008;
        }
        posAttr.needsUpdate = true;
        points.rotation.z = Math.sin(t * 0.05) * 0.05;
      }

      // Smooth parallax toward target.
      mouse.x += (target.x - mouse.x) * 0.04;
      mouse.y += (target.y - mouse.y) * 0.04;
      camera.position.x = mouse.x * 8;
      camera.position.y = -mouse.y * 5;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    const start = () => {
      if (rafId == null && visible) {
        clock.start();
        animate();
      }
    };
    const stop = () => {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    // Pause when tab hidden.
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Pause when the hero scrolls out of view.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(mount);

    // --- Resize ---
    const onResize = () => {
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', onResize);

    start();

    // --- Cleanup / dispose ---
    return () => {
      stop();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      io.disconnect();
      geometry.dispose();
      material.dispose();
      sprite.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [particleCount]);

  return <div ref={mountRef} className={styles.canvas} aria-hidden="true" />;
}
