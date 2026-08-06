# Reference Photo Generator Plan

## Implemented Functionality Snapshot

Last updated: 2026-08-03

The current prototype is a local web app called **Reference Studio**. It helps artists generate natural source reference photos for painting, then inspect the generated image with painter-focused helper tools.

### Local App And Runtime

- The app runs locally from this repository.
- Frontend files are `index.html`, `styles.css`, and `app.js`.
- The backend is `server.py`, using Python standard library HTTP handling.
- The intended local URL is `http://127.0.0.1:5174`.
- The backend exposes `/api/generate` for image generation and `/api/status` for secret-safe API key status checks.
- Vercel deployment uses Python functions in `api/generate.py` and `api/status.py` to provide those same API routes.
- `vercel.json` configures the Python functions with a longer maximum duration for image generation.
- Environment setup uses a local `.env` file in the `ReferencePhotoGen` folder.
- Production deployment must use Vercel project environment variables for secrets such as `OPENAI_API_KEY`; secrets must not be committed to GitHub.
- `scripts/create-env.sh` helps create `.env` securely and writes the API key with restricted file permissions.

### OpenAI Image Generation

- The Generate button creates a new main reference photo through the OpenAI image API.
- Each Generate click sends a fresh request with a new request id, so the app should not reuse the previous generated image.
- The Work from photos tab sends uploaded source photos through the image edit path.
- The default image model is `gpt-image-1`.
- The default image quality is `medium`.
- The API key is read from `OPENAI_API_KEY` or from `.env`.
- On Vercel, `OPENAI_API_KEY` is read from the project environment variables.
- The server can re-read `.env` if the file is added or corrected after the server starts.
- `/api/status` reports whether an API key is configured without exposing the key.

### Prompt Direction

- The prompt is built around a realistic reference photograph, not a painting-like image.
- The generated image is explicitly instructed to look like a natural source photo.
- The prompt tells the model to avoid painting, illustration, sketch, concept art, render, stylized artwork, brushstrokes, canvas texture, watercolor, oil paint, ink, and pastel effects.
- Painting approach is used only to guide reference-photo choices such as light, composition, atmosphere, subject readability, and value structure.
- Additional artist requirements are empty by default.
- If the artist leaves the custom box empty, the app does not inject a default subject. It asks the prompt to invent a fresh subject appropriate for the selected category.

### Supported Subjects

Implemented subject options include:

- Portrait
- Figure
- Hands / Feet
- Still Life
- Landscape
- Seascape
- City / Architecture
- Animal
- Botanical
- Fabric / Costume
- Interior
- Narrative Scene
- Fantasy Reference
- Lighting Study
- Color Study

### Supported Painting Approaches

Implemented painting approach options include:

- Traditional / Classical
- Realism
- Impressionism
- Expressionism
- Abstract
- Contemporary
- Surrealism
- Minimalism
- Decorative / Folk
- Plein air
- Tonalism
- Alla prima

### Guided Subject Workflow

- The app uses subject profiles to guide compatible choices.
- When a subject is selected, the app filters the available painting approaches, starting points, lighting, mood, composition, camera angle, color options, and pose or motion options.
- This prevents mismatched combinations, such as using a portrait-specific starting point for a seascape.
- Example: selecting **Seascape** keeps options like Plein air, Tonalism, Golden surf study, Storm coast, Low-tide rocks, Storm-filtered light, Shoreline diagonal, and Breaking wave rhythm.
- Example: selecting **Seascape** hides options like Decorative / Folk, Rembrandt portrait, Dramatic figure, and Candlelight.
- A **Show all options** control lets the artist override guided filtering when needed.

### Starting Points

- The former Preset Library is now treated as **Starting Points**.
- Starting points are quick combinations of subject, approach, lighting, composition, and extra requirements.
- Starting points are filtered by the selected subject in guided mode.
- Starting points do not generate by themselves. They load settings into the form, then the artist clicks Generate to create a new reference.

### Main Reference Display

- The main canvas displays the generated reference photo.
- The artist can switch between study modes:
  - Original
  - Value
  - Shape
  - Contour
- Painterly overlays from painting approach have been removed so the reference photo is not visually turned into a painting.
- Lighting overlays can still preview selected lighting effects in the study view.

### Uploaded Photo Workflow

- A second tab, **Work from photos**, lets artists upload one or more source photos.
- The browser prepares uploaded files as resized source images before sending them to the backend.
- The upload workflow supports up to 6 source photos per request.
- The only implemented upload task is **Similar photo**.
- Similar photo generates a fresh realistic reference photo inspired by the uploaded source photo or photos.
- Remove background, Combine photos, Change part, local cutout, and cutout refinement have been removed from the current upload UI.
- Changing the uploaded source photo clears the previous upload result before a new task runs.
- Artists can add optional reference notes for the similar-photo request.
- The upload result can be downloaded or loaded into the main reference workspace with **Use As Reference**.
- The upload result stage stays visually empty until a generated photo is ready, avoiding placeholder text in the preview area.

