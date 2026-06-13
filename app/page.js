import VideoIntro from '@/components/VideoIntro/VideoIntro';
import styles from './page.module.css';

export default function Home() {
  return (
    <main>
      <VideoIntro
        tagline="AI-Driven Creative Engineering"
        firstName="Muskan"
        lastName="Sharma"
        subtitle="Product Designer & Cinematic Frontend Developer — crafting immersive digital experiences where artificial intelligence meets award-winning interaction design."
        videoSrc="/hero.mp4"
        nextSectionId="work"
      />

      <section id="work" className={styles.next}>
        <div className={styles.inner}>
          <p className={styles.kicker}>Selected Work</p>
          <h2 className={styles.heading}>
            Cinematic experiences,
            <br />
            engineered to feel alive.
          </h2>
          <p className={styles.body}>
            This is where the next chapter of the portfolio unfolds. Replace
            this section with case studies, project reels, or an interactive
            grid — the hero above sets the cinematic tone.
          </p>
        </div>
      </section>
    </main>
  );
}
