# Reference Photo Generator

Reference Photo Generator is a local web app for artists who want natural, paintable reference photos. It can generate a new reference from selected painting criteria, or use uploaded photos as visual anchors for a fresh similar reference photo.

The app is intentionally focused on reference photos, not painting-style images. Prompts ask for realistic source photographs with useful value structure, readable forms, believable lighting, and no brushstroke or canvas effects.

## Features

- Generate realistic painting reference photos from artist-friendly criteria.
- Choose subject, painting approach, starting point, lighting, mood, composition, camera angle, color, pose, detail, value contrast, background complexity, and abstraction level.
- Guided filtering limits incompatible choices, such as portrait-only presets for seascapes.
- Upload one or more photos in **Work from photos** to generate a similar reference photo.
- Extract a color palette from the generated image locally in the browser.
- Calculate a local paintability score from generated image pixels.
- Inspect the reference with Original, Value, Shape, and Contour study modes.
- Copy prompts, download images, export painting briefs, and save references locally.
- Variations are currently paused to reduce API usage.

## Project Structure

```text
.
├── index.html
├── styles.css
├── app.js
├── server.py
├── assets/
├── Doc/
│   └── reference-photo-generator-plan.md
├── scripts/
│   └── create-env.sh
└── tests/
```

## Requirements

- Python 3
- An OpenAI API key with image generation access
- Google Chrome for the browser-based tests

No Node setup is required for the current local prototype.

## Local Setup

Create a local `.env` file:

```bash
./scripts/create-env.sh
```

Or copy the example manually:

```bash
cp .env.example .env
```

Then edit `.env` and add your real key:

```text
OPENAI_API_KEY=sk-your-real-key
OPENAI_IMAGE_MODEL=gpt-image-1
OPENAI_IMAGE_QUALITY=medium
OPENAI_TIMEOUT_SECONDS=180
```

Do not commit `.env`. It is intentionally ignored by Git.

## Run The App

Start the local server:

```bash
python3 server.py
```

Open:

```text
http://127.0.0.1:5174
```

If port `5174` is already in use, set another port in `.env`:

```text
PORT=5175
```

Then restart the server and open the new port.

## Testing

Run the full test suite:

```bash
python3 -B -m unittest discover -s tests -v
```

The tests cover prompt behavior, generation requests, upload-based similar reference generation, palette extraction, paintability scoring, `.env` handling, API key status, and multipart image upload structure.

## Notes On API Usage

- One criteria generation click sends one OpenAI image generation request.
- One Work from photos generation sends one OpenAI image edit request with the uploaded source image or images.
- Palette extraction and paintability scoring run locally and do not consume additional OpenAI API calls.
- Variations are disabled for now to save API usage.

## Deployment Notes

This prototype currently uses a simple Python backend that reads `OPENAI_API_KEY` from the server environment. For a public deployment, keep the key on the server only. Do not expose it in frontend code.

A production deployment should provide:

- Static hosting for `index.html`, `styles.css`, `app.js`, and assets.
- A backend endpoint compatible with `/api/generate`.
- A backend status endpoint compatible with `/api/status`.
- Secure environment-variable storage for `OPENAI_API_KEY`.

## Product Plan

The detailed product and regeneration spec lives in:

```text
Doc/reference-photo-generator-plan.md
```