### Palette Tools

- Before generation, the palette panel shows a fallback palette based on the selected settings.
- After generation, the palette panel extracts colors from the generated image in the browser.
- Palette extraction is local and does not consume an additional OpenAI API call.
- Exported briefs include the current palette name and colors.

### Paintability Score

- The paintability score is no longer static.
- Before generation, the app uses a settings-based heuristic.
- After generation, the app samples pixels from the generated image in the browser.
- The score is local and does not consume an additional OpenAI API call.
- The current breakdown includes:
  - Value
  - Clarity
  - Composition
  - Color
- The score is meant to estimate whether the reference has useful value range, readable masses, manageable edge density, balanced composition, and usable color information.

### Variations

- Variation infrastructure exists but is currently disabled to save API usage.
- The variation cards show **Variations paused**.
- While disabled, Generate sends only one main image request.
- No variation requests are sent automatically.
- The backend still contains support for image-edit variation requests using a source image data URL, so variations can be re-enabled later.

### Save, Export, And Utility Actions

- Artists can copy the generated prompt.
- Artists can download the current reference image.
- Artists can export a painting brief with settings, prompt, palette, and paintability information.
- Artists can save the current reference locally in the browser.
- Saved references are stored in localStorage.
- The app includes Shuffle and Reset actions for exploring new combinations.

### Current Test Coverage

- The test suite is in `tests/test_generation_feature.py`.
- `python3 -B -m unittest discover -s tests -v` currently passes.
- Tests cover:
  - Generate sends exactly one request while variations are paused.
  - Variation source image data is not sent when variations are disabled.
  - The prompt does not include the old painting-like reference wording.
  - The custom requirements box does not inject the old default subject.
  - Seascape guided filtering includes compatible options and hides incompatible options.
  - Palette colors update from the generated image.
  - Paintability updates from generated image pixels.
  - The upload tab sends multiple uploaded photos for similar-reference generation.
  - Multi-image edit requests are sent as multipart image arrays.
  - `.env` loading, late API key detection, and `/api/status`.
  - Backend variation edit request structure for future variation support.
  - Removed upload controls for background removal, photo combination, change-part editing, and cutout refinement stay absent.

### Current Decisions And Constraints

- The app is optimized for generating reference photos for painters, not final paintings.
- One Generate click consumes one OpenAI image generation call.
- One Work from photos Generate Similar Photo click consumes one OpenAI image edit call because source images are supplied.
- Palette extraction and paintability scoring run locally in the browser.
- Variations are paused for now to control API usage.
- Node is not installed in the current local environment, so JavaScript syntax is validated through the browser-based test rather than `node --check`.

## Regeneration Specification

Use this section as the implementation brief for rebuilding the current app behavior. It is intended to regenerate a functionally equivalent Reference Studio app, not necessarily byte-for-byte identical source code.

### Source Of Truth Files

- `index.html`: page structure, form controls, workflow tabs, upload workspace, output panels.
- `styles.css`: responsive visual design and layout.
- `app.js`: frontend data catalogs, prompt builder, image rendering, palette extraction, paintability scoring, upload workflow, saved references.
- `server.py`: local Python backend, `.env` loading, OpenAI image generation/edit requests.
- `api/generate.py`: Vercel Python function for production `/api/generate`.
- `api/status.py`: Vercel Python function for production `/api/status`.
- `vercel.json`: Vercel function configuration.
- `tests/test_generation_feature.py`: behavior contract tests.
- `tests/browser_generate_probe.html`: browser probe for criteria-based generation.
- `tests/browser_upload_probe.html`: browser probe for upload-based generation.
- `assets/portrait-window-reference.png` and `assets/reference-board.png`: local fallback/sample reference imagery.
- `scripts/create-env.sh`: secure helper for creating `.env`.

### Runtime Contract

- App name: **Reference Studio**.
- Local app type: static frontend plus Python standard-library backend.
- Default host: `127.0.0.1`.
- Default port: `5174`.
- Alternate ports may be used when `5174` is occupied.
- Required local env file: `.env` in the project root.
- Required secret key: `OPENAI_API_KEY`.
- Optional env values:
  - `HOST`
  - `PORT`
  - `OPENAI_IMAGE_MODEL`
  - `OPENAI_IMAGE_QUALITY`
  - `OPENAI_TIMEOUT_SECONDS`
- Default image model: `gpt-image-1`.
- Default image quality: `medium`.
- Default OpenAI timeout: `180` seconds.
- Allowed image sizes: `1024x1024`, `1024x1536`, `1536x1024`, `auto`.

### Top-Level UI

- Header shows:
  - Eyebrow: `Painting Reference Generator`
  - Title: `Reference Studio`
  - Global actions: `Shuffle`, `Reset`
- Main workflow tabs:
  - `Generate from criteria`
  - `Work from photos`
- The criteria tab is active by default.

### Criteria Generator UI

The criteria generator uses a left control panel and a right output workspace.

Left panel sections:

