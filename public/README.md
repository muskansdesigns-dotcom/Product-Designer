# Public assets

Drop your **talking-head cinematic video** here and name it:

```
hero.mp4
```

The `VideoIntro` component references `/hero.mp4` for both the main
foreground video and the blurred ambient background layer. To use a
different filename or location, pass the `videoSrc` prop in `app/page.js`.

Recommended encoding for smooth autoplay + cinematic quality:

- Format: H.264 MP4 (also consider a `.webm` fallback)
- Resolution: 1080p or 1440p
- Bitrate: 6–12 Mbps
- The video is muted by default (browser autoplay policy); users tap the
  glass control or the "Tap for sound" badge to unmute.