- Subject button grid.
- `Show all options` checkbox.
- Guided compatibility status text.
- Painting Approach button grid.
- Starting Points button grid.
- Select controls:
  - Purpose
  - Lighting
  - Mood
  - Composition
  - Camera Angle
  - Color
  - Pose / Motion
- Range controls:
  - Detail: `Simplified shapes`, `Balanced`, `Rich detail`
  - Value Contrast: `Soft`, `Balanced`, `Dramatic`
  - Background: `Plain`, `Suggested`, `Detailed`
  - Abstraction: `Literal`, `Semi-abstract`, `Abstract structure`
- Additional Requirements textarea. It must be empty by default.
- Guardrail checkboxes, checked by default:
  - `accurate anatomy when people or animals are involved`
  - `clear paintable value structure`
  - `no text, logos, or watermarks`
  - `avoid unnecessary background clutter`
  - `coherent perspective and spatial relationships`
  - `avoid overly polished AI look`
- Primary action: `Generate Reference`.

Right workspace:

- Primary reference canvas.
- Actions: `Copy Prompt`, `Download Image`, `Export Brief`, `Save`.
- Study mode tabs:
  - `Original`
  - `Value`
  - `Shape`
  - `Contour`
- Paintability score with rows for `Value`, `Clarity`, `Composition`, and `Color`.
- Metrics list for light, value, detail, color, angle, and mood.
- Palette panel.
- Reference Brief panel.
- Prompt Summary textarea.
- Variations section with four disabled variation cards while `ENABLE_VARIATIONS = false`.
- Saved References grid.

### Work From Photos UI

The upload workflow uses the same top-level visual language as the criteria generator.

Left panel sections:

- Source Photos upload area.
- File input accepts `image/png`, `image/jpeg`, and `image/webp`.
- Multiple file upload is enabled.
- Upload count text.
- Source thumbnail grid.
- `Clear photos` action.
- Output Shape select:
  - `auto`
  - `1024x1024`
  - `1024x1536`
  - `1536x1024`
- Source Match select:
  - `high`
  - `low`
- Reference Notes textarea.
- Primary action: `Generate Similar Photo`.

Right workspace:

- Header: `Photo Reference Workspace`.
- Actions: `Copy Prompt`, `Download Result`, `Use As Reference`.
- Sources panel showing uploaded photos.
- Result stage showing only the generated image once ready. It must not show placeholder text such as `Result appears here`.
- When uploaded photos change, clear any previous upload result image and stale in-flight upload result.
- Upload Prompt Summary textarea.

### Frontend Constants

- `STORAGE_KEY`: `reference-studio-saved`
- `ENABLE_VARIATIONS`: `false`
- `variationTypes`: `lighting`, `palette`, `background`, `composition`
- `MAX_UPLOAD_PHOTOS`: `6`
- `UPLOAD_IMAGE_MAX_SIDE`: `1536`
- Upload images are resized in the browser and sent as JPEG data URLs at quality `0.92`.
- Uploaded result can be loaded into the criteria workspace through `Use As Reference`.

### Subject Catalog

Subjects must include these labels, focus notes, and orientations:

- `Portrait`: portrait; face planes, expression, hands, hair, and skin temperature.
- `Figure`: portrait; gesture, balance, anatomy, fabric folds, and readable silhouette.
- `Hand and foot study`: square; joint structure, overlap, foreshortening, and clean shadow shapes.
- `Still life`: square; object relationships, cast shadows, fabric folds, and material edges.
- `Landscape`: landscape; big value masses, atmospheric depth, sky structure, and horizon placement.
- `Seascape`: landscape; wave rhythm, horizon control, reflective water, sky mass, and atmospheric distance.
- `Cityscape`: landscape; perspective, repeating shapes, windows, street planes, and scale cues.
- `Animal`: landscape; animal anatomy, clear pose, fur texture, and readable silhouette.
- `Botanical / floral`: square; petal structure, leaf rhythm, transparent stems, and lost-and-found edges.
- `Costume and fabric`: portrait; drapery folds, pattern scale, fabric weight, and gesture under cloth.
- `Object / prop`: square; planes, ellipses, material changes, reflections, and cast shadows.
- `Vehicle / machine`: landscape; large geometry, wheels, perspective, hard edges, and reflective forms.
- `Interior scene`: landscape; room perspective, furniture scale, window light, and quiet object groupings.
- `Narrative scene`: landscape; story gesture, figure-to-environment relationship, staging, and readable action.
- `Fantasy reference`: landscape; invented subject structure, believable lighting, scale, and paintable design shapes.
- `Lighting study`: portrait; clear light side, shadow side, cast shadows, and simple value families.
- `Color study`: square; palette relationships, warm/cool shifts, value clarity, and color accents.

Canvas size rules:

- Portrait default: `768x1152`.
- Landscape subject or `Wide scene` composition: `1152x768`.
- Square subject when composition is not `Wide scene`: `960x960`.
- API size mirrors canvas shape: landscape -> `1536x1024`, portrait -> `1024x1536`, square -> `1024x1024`.

### Painting Approach Catalog

Each approach needs a label, a prompt-detail phrase, fallback palette name, and fallback palette colors.

- `Traditional`: balanced realism, clear form planes, stable composition, and controlled light. Palette `Traditional warm neutrals`: `#271f1b`, `#6f513e`, `#b98a63`, `#d9c6a3`, `#e7e4d6`.
- `Realism`: observable materials, natural proportion, accurate light, and believable everyday specificity. Palette `Natural observation`: `#1f2420`, `#5e604f`, `#907d61`, `#c2aa87`, `#e0d8c9`.
- `Impressionism`: outdoor light, color temperature shifts, atmospheric softness, and large readable shapes. Palette `Broken outdoor light`: `#3f6276`, `#8aa0a1`, `#c7b36f`, `#d48a56`, `#f0dfbd`.
- `Expressionism`: heightened gesture, dramatic lighting, bolder color relationships, and emotional staging. Palette `Expressive heat`: `#25202a`, `#72405a`, `#b84e35`, `#e1a14f`, `#ebe0cb`.
- `Abstract`: shape rhythm, value masses, color relationships, texture cues, and compositional structure. Palette `Shape and rhythm`: `#25252a`, `#355f70`, `#a44c3d`, `#d4a24f`, `#efeadf`.
- `Contemporary`: modern cropping, confident negative space, unusual viewpoint, and visual tension. Palette `Contemporary muted contrast`: `#1e2424`, `#566b55`, `#b36b49`, `#d8cfbf`, `#f6f4ef`.
- `Surrealism`: dreamlike scale, symbolic object relationships, and believable photographic lighting. Palette `Dreamlike muted color`: `#202337`, `#4d6c76`, `#8c6f9e`, `#c38f62`, `#e7dfcd`.
- `Minimalism`: sparse forms, quiet negative space, restrained detail, and simplified value masses. Palette `Sparse tonal set`: `#22211e`, `#7d8075`, `#c6c0b4`, `#ece8df`, `#ffffff`.
- `Decorative / Folk`: strong patterns, symbolic color relationships, front-facing shapes, and decorative rhythms. Palette `Decorative pattern color`: `#203b3a`, `#7c3f35`, `#c58c3a`, `#d9c66a`, `#f5efe0`.
- `Plein air`: natural atmosphere, readable outdoor masses, changing light, and clear weather cues. Palette `Outdoor atmosphere`: `#304e42`, `#6d885f`, `#b3a660`, `#d3b27d`, `#e9e0cb`.
- `Tonalism`: soft edges, muted color, atmospheric value shifts, and close-value harmony. Palette `Muted tonal atmosphere`: `#242826`, `#4d5b55`, `#6f7464`, `#9f9579`, `#d3c7ad`.
- `Alla prima`: decisive light shapes, simplified planes, strong shadow design, and broad masses. Palette `Painterly direct color`: `#29231e`, `#6e4434`, `#a46b45`, `#c9a262`, `#efe1c7`.

### Option Catalog

Purpose options:

- `Finished painting`
- `Study`
- `Composition exploration`
- `Color study`
- `Lighting study`
- `Anatomy study`

Lighting options:

- `Warm window light from the left`
- `Dramatic side light`
- `Soft north-light studio`
- `Golden hour backlight`
- `Overcast diffused light`
- `Candlelight`
- `High-key studio light`
- `Low-key chiaroscuro`
- `Clear midday coastal light`
- `Storm-filtered light`
- `Reflected water light`

Mood options:

- `Quiet and contemplative`
- `Calm`
- `Dramatic`
- `Intimate`
- `Bright`
- `Melancholic`
- `Mysterious`
- `Energetic`

Composition options:

- `Three-quarter crop`
- `Close-up`
- `Half-body`
- `Full-body`
- `Wide scene`
- `Asymmetrical crop`
- `Spacious negative space`
- `Tight observational crop`
- `Low horizon`
- `High horizon`
- `Shoreline diagonal`

Camera options:

- `Eye level`
- `Low angle`
- `High angle`
- `Top-down`
- `Three-quarter view`
- `Profile view`
- `Waterline low angle`

Color options:

- `Natural muted color`
- `Limited warm palette`
- `Cool shadows with warm lights`
- `High chroma accents`
- `Earth pigments`
- `Complementary contrast`
- `Sea greens and muted violets`

Pose / Motion options:

- `Still and natural`
- `Gentle gesture`
- `Dynamic action`
- `Resting pose`
- `Contrapposto`
- `Object-focused arrangement`
- `Breaking wave rhythm`
- `Calm water movement`
- `Wind-driven motion`
- `Atmospheric movement`

### Guided Filtering Contract

- Guided mode is on by default.
- `Show all options` disables filtering and exposes the full option catalog.
- In guided mode, each subject defines compatible options for painting approaches, purpose, lighting, mood, composition, camera, color, and pose.
- If the current selected value is no longer compatible after a subject change, replace it with the subject default if available, otherwise use the first compatible value.
- Starting Points are filtered to those whose `settings.subject` equals the selected subject.
- Seascape must satisfy this contract:
  - Compatible styles include `Plein air` and `Tonalism`.
  - Compatible styles exclude `Decorative / Folk`.
  - Starting Points include `Golden surf study`, `Storm coast`, and `Low-tide rocks`.
  - Starting Points exclude `Rembrandt portrait` and `Dramatic figure`.
  - Lighting includes `Storm-filtered light`.
  - Lighting excludes `Candlelight`.
  - Composition includes `Shoreline diagonal`.
  - Pose includes `Breaking wave rhythm`.

### Starting Points

Starting Points load form values but do not generate automatically.

- `Rembrandt portrait`: Portrait, Traditional, Finished painting, Low-key chiaroscuro, Quiet and contemplative, Three-quarter crop, Three-quarter view, Earth pigments, Still and natural, detail 1, contrast 2, background 0, abstraction 0. Requirements: elderly sitter in three-quarter profile, visible hands, dark simple ground, warm skin lights.
- `Impressionist field`: Landscape, Impressionism, Color study, Golden hour backlight, Bright, Wide scene, Eye level, Cool shadows with warm lights, Still and natural, detail 1, contrast 1, background 2, abstraction 1. Requirements: open field, tree line, moving cloud shapes, warm evening light, visible atmosphere.
- `Golden surf study`: Seascape, Plein air, Color study, Golden hour backlight, Bright, Wide scene, Eye level, Cool shadows with warm lights, Breaking wave rhythm, detail 1, contrast 1, background 2, abstraction 0. Requirements: rolling surf at golden hour, low horizon, warm sky reflections, readable foam shapes.
- `Storm coast`: Seascape, Tonalism, Finished painting, Storm-filtered light, Dramatic, Shoreline diagonal, Low angle, Natural muted color, Wind-driven motion, detail 1, contrast 2, background 2, abstraction 0. Requirements: dark coastal rocks, incoming storm clouds, strong wave masses, misty distance.
- `Low-tide rocks`: Seascape, Realism, Study, Overcast diffused light, Calm, Spacious negative space, High angle, Natural muted color, Calm water movement, detail 2, contrast 1, background 1, abstraction 0. Requirements: tidal pools, wet rocks, reflected sky, subtle ripples, clear foreground shapes.
- `Minimal still life`: Still life, Minimalism, Study, Soft north-light studio, Calm, Spacious negative space, Eye level, Natural muted color, Object-focused arrangement, detail 0, contrast 1, background 0, abstraction 0. Requirements: one ceramic bowl, two pears, folded linen, clean tabletop, spacious quiet composition.
- `Dramatic figure`: Figure, Expressionism, Anatomy study, Dramatic side light, Dramatic, Full-body, Low angle, High chroma accents, Dynamic action, detail 1, contrast 2, background 0, abstraction 1. Requirements: full figure with clear gesture, extended arm, readable weight shift, simple studio floor.
- `Tonal interior`: Interior scene, Tonalism, Finished painting, Overcast diffused light, Melancholic, Asymmetrical crop, Eye level, Limited warm palette, Still and natural, detail 1, contrast 0, background 2, abstraction 0. Requirements: empty chair near a window, books on a side table, soft gray-green atmosphere.
- `Abstract color map`: Color study, Abstract, Composition exploration, High-key studio light, Energetic, Tight observational crop, Top-down, Complementary contrast, Object-focused arrangement, detail 0, contrast 2, background 0, abstraction 2. Requirements: floral shapes reduced into large value masses, complementary accents, strong shape rhythm.

### Criteria Prompt Template

Build the main prompt with these lines in this order:

```text
Generate a realistic reference photograph for an artist to paint from: {subject label lowercase} {purpose lowercase}.
The image itself must look like a natural source photo, not a painting, illustration, sketch, concept art, render, or stylized artwork.
Artist's intended painting approach: {style label}. Use this only to guide reference-photo choices: {style detail}.
Subject focus: {subject focus}.
Additional artist requirements: {requirements}.
Lighting and mood: {lighting}; {mood lowercase}.
Composition: {composition lowercase}, {camera lowercase}, {pose lowercase}.
Visual priorities: {contrast label lowercase} value contrast, {detail label lowercase} detail, {background label lowercase} background, {color lowercase}, {abstraction label lowercase} abstraction level.
Painter needs: readable silhouette, useful edge variety, believable color temperature, clear big value families.
Constraints: {checked guardrails joined by "; "}; no brushstrokes; no canvas texture; no watercolor, oil paint, ink, or pastel effect; no text, signature, logo, or watermark.
```

If Additional Requirements is empty, use this line instead:

```text
Additional artist requirements: none provided; invent a fresh, non-repeating subject appropriate for the selected {subject label lowercase} category.
```

### Upload Prompt Template

Upload operations:

- `similar`: label `Similar reference`, status `Similar reference`, title `Generate a similar reference photo`, minimum photos 1. Prompt: `Generate a new realistic reference photograph inspired by the uploaded source photo or photos. Preserve the core subject type, camera feeling, lighting family, color temperature, and composition logic, but make it a fresh natural photo rather than a copy.`

Build the upload prompt with these lines in this order:

```text
Generate a similar reference photo for an artist's painting reference.
Use {photo count or "the"} uploaded source photo(s) as visual input.
Source 1: {filename}, {width}x{height}.
Source 2: {filename}, {width}x{height}.
Generate a new realistic reference photograph inspired by the uploaded source photo or photos. Preserve the core subject type, camera feeling, lighting family, color temperature, and composition logic, but make it a fresh natural photo rather than a copy.
Artist's reference notes: {requirements}.
Output priorities: realistic source photograph, clean readable value structure, believable color temperature, coherent perspective, useful edges, and enough detail to paint from.
Constraints: do not create a painting, illustration, sketch, concept art, render, or stylized artwork; no brushstrokes; no canvas texture; no watercolor, oil paint, ink, or pastel effect; no text, signature, logo, or watermark.
```

If upload requirements are empty, use this line:

```text
Artist's reference notes: none provided; make the most useful similar natural reference-photo result.
```

### Server Prompt Wrapper

The backend must append these instructions to every OpenAI request:

```text
Generate a brand-new image for this request. Do not reuse or copy any previous generation.
Variation request id: {requestId}.
The output must be a realistic source photograph for artists to paint from.
Do not create a painting, illustration, sketch, concept art, 3D render, or painterly/stylized image.
Avoid brushstrokes, canvas texture, watercolor effects, oil paint effects, ink outlines, pastel texture, and gallery-art presentation.
No text, no signature, no logo, no watermark.
```

If one source image is present, add:

```text
Use the provided source photograph as the visual anchor; preserve the requested subject identity, pose, lighting logic, and camera realism unless the prompt explicitly asks for a change.
```

If multiple source images are present, add:

```text
Use the provided source photographs as visual anchors for the similar reference request, with coherent perspective, scale, lighting, and photographic realism.
```

### API Contract

`GET /api/status` returns:

```json
{
  "openaiApiKeyConfigured": true,
  "envFilePresent": true,
  "model": "gpt-image-1",
  "quality": "medium",
  "port": 5174
}
```

`POST /api/generate` accepts:

```json
{
  "prompt": "string, required",
  "settings": {},
  "size": "1024x1024 | 1024x1536 | 1536x1024 | auto",
  "requestId": "string",
  "variationType": "string, optional",
  "sourceRequestId": "string, optional",
  "sourceImageDataUrl": "single base64 data URL, optional",
  "sourceImageDataUrls": ["multiple base64 data URLs, optional"],
  "inputFidelity": "high | low",
  "uploadOperation": "similar"
}
```

`POST /api/generate` returns:

```json
{
  "imageDataUrl": "data:image/png;base64,...",
  "created": 123,
  "model": "gpt-image-1",
  "size": "1024x1024",
  "quality": "medium",
  "requestId": "string",
  "revisedPrompt": "string or null",
  "sourceRequestId": "string",
  "variationType": "string",
  "uploadOperation": "string",
  "sourceImageCount": 0
}
```

Generation behavior:

- If no source image is present, call `https://api.openai.com/v1/images/generations` with JSON.
- If one or more source images are present, call `https://api.openai.com/v1/images/edits` with multipart form data.
- OpenAI payload fields: `model`, `prompt`, `n: 1`, `size`, `quality`, `background: opaque`, `output_format: png`.
- For edit requests include `input_fidelity`, defaulting to `high`.
- For one source image, multipart field name is `image`.
- For multiple source images, multipart field name is `image[]`.
- Accept PNG, JPEG, and WEBP data URLs.
- Reject more than 6 source photos.
- De-duplicate identical source data URLs before sending.
- Missing or placeholder API key returns HTTP 503 with `requiresApiKey: true`.
- Bad prompt, bad source image, or invalid request returns HTTP 400.
- OpenAI failures return HTTP 502.

### Palette Extraction

- Before generation, show the fallback palette from the selected painting approach.
- After generation, sample the generated image locally in the browser.
- Draw the generated image into a temporary canvas 72 pixels wide.
- Ignore pixels with alpha below 180.
- Ignore luminance below 18 or above 242.
- Bucket colors by rounding each RGB channel to the nearest 24.
- Score buckets by count, saturation, and closeness to mid-luminance.
- Return 5 unique hex colors.
- If fewer than 5 colors are available, complete the palette by lightening or darkening existing colors.
- Palette extraction must not call OpenAI.

### Paintability Score

Before a generated image is available, use the settings heuristic:

- Start at 68.
- Add 3 points per checked guardrail.
- Add `contrastRange * 4`.
- Add 1 for rich detail, otherwise add 4.
- Add 5 unless background is detailed.
- Add 4 for dramatic or window lighting, otherwise add 2.
- Add 4 when custom requirements exceed 24 characters.
- Subtract 5 for abstract structure when the selected approach is not Abstract.
- Clamp score to 52-98.

After a generated image loads, use local pixel analysis:

- Sample the image into a 96-pixel-wide canvas.
- Compute luminance values, saturation values, hue bins, clipped-pixel ratio, value bins, and Sobel-like edge stats.
- Score breakdown:
  - Value: value range, standard deviation, and clipping penalty.
  - Clarity: edge density and largest value-bin share.
  - Composition: edge balance, center edge share, and border edge share.
  - Color: average saturation, saturation spread, and hue-bin count.
- Overall score formula: `value * 0.35 + clarity * 0.25 + composition * 0.2 + color * 0.2`.
- Score labels:
  - 90 or above: `Strong reference`
  - 80-89: `Useful study`
  - 70-79: `Needs refinement`
  - Below 70: `Simplify first`
- Paintability analysis must not call OpenAI.

### Study Modes

- Original: draw the current source image to canvas with cover-crop behavior.
- Value: convert canvas pixels to grayscale and apply contrast adjustment based on Value Contrast range.
- Shape: render a low-resolution version of the source back to the canvas with image smoothing disabled, then lightly adjust tones.
- Contour: render the source into a half-size temporary canvas, compute edge magnitude from grayscale neighbors, and draw dark contours on white.
- Lighting overlay may still apply before study modes for low-key/dramatic, high-key/overcast, golden hour, and candlelight choices.
- Do not apply painting-style brushstroke overlays to the main generated reference photo.

### Variations Contract

- Keep variation infrastructure present but disabled with `ENABLE_VARIATIONS = false`.
- Variation cards:
  - `lighting`
  - `palette`
  - `background`
  - `composition`
- Disabled cards show state `Variations paused`.
- Clicking a variation while disabled sets status to `Variations are paused to save API usage.`
- When re-enabled later, each variation should use the main reference as `sourceImageDataUrl` and send one edit request.

### Save And Export Contract

- Saved references use browser `localStorage` key `reference-studio-saved`.
- Save at most 12 references.
- Saved item fields:
  - `id`
  - `title`
  - `style`
  - `subject`
  - `mode`
  - `prompt`
  - `thumb`
  - `settings`
- Thumbnail is generated from the current canvas as JPEG quality `0.72`, 360 pixels wide.
- Export Brief downloads JSON with:
  - `exportedAt`
  - `title`
  - `paintability`
  - `paintabilityBreakdown`
  - `settings`
  - `palette`
  - `prompt`

### Verification Contract

The rebuilt app should pass these checks:

- `python3 -B -m unittest discover -s tests -v`.
- Criteria generation sends exactly one request while variations are paused.
- Criteria prompt includes `Generate a realistic reference photograph`, includes `not a painting`, and excludes `painting-ready reference photo`.
- Empty Additional Requirements does not add the old default portrait text.
- Seascape guided mode includes Plein air, Tonalism, Golden surf study, Storm coast, Low-tide rocks, Storm-filtered light, Shoreline diagonal, and Breaking wave rhythm.
- Seascape guided mode excludes Decorative / Folk, Rembrandt portrait, Dramatic figure, and Candlelight.
- Generated-image palette replaces fallback palette.
- Generated-image paintability uses pixel analysis and produces a low score for a flat mock image.
- Upload tab can send two source photos with `uploadOperation: similar`, `sourceImageDataUrls.length === 2`, `size: auto`, and `inputFidelity: high`.
- Upload tab does not show controls for background removal, photo combination, change-part editing, exact removal, or cutout refinement.
- Backend multipart body uses `image[]` for multiple uploaded sources.
- API key status and late `.env` reload behavior work.

## Product Goal

Build a site artists can use to generate natural, paintable reference photos. The site should help artists create references with clear structure, compelling light, useful composition, and enough specificity to paint from without overwhelming them with irrelevant detail.

## What Makes A Good Painting Reference

A strong painting reference is not just a beautiful image. It should give the artist useful visual information.

- Clear subject or painting idea
- Strong value structure with readable light and shadow
- Useful form information, such as anatomy, planes, folds, objects, or perspective
- Intentional composition and crop
- Interesting edge variety
- Believable color temperature and palette
- Enough detail to support painting, but not so much that the image becomes noisy
- Room for artistic interpretation

## Main Generator Concept

The core workflow should be:

1. Choose what the artist wants to paint.
2. Choose the painting approach or style.
3. Adjust reference qualities like lighting, composition, detail, and mood.
4. Add custom requirements in a free-text box.
5. Generate a new natural reference photo for painting.
6. Optionally create study helpers such as value maps, palette extraction, and simplified shapes.

## Subject Types

These define what appears in the reference image.

- Portrait
- Figure
- Hand and foot study
- Still life
- Landscape
- Seascape
- Cityscape or architecture
- Animal
- Botanical or floral
- Costume and fabric study
- Object or prop study
- Vehicle or machine
- Interior scene
- Narrative or genre scene
- Fantasy or imaginative reference
- Lighting or value study
- Color study

## Painting Style Types

These define how the artist may want to interpret the reference.

- Traditional or classical
- Realism
- Impressionism
- Expressionism
- Abstract
- Contemporary
- Surrealism
- Minimalism
- Decorative or folk-inspired
- Plein air
- Tonalism
- Alla prima or painterly study

## Core Controls

The first version should include:

- Subject type
- Painting style
- Additional requirements text box
- Reference purpose: study, finished painting, composition exploration, color study, lighting study, anatomy study
- Generate button
- Result gallery

## Reference Controls

Useful controls for painters:

- Lighting direction: front, side, back, overhead, window light
- Lighting quality: soft, hard, diffused, candlelight, golden hour, overcast, studio light
- Mood: calm, dramatic, intimate, bright, melancholic, mysterious
- Composition: close-up, half-body, full-body, wide scene, centered, asymmetrical, spacious, tight crop
- Camera angle: eye level, low angle, high angle, top-down
- Detail level: simple, balanced, detailed
- Value contrast: low-key, soft, balanced, dramatic
- Color intensity: muted, natural, vivid, limited palette
- Background complexity: plain, suggested, detailed environment
- Pose dynamism: still, natural, dramatic, action
- Abstraction level: literal reference, semi-abstract, abstract structure

## Custom Requirements

The site should include a free-text field for specific artist instructions.

Suggested label:

**Additional Requirements**

Suggested placeholder:

> Example: elderly woman in profile, warm window light, simple dark background, hands visible, quiet mood.

This should be additive. Artists should be able to generate with only basic controls, but the custom box should let advanced users specify exact needs. In the implemented prototype, this field is empty by default and is only added to the prompt when the artist types into it.

## Quality Guardrails

The prompt system should automatically include requirements that make the output more useful for painters:

- Paintable lighting
- Clear value structure
- Accurate anatomy when people or animals are involved
- Coherent perspective
- No extra limbs or fingers
- No text, logos, or watermarks
- Avoid overly polished AI look
- Avoid unnecessary background clutter
- Maintain a useful subject silhouette

## Generated Output

Each generation should show:

- Primary reference image
- Prompt summary
- Download button
- Regenerate option
- Refine controls
- Optional variation set

## Artist Helper Modes

These can come after the first working generator:

- Black-and-white value study
- Simplified shape study
- Color palette extraction
- Edge or contour version
- Multiple composition thumbnails
- Lighting variations
- Crop variations

## Site Structure

The site should eventually include:

- Generator: main working area
- Gallery: saved/generated references
- Reference detail view: image, prompt, value study, palette, and download tools
- Starting Points: quick starters such as Rembrandt portrait, impressionist garden, minimal still life, dramatic figure study, and seascape studies

## Prompt Builder

The app should translate structured choices into a strong image prompt.

Example:

> Generate a realistic reference photograph for an artist to paint from: traditional portrait study. The image itself must look like a natural source photo, not a painting, illustration, sketch, concept art, render, or stylized artwork. Subject focus: elderly woman in profile, warm window light from the left, simple dark background, accurate facial anatomy, visible hands, quiet contemplative mood, clear value structure, no text or watermark.

The prompt builder should combine:

- Subject type
- Painting style
- Reference purpose
- Lighting settings
- Composition settings
- Mood
- Detail level
- Background complexity
- Custom requirements
- Quality guardrails

## MVP Build Phases

### Phase 1: Prototype UI

Build the main generator screen with form controls, sample results, and a clean artist-focused interface.

### Phase 2: Prompt System

Create the logic that turns artist choices into consistent image prompts.

### Phase 3: Image Generation Integration

Connect the generator to an image API and display real generated results.

### Phase 4: Refinement Tools

Add quick actions such as make simpler, increase contrast, change lighting, create variations, or simplify background.

### Phase 5: Painting Study Tools

Add value maps, palette extraction, simplified shape views, and edge studies.

### Phase 6: Save And Organize

Let artists save generated references into collections by project, subject, or painting type.

## Initial MVP Recommendation

Start with one strong flow:

> Choose subject -> choose painting style -> adjust reference qualities -> add custom requirements -> generate a natural reference photo.

For the first version, prioritize:

- Portrait
- Figure
- Still life
- Landscape
- Seascape
- Interior
- Animal
- Floral
- Lighting study

And prioritize these styles:

- Traditional
- Realism
- Impressionism
- Abstract
- Contemporary
- Expressionism
- Minimalism

## Open Questions

- Should users be able to upload their own rough sketch or photo as input?
- Should references be saved locally first, or should accounts and cloud galleries be included early?
- Should variations be re-enabled automatically later, or remain an explicit paid/action-heavy feature?
- How strict should subject-guided filtering be before the artist needs to use Show all options?
- Should the paintability score stay as a simple score, or become a more detailed teaching tool with suggestions?
- Should the next version support uploaded source photos, sketches, or mood boards as input?
