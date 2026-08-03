const SAMPLE_PORTRAIT = "assets/portrait-window-reference.png";
const SAMPLE_BOARD = "assets/reference-board.png";
const STORAGE_KEY = "reference-studio-saved";
const ENABLE_VARIATIONS = false;
const variationTypes = ["lighting", "palette", "background", "composition"];
const MAX_UPLOAD_PHOTOS = 6;
const UPLOAD_IMAGE_MAX_SIDE = 1536;

const uploadOperations = {
  similar: {
    label: "Similar reference",
    status: "Similar reference",
    title: "Generate a similar reference photo",
    prompt:
      "Generate a new realistic reference photograph inspired by the uploaded source photo or photos. Preserve the core subject type, camera feeling, lighting family, color temperature, and composition logic, but make it a fresh natural photo rather than a copy.",
    minimumPhotos: 1,
  },
};

const rangeLabels = {
  detailRange: ["Simplified shapes", "Balanced", "Rich detail"],
  contrastRange: ["Soft", "Balanced", "Dramatic"],
  backgroundRange: ["Plain", "Suggested", "Detailed"],
  abstractionRange: ["Literal", "Semi-abstract", "Abstract structure"],
};

const subjects = [
  {
    label: "Portrait",
    focus: "face planes, expression, hands, hair, and skin temperature",
    orientation: "portrait",
    crop: { source: "portrait" },
    defaultText: "elderly woman in profile, hands visible, simple dark background, ceramic cup, natural skin tones",
  },
  {
    label: "Figure",
    focus: "gesture, balance, anatomy, fabric folds, and readable silhouette",
    orientation: "portrait",
    crop: { source: "portrait", x: 0.06, y: 0.12, w: 0.88, h: 0.82 },
    defaultText: "standing figure in natural contrapposto, simple studio setting, readable gesture, fabric folds",
  },
  {
    label: "Hand and foot study",
    focus: "joint structure, overlap, foreshortening, and clean shadow shapes",
    orientation: "square",
    crop: { source: "portrait", x: 0.05, y: 0.68, w: 0.9, h: 0.28 },
    defaultText: "close study of hands holding a ceramic cup, accurate fingers, clear knuckles, useful cast shadows",
  },
  {
    label: "Still life",
    focus: "object relationships, cast shadows, fabric folds, and material edges",
    orientation: "square",
    crop: { source: "board", x: 0, y: 0, w: 0.5, h: 0.5 },
    defaultText: "pears in a ceramic bowl, folded cloth, quiet tabletop, clear cast shadows",
  },
  {
    label: "Landscape",
    focus: "big value masses, atmospheric depth, sky structure, and horizon placement",
    orientation: "landscape",
    crop: { source: "board", x: 0.5, y: 0, w: 0.5, h: 0.5 },
    defaultText: "open field, distant tree line, dramatic sky, atmospheric depth, paintable cloud shapes",
  },
  {
    label: "Seascape",
    focus: "wave rhythm, horizon control, reflective water, sky mass, and atmospheric distance",
    orientation: "landscape",
    crop: { source: "board", x: 0.5, y: 0, w: 0.5, h: 0.5 },
    defaultText: "rocky shoreline, readable wave shapes, distant horizon, atmospheric sky, wet sand reflections",
  },
  {
    label: "Cityscape",
    focus: "perspective, repeating shapes, windows, street planes, and scale cues",
    orientation: "landscape",
    crop: { source: "board", x: 0, y: 0.5, w: 0.5, h: 0.5 },
    defaultText: "quiet street corner, readable one-point perspective, storefront shapes, soft afternoon light",
  },
  {
    label: "Animal",
    focus: "animal anatomy, clear pose, fur texture, and readable silhouette",
    orientation: "landscape",
    crop: { source: "board", x: 0.5, y: 0, w: 0.5, h: 0.5 },
    defaultText: "resting animal pose, clear silhouette, natural anatomy, simple outdoor setting",
  },
  {
    label: "Botanical / floral",
    focus: "petal structure, leaf rhythm, transparent stems, and lost-and-found edges",
    orientation: "square",
    crop: { source: "board", x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    defaultText: "loose floral arrangement in a glass vase, varied petals and leaves, soft shadow shapes",
  },
  {
    label: "Costume and fabric",
    focus: "drapery folds, pattern scale, fabric weight, and gesture under cloth",
    orientation: "portrait",
    crop: { source: "portrait", x: 0.12, y: 0.26, w: 0.8, h: 0.62 },
    defaultText: "layered linen and wool costume, visible fold groups, simple pose, clear light direction",
  },
  {
    label: "Object / prop",
    focus: "planes, ellipses, material changes, reflections, and cast shadows",
    orientation: "square",
    crop: { source: "board", x: 0, y: 0, w: 0.5, h: 0.5 },
    defaultText: "ceramic vessel, metal tool, folded cloth, clean tabletop, useful cast shadows",
  },
  {
    label: "Vehicle / machine",
    focus: "large geometry, wheels, perspective, hard edges, and reflective forms",
    orientation: "landscape",
    crop: { source: "board", x: 0.5, y: 0, w: 0.5, h: 0.5 },
    defaultText: "vintage bicycle beside a workshop door, readable wheels, metal reflections, angled light",
  },
  {
    label: "Interior scene",
    focus: "room perspective, furniture scale, window light, and quiet object groupings",
    orientation: "landscape",
    crop: { source: "board", x: 0, y: 0.5, w: 0.5, h: 0.5 },
    defaultText: "quiet room corner, wooden chair, window light, books on a table, strong perspective",
  },
  {
    label: "Narrative scene",
    focus: "story gesture, figure-to-environment relationship, staging, and readable action",
    orientation: "landscape",
    crop: { source: "board", x: 0, y: 0.5, w: 0.5, h: 0.5 },
    defaultText: "person reading near a window, table objects, quiet story moment, clear staging",
  },
  {
    label: "Fantasy reference",
    focus: "invented subject structure, believable lighting, scale, and paintable design shapes",
    orientation: "landscape",
    crop: { source: "board", x: 0.5, y: 0, w: 0.5, h: 0.5 },
    defaultText: "mythic traveler on a ridge, believable costume, dramatic sky, simple readable silhouette",
  },
  {
    label: "Lighting study",
    focus: "clear light side, shadow side, cast shadows, and simple value families",
    orientation: "portrait",
    crop: { source: "portrait" },
    defaultText: "single subject near window light, clear light side and shadow side, simple background",
  },
  {
    label: "Color study",
    focus: "palette relationships, warm/cool shifts, value clarity, and color accents",
    orientation: "square",
    crop: { source: "board", x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    defaultText: "floral arrangement with muted neutrals, cool shadows, warm accents, strong color harmony",
  },
];

const styles = [
  {
    label: "Traditional",
    detail: "balanced realism, clear form planes, stable composition, and controlled light",
    paletteName: "Traditional warm neutrals",
    colors: ["#271f1b", "#6f513e", "#b98a63", "#d9c6a3", "#e7e4d6"],
  },
  {
    label: "Realism",
    detail: "observable materials, natural proportion, accurate light, and believable everyday specificity",
    paletteName: "Natural observation",
    colors: ["#1f2420", "#5e604f", "#907d61", "#c2aa87", "#e0d8c9"],
  },
  {
    label: "Impressionism",
    detail: "outdoor light, color temperature shifts, atmospheric softness, and large readable shapes",
    paletteName: "Broken outdoor light",
    colors: ["#3f6276", "#8aa0a1", "#c7b36f", "#d48a56", "#f0dfbd"],
  },
  {
    label: "Expressionism",
    detail: "heightened gesture, dramatic lighting, bolder color relationships, and emotional staging",
    paletteName: "Expressive heat",
    colors: ["#25202a", "#72405a", "#b84e35", "#e1a14f", "#ebe0cb"],
  },
  {
    label: "Abstract",
    detail: "shape rhythm, value masses, color relationships, texture cues, and compositional structure",
    paletteName: "Shape and rhythm",
    colors: ["#25252a", "#355f70", "#a44c3d", "#d4a24f", "#efeadf"],
  },
  {
    label: "Contemporary",
    detail: "modern cropping, confident negative space, unusual viewpoint, and visual tension",
    paletteName: "Contemporary muted contrast",
    colors: ["#1e2424", "#566b55", "#b36b49", "#d8cfbf", "#f6f4ef"],
  },
  {
    label: "Surrealism",
    detail: "dreamlike scale, symbolic object relationships, and believable photographic lighting",
    paletteName: "Dreamlike muted color",
    colors: ["#202337", "#4d6c76", "#8c6f9e", "#c38f62", "#e7dfcd"],
  },
  {
    label: "Minimalism",
    detail: "sparse forms, quiet negative space, restrained detail, and simplified value masses",
    paletteName: "Sparse tonal set",
    colors: ["#22211e", "#7d8075", "#c6c0b4", "#ece8df", "#ffffff"],
  },
  {
    label: "Decorative / Folk",
    detail: "strong patterns, symbolic color relationships, front-facing shapes, and decorative rhythms",
    paletteName: "Decorative pattern color",
    colors: ["#203b3a", "#7c3f35", "#c58c3a", "#d9c66a", "#f5efe0"],
  },
  {
    label: "Plein air",
    detail: "natural atmosphere, readable outdoor masses, changing light, and clear weather cues",
    paletteName: "Outdoor atmosphere",
    colors: ["#304e42", "#6d885f", "#b3a660", "#d3b27d", "#e9e0cb"],
  },
  {
    label: "Tonalism",
    detail: "soft edges, muted color, atmospheric value shifts, and close-value harmony",
    paletteName: "Muted tonal atmosphere",
    colors: ["#242826", "#4d5b55", "#6f7464", "#9f9579", "#d3c7ad"],
  },
  {
    label: "Alla prima",
    detail: "decisive light shapes, simplified planes, strong shadow design, and broad masses",
    paletteName: "Painterly direct color",
    colors: ["#29231e", "#6e4434", "#a46b45", "#c9a262", "#efe1c7"],
  },
];

const presets = [
  {
    name: "Rembrandt portrait",
    meta: "Traditional portrait, low-key light",
    settings: {
      subject: "Portrait",
      style: "Traditional",
      purpose: "Finished painting",
      lighting: "Low-key chiaroscuro",
      mood: "Quiet and contemplative",
      composition: "Three-quarter crop",
      camera: "Three-quarter view",
      color: "Earth pigments",
      pose: "Still and natural",
      detail: 1,
      contrast: 2,
      background: 0,
      abstraction: 0,
      requirements: "elderly sitter in three-quarter profile, visible hands, dark simple ground, warm skin lights",
    },
  },
  {
    name: "Impressionist field",
    meta: "Landscape, broken color",
    settings: {
      subject: "Landscape",
      style: "Impressionism",
      purpose: "Color study",
      lighting: "Golden hour backlight",
      mood: "Bright",
      composition: "Wide scene",
      camera: "Eye level",
      color: "Cool shadows with warm lights",
      pose: "Still and natural",
      detail: 1,
      contrast: 1,
      background: 2,
      abstraction: 1,
      requirements: "open field, tree line, moving cloud shapes, warm evening light, visible atmosphere",
    },
  },
  {
    name: "Golden surf study",
    meta: "Seascape, warm backlight",
    settings: {
      subject: "Seascape",
      style: "Plein air",
      purpose: "Color study",
      lighting: "Golden hour backlight",
      mood: "Bright",
      composition: "Wide scene",
      camera: "Eye level",
      color: "Cool shadows with warm lights",
      pose: "Breaking wave rhythm",
      detail: 1,
      contrast: 1,
      background: 2,
      abstraction: 0,
      requirements: "rolling surf at golden hour, low horizon, warm sky reflections, readable foam shapes",
    },
  },
  {
    name: "Storm coast",
    meta: "Seascape, tonal atmosphere",
    settings: {
      subject: "Seascape",
      style: "Tonalism",
      purpose: "Finished painting",
      lighting: "Storm-filtered light",
      mood: "Dramatic",
      composition: "Shoreline diagonal",
      camera: "Low angle",
      color: "Natural muted color",
      pose: "Wind-driven motion",
      detail: 1,
      contrast: 2,
      background: 2,
      abstraction: 0,
      requirements: "dark coastal rocks, incoming storm clouds, strong wave masses, misty distance",
    },
  },
  {
    name: "Low-tide rocks",
    meta: "Seascape, reflective flats",
    settings: {
      subject: "Seascape",
      style: "Realism",
      purpose: "Study",
      lighting: "Overcast diffused light",
      mood: "Calm",
      composition: "Spacious negative space",
      camera: "High angle",
      color: "Natural muted color",
      pose: "Calm water movement",
      detail: 2,
      contrast: 1,
      background: 1,
      abstraction: 0,
      requirements: "tidal pools, wet rocks, reflected sky, subtle ripples, clear foreground shapes",
    },
  },
  {
    name: "Minimal still life",
    meta: "Object study, quiet values",
    settings: {
      subject: "Still life",
      style: "Minimalism",
      purpose: "Study",
      lighting: "Soft north-light studio",
      mood: "Calm",
      composition: "Spacious negative space",
      camera: "Eye level",
      color: "Natural muted color",
      pose: "Object-focused arrangement",
      detail: 0,
      contrast: 1,
      background: 0,
      abstraction: 0,
      requirements: "one ceramic bowl, two pears, folded linen, clean tabletop, spacious quiet composition",
    },
  },
  {
    name: "Dramatic figure",
    meta: "Figure, strong gesture",
    settings: {
      subject: "Figure",
      style: "Expressionism",
      purpose: "Anatomy study",
      lighting: "Dramatic side light",
      mood: "Dramatic",
      composition: "Full-body",
      camera: "Low angle",
      color: "High chroma accents",
      pose: "Dynamic action",
      detail: 1,
      contrast: 2,
      background: 0,
      abstraction: 1,
      requirements: "full figure with clear gesture, extended arm, readable weight shift, simple studio floor",
    },
  },
  {
    name: "Tonal interior",
    meta: "Room light, muted atmosphere",
    settings: {
      subject: "Interior scene",
      style: "Tonalism",
      purpose: "Finished painting",
      lighting: "Overcast diffused light",
      mood: "Melancholic",
      composition: "Asymmetrical crop",
      camera: "Eye level",
      color: "Limited warm palette",
      pose: "Still and natural",
      detail: 1,
      contrast: 0,
      background: 2,
      abstraction: 0,
      requirements: "empty chair near a window, books on a side table, soft gray-green atmosphere",
    },
  },
  {
    name: "Abstract color map",
    meta: "Shape rhythm, palette study",
    settings: {
      subject: "Color study",
      style: "Abstract",
      purpose: "Composition exploration",
      lighting: "High-key studio light",
      mood: "Energetic",
      composition: "Tight observational crop",
      camera: "Top-down",
      color: "Complementary contrast",
      pose: "Object-focused arrangement",
      detail: 0,
      contrast: 2,
      background: 0,
      abstraction: 2,
      requirements: "floral shapes reduced into large value masses, complementary accents, strong shape rhythm",
    },
  },
];

const optionCatalog = {
  purpose: [
    "Finished painting",
    "Study",
    "Composition exploration",
    "Color study",
    "Lighting study",
    "Anatomy study",
  ],
  lighting: [
    "Warm window light from the left",
    "Dramatic side light",
    "Soft north-light studio",
    "Golden hour backlight",
    "Overcast diffused light",
    "Candlelight",
    "High-key studio light",
    "Low-key chiaroscuro",
    "Clear midday coastal light",
    "Storm-filtered light",
    "Reflected water light",
  ],
  mood: ["Quiet and contemplative", "Calm", "Dramatic", "Intimate", "Bright", "Melancholic", "Mysterious", "Energetic"],
  composition: [
    "Three-quarter crop",
    "Close-up",
    "Half-body",
    "Full-body",
    "Wide scene",
    "Asymmetrical crop",
    "Spacious negative space",
    "Tight observational crop",
    "Low horizon",
    "High horizon",
    "Shoreline diagonal",
  ],
  camera: ["Eye level", "Low angle", "High angle", "Top-down", "Three-quarter view", "Profile view", "Waterline low angle"],
  color: [
    "Natural muted color",
    "Limited warm palette",
    "Cool shadows with warm lights",
    "High chroma accents",
    "Earth pigments",
    "Complementary contrast",
    "Sea greens and muted violets",
  ],
  pose: [
    "Still and natural",
    "Gentle gesture",
    "Dynamic action",
    "Resting pose",
    "Contrapposto",
    "Object-focused arrangement",
    "Breaking wave rhythm",
    "Calm water movement",
    "Wind-driven motion",
    "Atmospheric movement",
  ],
};

const defaultSubjectProfile = {
  styles: ["Traditional", "Realism", "Contemporary", "Tonalism", "Alla prima"],
  purpose: ["Finished painting", "Study", "Composition exploration", "Color study", "Lighting study"],
  lighting: ["Warm window light from the left", "Dramatic side light", "Soft north-light studio", "Overcast diffused light"],
  mood: ["Quiet and contemplative", "Calm", "Dramatic", "Melancholic"],
  composition: ["Three-quarter crop", "Close-up", "Asymmetrical crop", "Spacious negative space", "Tight observational crop"],
  camera: ["Eye level", "Low angle", "High angle", "Three-quarter view"],
  color: ["Natural muted color", "Limited warm palette", "Cool shadows with warm lights", "Earth pigments"],
  pose: ["Still and natural", "Gentle gesture", "Object-focused arrangement"],
  defaults: {
    style: "Realism",
    purpose: "Study",
    lighting: "Overcast diffused light",
    mood: "Calm",
    composition: "Asymmetrical crop",
    camera: "Eye level",
    color: "Natural muted color",
    pose: "Still and natural",
  },
};

const subjectProfiles = {
  Portrait: {
    styles: ["Traditional", "Realism", "Contemporary", "Tonalism", "Alla prima", "Expressionism", "Minimalism"],
    purpose: ["Finished painting", "Study", "Lighting study", "Color study"],
    lighting: ["Warm window light from the left", "Dramatic side light", "Soft north-light studio", "Low-key chiaroscuro", "High-key studio light"],
    mood: ["Quiet and contemplative", "Calm", "Dramatic", "Intimate", "Melancholic", "Mysterious"],
    composition: ["Three-quarter crop", "Close-up", "Half-body", "Asymmetrical crop", "Spacious negative space"],
    camera: ["Eye level", "Three-quarter view", "Profile view", "Low angle", "High angle"],
    color: ["Natural muted color", "Limited warm palette", "Cool shadows with warm lights", "Earth pigments"],
    pose: ["Still and natural", "Gentle gesture", "Resting pose"],
    defaults: { style: "Traditional", purpose: "Finished painting", lighting: "Warm window light from the left", mood: "Quiet and contemplative", composition: "Three-quarter crop", camera: "Eye level", color: "Natural muted color", pose: "Still and natural" },
  },
  Figure: {
    styles: ["Traditional", "Realism", "Contemporary", "Expressionism", "Alla prima"],
    purpose: ["Finished painting", "Study", "Anatomy study", "Lighting study"],
    lighting: ["Dramatic side light", "Soft north-light studio", "Warm window light from the left", "High-key studio light", "Low-key chiaroscuro"],
    mood: ["Calm", "Dramatic", "Energetic", "Intimate"],
    composition: ["Full-body", "Half-body", "Three-quarter crop", "Asymmetrical crop"],
    camera: ["Eye level", "Low angle", "High angle", "Three-quarter view"],
    color: ["Natural muted color", "High chroma accents", "Cool shadows with warm lights", "Earth pigments"],
    pose: ["Still and natural", "Gentle gesture", "Dynamic action", "Contrapposto", "Resting pose"],
    defaults: { style: "Realism", purpose: "Anatomy study", lighting: "Dramatic side light", mood: "Dramatic", composition: "Full-body", camera: "Eye level", color: "Natural muted color", pose: "Contrapposto" },
  },
  "Hand and foot study": {
    styles: ["Traditional", "Realism", "Alla prima", "Minimalism"],
    purpose: ["Study", "Anatomy study", "Lighting study"],
    lighting: ["Soft north-light studio", "Warm window light from the left", "Dramatic side light", "High-key studio light"],
    mood: ["Calm", "Quiet and contemplative", "Intimate"],
    composition: ["Close-up", "Tight observational crop", "Asymmetrical crop"],
    camera: ["Eye level", "Top-down", "Three-quarter view"],
    color: ["Natural muted color", "Limited warm palette", "Earth pigments"],
    pose: ["Still and natural", "Gentle gesture", "Resting pose"],
    defaults: { style: "Realism", purpose: "Anatomy study", lighting: "Soft north-light studio", mood: "Calm", composition: "Close-up", camera: "Three-quarter view", color: "Natural muted color", pose: "Still and natural" },
  },
  "Still life": {
    styles: ["Traditional", "Realism", "Contemporary", "Minimalism", "Alla prima", "Decorative / Folk", "Tonalism"],
    purpose: ["Finished painting", "Study", "Composition exploration", "Color study", "Lighting study"],
    lighting: ["Soft north-light studio", "Warm window light from the left", "Dramatic side light", "High-key studio light", "Low-key chiaroscuro"],
    mood: ["Calm", "Quiet and contemplative", "Dramatic", "Intimate"],
    composition: ["Close-up", "Tight observational crop", "Spacious negative space", "Asymmetrical crop", "Three-quarter crop"],
    camera: ["Eye level", "Top-down", "Three-quarter view", "High angle"],
    color: ["Natural muted color", "Limited warm palette", "Cool shadows with warm lights", "Earth pigments", "Complementary contrast"],
    pose: ["Object-focused arrangement", "Still and natural"],
    defaults: { style: "Realism", purpose: "Study", lighting: "Soft north-light studio", mood: "Calm", composition: "Tight observational crop", camera: "Eye level", color: "Natural muted color", pose: "Object-focused arrangement" },
  },
  Landscape: {
    styles: ["Traditional", "Realism", "Impressionism", "Contemporary", "Plein air", "Tonalism", "Abstract"],
    purpose: ["Finished painting", "Study", "Composition exploration", "Color study", "Lighting study"],
    lighting: ["Golden hour backlight", "Overcast diffused light", "Dramatic side light", "High-key studio light", "Storm-filtered light"],
    mood: ["Calm", "Dramatic", "Bright", "Melancholic", "Mysterious"],
    composition: ["Wide scene", "Low horizon", "High horizon", "Asymmetrical crop", "Spacious negative space"],
    camera: ["Eye level", "Low angle", "High angle"],
    color: ["Natural muted color", "Cool shadows with warm lights", "Limited warm palette", "Complementary contrast"],
    pose: ["Still and natural", "Atmospheric movement"],
    defaults: { style: "Plein air", purpose: "Color study", lighting: "Golden hour backlight", mood: "Bright", composition: "Wide scene", camera: "Eye level", color: "Cool shadows with warm lights", pose: "Atmospheric movement" },
  },
  Seascape: {
    styles: ["Traditional", "Realism", "Impressionism", "Contemporary", "Plein air", "Tonalism", "Abstract"],
    purpose: ["Finished painting", "Study", "Composition exploration", "Color study", "Lighting study"],
    lighting: ["Golden hour backlight", "Overcast diffused light", "Dramatic side light", "Clear midday coastal light", "Storm-filtered light", "Reflected water light"],
    mood: ["Calm", "Dramatic", "Bright", "Melancholic", "Mysterious"],
    composition: ["Wide scene", "Low horizon", "High horizon", "Shoreline diagonal", "Asymmetrical crop", "Spacious negative space"],
    camera: ["Eye level", "Low angle", "High angle", "Waterline low angle"],
    color: ["Natural muted color", "Cool shadows with warm lights", "Sea greens and muted violets", "Limited warm palette", "Complementary contrast"],
    pose: ["Breaking wave rhythm", "Calm water movement", "Wind-driven motion", "Atmospheric movement", "Still and natural"],
    defaults: { style: "Plein air", purpose: "Color study", lighting: "Golden hour backlight", mood: "Bright", composition: "Wide scene", camera: "Eye level", color: "Cool shadows with warm lights", pose: "Breaking wave rhythm" },
  },
  Cityscape: {
    styles: ["Traditional", "Realism", "Impressionism", "Contemporary", "Tonalism", "Minimalism"],
    purpose: ["Finished painting", "Study", "Composition exploration", "Lighting study"],
    lighting: ["Golden hour backlight", "Overcast diffused light", "Dramatic side light", "High-key studio light"],
    mood: ["Calm", "Dramatic", "Bright", "Melancholic", "Mysterious"],
    composition: ["Wide scene", "Asymmetrical crop", "Spacious negative space", "Tight observational crop"],
    camera: ["Eye level", "Low angle", "High angle"],
    color: ["Natural muted color", "Cool shadows with warm lights", "Limited warm palette", "Complementary contrast"],
    pose: ["Still and natural", "Atmospheric movement"],
    defaults: { style: "Contemporary", purpose: "Composition exploration", lighting: "Overcast diffused light", mood: "Calm", composition: "Asymmetrical crop", camera: "Eye level", color: "Natural muted color", pose: "Still and natural" },
  },
  Animal: {
    styles: ["Traditional", "Realism", "Contemporary", "Alla prima", "Tonalism"],
    purpose: ["Finished painting", "Study", "Lighting study"],
    lighting: ["Overcast diffused light", "Golden hour backlight", "Dramatic side light", "Soft north-light studio"],
    mood: ["Calm", "Dramatic", "Bright", "Intimate"],
    composition: ["Wide scene", "Close-up", "Three-quarter crop", "Asymmetrical crop"],
    camera: ["Eye level", "Low angle", "Three-quarter view"],
    color: ["Natural muted color", "Cool shadows with warm lights", "Earth pigments"],
    pose: ["Resting pose", "Gentle gesture", "Dynamic action", "Still and natural"],
    defaults: { style: "Realism", purpose: "Study", lighting: "Overcast diffused light", mood: "Calm", composition: "Three-quarter crop", camera: "Eye level", color: "Natural muted color", pose: "Resting pose" },
  },
  "Botanical / floral": {
    styles: ["Traditional", "Realism", "Impressionism", "Contemporary", "Decorative / Folk", "Minimalism", "Alla prima"],
    purpose: ["Finished painting", "Study", "Color study", "Composition exploration"],
    lighting: ["Soft north-light studio", "Warm window light from the left", "High-key studio light", "Overcast diffused light"],
    mood: ["Calm", "Bright", "Intimate", "Energetic"],
    composition: ["Close-up", "Tight observational crop", "Spacious negative space", "Asymmetrical crop"],
    camera: ["Eye level", "Top-down", "High angle"],
    color: ["Natural muted color", "Complementary contrast", "High chroma accents", "Limited warm palette"],
    pose: ["Object-focused arrangement", "Still and natural", "Gentle gesture"],
    defaults: { style: "Impressionism", purpose: "Color study", lighting: "Soft north-light studio", mood: "Bright", composition: "Tight observational crop", camera: "Eye level", color: "Complementary contrast", pose: "Object-focused arrangement" },
  },
  "Costume and fabric": {
    styles: ["Traditional", "Realism", "Contemporary", "Decorative / Folk", "Alla prima"],
    purpose: ["Finished painting", "Study", "Composition exploration"],
    lighting: ["Warm window light from the left", "Soft north-light studio", "Dramatic side light", "High-key studio light"],
    mood: ["Quiet and contemplative", "Calm", "Dramatic", "Intimate"],
    composition: ["Half-body", "Three-quarter crop", "Full-body", "Tight observational crop"],
    camera: ["Eye level", "Three-quarter view", "Profile view"],
    color: ["Natural muted color", "Limited warm palette", "High chroma accents", "Earth pigments"],
    pose: ["Still and natural", "Gentle gesture", "Contrapposto"],
    defaults: { style: "Traditional", purpose: "Study", lighting: "Warm window light from the left", mood: "Quiet and contemplative", composition: "Half-body", camera: "Three-quarter view", color: "Natural muted color", pose: "Still and natural" },
  },
  "Object / prop": {
    styles: ["Traditional", "Realism", "Contemporary", "Minimalism", "Alla prima"],
    purpose: ["Study", "Finished painting", "Lighting study", "Composition exploration"],
    lighting: ["Soft north-light studio", "Warm window light from the left", "Dramatic side light", "High-key studio light"],
    mood: ["Calm", "Quiet and contemplative", "Dramatic"],
    composition: ["Close-up", "Tight observational crop", "Spacious negative space", "Asymmetrical crop"],
    camera: ["Eye level", "Top-down", "Three-quarter view", "High angle"],
    color: ["Natural muted color", "Limited warm palette", "Earth pigments", "Cool shadows with warm lights"],
    pose: ["Object-focused arrangement", "Still and natural"],
    defaults: { style: "Realism", purpose: "Study", lighting: "Soft north-light studio", mood: "Calm", composition: "Tight observational crop", camera: "Eye level", color: "Natural muted color", pose: "Object-focused arrangement" },
  },
  "Vehicle / machine": {
    styles: ["Traditional", "Realism", "Contemporary", "Tonalism", "Alla prima"],
    purpose: ["Finished painting", "Study", "Composition exploration"],
    lighting: ["Overcast diffused light", "Dramatic side light", "Golden hour backlight", "High-key studio light"],
    mood: ["Calm", "Dramatic", "Bright", "Melancholic"],
    composition: ["Wide scene", "Three-quarter crop", "Asymmetrical crop", "Tight observational crop"],
    camera: ["Eye level", "Low angle", "Three-quarter view", "High angle"],
    color: ["Natural muted color", "Cool shadows with warm lights", "Earth pigments", "Limited warm palette"],
    pose: ["Still and natural", "Object-focused arrangement"],
    defaults: { style: "Realism", purpose: "Study", lighting: "Overcast diffused light", mood: "Calm", composition: "Three-quarter crop", camera: "Three-quarter view", color: "Natural muted color", pose: "Object-focused arrangement" },
  },
  "Interior scene": {
    styles: ["Traditional", "Realism", "Contemporary", "Tonalism", "Minimalism"],
    purpose: ["Finished painting", "Study", "Composition exploration", "Lighting study"],
    lighting: ["Warm window light from the left", "Overcast diffused light", "Dramatic side light", "Low-key chiaroscuro"],
    mood: ["Quiet and contemplative", "Calm", "Melancholic", "Mysterious", "Intimate"],
    composition: ["Wide scene", "Asymmetrical crop", "Spacious negative space", "Tight observational crop"],
    camera: ["Eye level", "High angle", "Low angle"],
    color: ["Natural muted color", "Limited warm palette", "Cool shadows with warm lights", "Earth pigments"],
    pose: ["Still and natural", "Object-focused arrangement"],
    defaults: { style: "Tonalism", purpose: "Finished painting", lighting: "Overcast diffused light", mood: "Melancholic", composition: "Asymmetrical crop", camera: "Eye level", color: "Limited warm palette", pose: "Still and natural" },
  },
  "Narrative scene": {
    styles: ["Traditional", "Realism", "Contemporary", "Expressionism", "Tonalism"],
    purpose: ["Finished painting", "Composition exploration", "Lighting study"],
    lighting: ["Warm window light from the left", "Dramatic side light", "Golden hour backlight", "Low-key chiaroscuro"],
    mood: ["Quiet and contemplative", "Dramatic", "Intimate", "Mysterious", "Melancholic"],
    composition: ["Wide scene", "Three-quarter crop", "Asymmetrical crop", "Spacious negative space"],
    camera: ["Eye level", "Low angle", "High angle", "Three-quarter view"],
    color: ["Natural muted color", "Limited warm palette", "Cool shadows with warm lights", "Earth pigments"],
    pose: ["Gentle gesture", "Still and natural", "Dynamic action"],
    defaults: { style: "Realism", purpose: "Finished painting", lighting: "Warm window light from the left", mood: "Quiet and contemplative", composition: "Wide scene", camera: "Eye level", color: "Natural muted color", pose: "Gentle gesture" },
  },
  "Fantasy reference": {
    styles: ["Traditional", "Realism", "Contemporary", "Surrealism", "Expressionism", "Tonalism"],
    purpose: ["Finished painting", "Composition exploration", "Lighting study"],
    lighting: ["Golden hour backlight", "Dramatic side light", "Storm-filtered light", "Low-key chiaroscuro"],
    mood: ["Dramatic", "Mysterious", "Melancholic", "Energetic"],
    composition: ["Wide scene", "Low horizon", "Asymmetrical crop", "Spacious negative space"],
    camera: ["Eye level", "Low angle", "High angle"],
    color: ["Natural muted color", "Cool shadows with warm lights", "High chroma accents", "Complementary contrast"],
    pose: ["Still and natural", "Gentle gesture", "Dynamic action", "Atmospheric movement"],
    defaults: { style: "Surrealism", purpose: "Composition exploration", lighting: "Dramatic side light", mood: "Mysterious", composition: "Wide scene", camera: "Low angle", color: "Cool shadows with warm lights", pose: "Still and natural" },
  },
  "Lighting study": {
    styles: ["Traditional", "Realism", "Tonalism", "Alla prima", "Minimalism"],
    purpose: ["Lighting study", "Study", "Finished painting"],
    lighting: ["Dramatic side light", "Low-key chiaroscuro", "Warm window light from the left", "High-key studio light", "Soft north-light studio"],
    mood: ["Quiet and contemplative", "Calm", "Dramatic", "Mysterious"],
    composition: ["Three-quarter crop", "Close-up", "Tight observational crop", "Spacious negative space"],
    camera: ["Eye level", "Three-quarter view", "Profile view"],
    color: ["Natural muted color", "Limited warm palette", "Earth pigments"],
    pose: ["Still and natural", "Resting pose", "Object-focused arrangement"],
    defaults: { style: "Traditional", purpose: "Lighting study", lighting: "Dramatic side light", mood: "Quiet and contemplative", composition: "Three-quarter crop", camera: "Eye level", color: "Natural muted color", pose: "Still and natural" },
  },
  "Color study": {
    styles: ["Realism", "Impressionism", "Contemporary", "Abstract", "Decorative / Folk", "Minimalism"],
    purpose: ["Color study", "Composition exploration", "Study"],
    lighting: ["High-key studio light", "Soft north-light studio", "Golden hour backlight", "Overcast diffused light"],
    mood: ["Bright", "Calm", "Energetic", "Intimate"],
    composition: ["Tight observational crop", "Close-up", "Spacious negative space", "Asymmetrical crop"],
    camera: ["Top-down", "Eye level", "High angle"],
    color: ["Complementary contrast", "High chroma accents", "Cool shadows with warm lights", "Natural muted color"],
    pose: ["Object-focused arrangement", "Still and natural", "Atmospheric movement"],
    defaults: { style: "Abstract", purpose: "Color study", lighting: "High-key studio light", mood: "Energetic", composition: "Tight observational crop", camera: "Top-down", color: "Complementary contrast", pose: "Object-focused arrangement" },
  },
};

const byLabel = (items) => Object.fromEntries(items.map((item) => [item.label, item]));
const subjectMap = byLabel(subjects);
const styleMap = byLabel(styles);

const form = document.querySelector("#generatorForm");
const canvas = document.querySelector("#studyCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const elements = {
  subjectGrid: document.querySelector("#subjectGrid"),
  styleGrid: document.querySelector("#styleGrid"),
  presetGrid: document.querySelector("#presetGrid"),
  subjectCount: document.querySelector("#subjectCount"),
  styleCount: document.querySelector("#styleCount"),
  presetCount: document.querySelector("#presetCount"),
  showAllOptions: document.querySelector("#showAllOptionsToggle"),
  compatibilityStatus: document.querySelector("#compatibilityStatus"),
  title: document.querySelector("#resultTitle"),
  prompt: document.querySelector("#promptOutput"),
  modeBadge: document.querySelector("#modeBadge"),
  generationStatus: document.querySelector("#generationStatus"),
  generationNotice: document.querySelector("#generateNotice"),
  paletteName: document.querySelector("#paletteName"),
  paletteSwatches: document.querySelector("#paletteSwatches"),
  paintabilityScore: document.querySelector("#paintabilityScore"),
  scoreLabel: document.querySelector("#scoreLabel"),
  scoreRows: Array.from(document.querySelectorAll("[data-paintability-row]")),
  briefList: document.querySelector("#briefList"),
  lightMetric: document.querySelector("#lightMetric"),
  valueMetric: document.querySelector("#valueMetric"),
  detailMetric: document.querySelector("#detailMetric"),
  colorMetric: document.querySelector("#colorMetric"),
  cameraMetric: document.querySelector("#cameraMetric"),
  moodMetric: document.querySelector("#moodMetric"),
  requirements: document.querySelector("#requirementsInput"),
  purpose: document.querySelector("#purposeSelect"),
  lighting: document.querySelector("#lightingSelect"),
  mood: document.querySelector("#moodSelect"),
  composition: document.querySelector("#compositionSelect"),
  camera: document.querySelector("#cameraSelect"),
  color: document.querySelector("#colorSelect"),
  pose: document.querySelector("#poseSelect"),
  saveButton: document.querySelector("#saveButton"),
  downloadButton: document.querySelector("#downloadButton"),
  exportButton: document.querySelector("#exportButton"),
  copyPromptButton: document.querySelector("#copyPromptButton"),
  shuffleButton: document.querySelector("#shuffleButton"),
  resetButton: document.querySelector("#resetButton"),
  clearSavedButton: document.querySelector("#clearSavedButton"),
  savedGrid: document.querySelector("#savedGrid"),
  workflowTabs: Array.from(document.querySelectorAll("[data-workflow-tab]")),
  workflowViews: Array.from(document.querySelectorAll("[data-workflow-view]")),
  uploadForm: document.querySelector("#uploadForm"),
  photoUploadInput: document.querySelector("#photoUploadInput"),
  uploadPhotoGrid: document.querySelector("#uploadPhotoGrid"),
  uploadLargeGrid: document.querySelector("#uploadLargeGrid"),
  uploadCount: document.querySelector("#uploadCount"),
  uploadSourceSummary: document.querySelector("#uploadSourceSummary"),
  uploadSize: document.querySelector("#uploadSizeSelect"),
  uploadFidelity: document.querySelector("#uploadFidelitySelect"),
  uploadRequirements: document.querySelector("#uploadRequirementsInput"),
  uploadGenerateButton: document.querySelector("#uploadGenerateButton"),
  uploadNotice: document.querySelector("#uploadNotice"),
  uploadResultTitle: document.querySelector("#uploadResultTitle"),
  uploadResultImage: document.querySelector("#uploadResultImage"),
  uploadPrompt: document.querySelector("#uploadPromptOutput"),
  copyUploadPromptButton: document.querySelector("#copyUploadPromptButton"),
  downloadUploadButton: document.querySelector("#downloadUploadButton"),
  useUploadResultButton: document.querySelector("#useUploadResultButton"),
  clearUploadButton: document.querySelector("#clearUploadButton"),
};

const images = {
  portrait: new Image(),
  board: new Image(),
  generated: new Image(),
};

const state = {
  workflow: "generator",
  mode: "original",
  activePreset: "",
  generation: 0,
  activeGenerationRequest: 0,
  isGenerating: false,
  isGeneratingVariations: false,
  variationBatch: 0,
  loadingVariationType: "",
  variationErrors: {},
  showAllOptions: false,
  generatedImageReady: false,
  generatedMeta: null,
  mainReferenceMeta: null,
  activeVariation: "",
  variations: {},
  imagePalette: null,
  paintabilityAnalysis: null,
  selected: {
    subject: "Portrait",
    style: "Traditional",
  },
  upload: {
    operation: "similar",
    photos: [],
    result: null,
    isGenerating: false,
    generation: 0,
  },
  saved: loadSaved(),
};

renderChoices();
bindEvents();
updateUploadWorkspace();

images.portrait.onload = renderCanvas;
images.board.onload = renderCanvas;
images.generated.onload = () => {
  state.generatedImageReady = true;
  updatePaletteFromGeneratedImage();
  updatePaintabilityFromGeneratedImage();
  updateVariationCards();
  renderCanvas();
};
images.generated.onerror = () => {
  state.generatedImageReady = false;
  state.imagePalette = null;
  state.paintabilityAnalysis = null;
  updatePalette();
  updatePaintability();
  setGenerationStatus("Generated image could not be loaded");
  renderCanvas();
};
images.portrait.src = SAMPLE_PORTRAIT;
images.board.src = SAMPLE_BOARD;

updateFromState();
renderSaved();

function renderChoices() {
  elements.subjectCount.textContent = `${subjects.length} types`;
  renderChoiceButtons(elements.subjectGrid, subjects, state.selected.subject);
  renderGuidedChoices();
}

function renderGuidedChoices() {
  const availableStyles = getAvailableStyles();
  const availablePresets = getAvailablePresets();

  elements.showAllOptions.checked = state.showAllOptions;
  syncGuidedSelections(availableStyles);
  syncSelectOptions(elements.purpose, getAvailableValues("purpose"), getSubjectProfile().defaults.purpose);
  syncSelectOptions(elements.lighting, getAvailableValues("lighting"), getSubjectProfile().defaults.lighting);
  syncSelectOptions(elements.mood, getAvailableValues("mood"), getSubjectProfile().defaults.mood);
  syncSelectOptions(elements.composition, getAvailableValues("composition"), getSubjectProfile().defaults.composition);
  syncSelectOptions(elements.camera, getAvailableValues("camera"), getSubjectProfile().defaults.camera);
  syncSelectOptions(elements.color, getAvailableValues("color"), getSubjectProfile().defaults.color);
  syncSelectOptions(elements.pose, getAvailableValues("pose"), getSubjectProfile().defaults.pose);

  renderChoiceButtons(elements.styleGrid, availableStyles, state.selected.style);
  renderPresetButtons(availablePresets);
  updateCompatibilityStatus(availableStyles.length, availablePresets.length);
}

function renderPresetButtons(availablePresets) {
  elements.presetGrid.innerHTML = "";

  if (!availablePresets.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No starting points for this subject yet";
    elements.presetGrid.append(empty);
    elements.presetCount.textContent = "0 starting points";
    return;
  }

  availablePresets.forEach((preset) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "preset-button";
    button.dataset.preset = preset.name;
    button.innerHTML = `<span>${escapeHtml(preset.name)}</span><small>${escapeHtml(preset.meta)}</small>`;
    elements.presetGrid.append(button);
  });

  elements.presetCount.textContent = state.showAllOptions
    ? `${availablePresets.length} starting points`
    : `${availablePresets.length} recommended`;
}

function renderChoiceButtons(container, items, activeValue) {
  container.innerHTML = "";
  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `choice-button${item.label === activeValue ? " is-active" : ""}`;
    button.dataset.value = item.label;
    button.textContent = item.label;
    container.append(button);
  });
}

function getSubjectProfile() {
  return mergeProfile(defaultSubjectProfile, subjectProfiles[state.selected.subject] || {});
}

function mergeProfile(baseProfile, overrideProfile) {
  return {
    ...baseProfile,
    ...overrideProfile,
    defaults: {
      ...baseProfile.defaults,
      ...(overrideProfile.defaults || {}),
    },
  };
}

function getAvailableStyles() {
  if (state.showAllOptions) return styles;
  const allowed = new Set(getSubjectProfile().styles);
  return styles.filter((style) => allowed.has(style.label));
}

function getAvailablePresets() {
  if (state.showAllOptions) return presets;
  return presets.filter((preset) => preset.settings.subject === state.selected.subject);
}

function getAvailableValues(key) {
  if (state.showAllOptions) return optionCatalog[key];
  return getSubjectProfile()[key] || optionCatalog[key];
}

function syncGuidedSelections(availableStyles) {
  if (!availableStyles.some((style) => style.label === state.selected.style)) {
    state.selected.style = preferredValue(
      availableStyles.map((style) => style.label),
      getSubjectProfile().defaults.style,
    );
  }
}

function syncSelectOptions(select, values, preferred) {
  const currentValue = select.value;
  const nextValue = values.includes(currentValue) ? currentValue : preferredValue(values, preferred);
  select.innerHTML = "";

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });

  select.value = nextValue;
}

function preferredValue(values, preferred) {
  if (preferred && values.includes(preferred)) return preferred;
  return values[0] || "";
}

function updateCompatibilityStatus(styleCount, presetCount) {
  const subject = getSubject().label.toLowerCase();
  elements.styleCount.textContent = state.showAllOptions ? `${styles.length} styles` : `${styleCount} recommended`;
  elements.compatibilityStatus.textContent = state.showAllOptions
    ? `Showing all choices for ${subject}`
    : `Guided for ${subject}: ${styleCount} approaches, ${presetCount} starting points`;
}

function bindEvents() {
  elements.workflowTabs.forEach((button) => {
    button.addEventListener("click", () => setWorkflow(button.dataset.workflowTab));
  });

  document.querySelectorAll("[data-choice-group]").forEach((group) => {
    group.addEventListener("click", (event) => {
      const button = event.target.closest(".choice-button");
      if (!button) return;
      setChoice(group.dataset.choiceGroup, button.dataset.value, { maybeUseDefaultText: true });
      state.activePreset = "";
      markCriteriaChanged();
      updateFromState();
    });
  });

  elements.presetGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".preset-button");
    if (!button) return;
    const preset = presets.find((item) => item.name === button.dataset.preset);
    if (preset) applyPreset(preset);
  });

  form.querySelectorAll("input[type='range']").forEach((range) => {
    range.addEventListener("input", () => {
      state.activePreset = "";
      markCriteriaChanged();
      updateFromState();
    });
  });

  form.querySelectorAll("select, textarea, .guardrails input").forEach((input) => {
    input.addEventListener("input", () => {
      state.activePreset = "";
      markCriteriaChanged();
      updateFromState();
    });
    input.addEventListener("change", () => {
      state.activePreset = "";
      markCriteriaChanged();
      updateFromState();
    });
  });

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });

  document.querySelectorAll(".variation-card").forEach((card) => {
    card.addEventListener("click", () => applyVariation(card.dataset.variation));
  });

  elements.showAllOptions.addEventListener("change", () => {
    state.showAllOptions = elements.showAllOptions.checked;
    state.activePreset = "";
    markCriteriaChanged();
    updateFromState();
    setGenerationStatus(state.showAllOptions ? "All options available" : "Guided choices applied");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    generateReference();
  });

  elements.copyPromptButton.addEventListener("click", copyPrompt);
  elements.downloadButton.addEventListener("click", downloadCanvas);
  elements.exportButton.addEventListener("click", exportBrief);
  elements.saveButton.addEventListener("click", saveCurrentReference);
  elements.shuffleButton.addEventListener("click", shuffleSettings);
  elements.resetButton.addEventListener("click", resetSettings);
  elements.clearSavedButton.addEventListener("click", clearSaved);

  elements.photoUploadInput.addEventListener("change", handlePhotoUpload);
  elements.uploadRequirements.addEventListener("input", updateUploadWorkspace);
  elements.uploadSize.addEventListener("change", updateUploadWorkspace);
  elements.uploadFidelity.addEventListener("change", updateUploadWorkspace);
  elements.uploadForm.addEventListener("submit", (event) => {
    event.preventDefault();
    generateFromUploadedPhotos();
  });
  elements.copyUploadPromptButton.addEventListener("click", copyUploadPrompt);
  elements.downloadUploadButton.addEventListener("click", downloadUploadResult);
  elements.useUploadResultButton.addEventListener("click", useUploadResultAsReference);
  elements.clearUploadButton.addEventListener("click", clearUploadedPhotos);
}

function setWorkflow(workflow) {
  state.workflow = workflow;
  elements.workflowTabs.forEach((button) => {
    const isActive = button.dataset.workflowTab === workflow;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  elements.workflowViews.forEach((view) => {
    view.hidden = view.dataset.workflowView !== workflow;
  });
}

async function handlePhotoUpload(event) {
  const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));
  const limitedFiles = files.slice(0, MAX_UPLOAD_PHOTOS);

  if (!limitedFiles.length) {
    setUploadStatus("Choose one or more image files.");
    return;
  }

  state.upload.photos = [];
  resetUploadResult({ invalidateRequests: true });
  state.upload.isGenerating = true;
  setUploadStatus("Preparing uploaded photos...");
  updateUploadWorkspace();

  try {
    const photos = [];
    for (const file of limitedFiles) {
      photos.push(await prepareUploadPhoto(file));
    }
    state.upload.photos = photos;
    setUploadStatus(
      files.length > MAX_UPLOAD_PHOTOS
        ? `Prepared ${MAX_UPLOAD_PHOTOS} photos. Extra files were skipped.`
        : `Prepared ${photos.length} photo${photos.length === 1 ? "" : "s"}.`,
    );
  } catch (error) {
    setUploadStatus(error.message || "Could not prepare uploaded photos.");
  } finally {
    state.upload.isGenerating = false;
    updateUploadWorkspace();
  }
}

function prepareUploadPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        try {
          const dataUrl = resizeUploadImage(image);
          resolve({
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            name: file.name,
            originalSize: file.size,
            sizeLabel: formatBytes(file.size),
            width: image.naturalWidth,
            height: image.naturalHeight,
            dataUrl,
            originalDataUrl: reader.result,
          });
        } catch (error) {
          reject(error);
        }
      };
      image.onerror = () => reject(new Error(`${file.name} is not a readable image.`));
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function resizeUploadImage(image) {
  const scale = Math.min(1, UPLOAD_IMAGE_MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const uploadCanvas = document.createElement("canvas");
  const uploadContext = uploadCanvas.getContext("2d");

  uploadCanvas.width = width;
  uploadCanvas.height = height;
  uploadContext.fillStyle = "#ffffff";
  uploadContext.fillRect(0, 0, width, height);
  uploadContext.drawImage(image, 0, 0, width, height);
  return uploadCanvas.toDataURL("image/jpeg", 0.92);
}

function updateUploadWorkspace() {
  const operation = getUploadOperation();
  const photoCount = state.upload.photos.length;
  const needsMorePhotos = photoCount < operation.minimumPhotos;

  updateRangeLabels();
  elements.uploadResultTitle.textContent = state.upload.result?.imageDataUrl
    ? `${operation.label} result`
    : operation.title;
  elements.uploadCount.textContent = `${photoCount} selected`;
  elements.uploadSourceSummary.textContent = photoCount
    ? `${photoCount} source photo${photoCount === 1 ? "" : "s"} ready`
    : "No photos selected";
  elements.uploadPrompt.value = buildUploadPrompt();

  renderUploadPhotos(elements.uploadPhotoGrid, "thumb");
  renderUploadPhotos(elements.uploadLargeGrid, "large");

  elements.uploadGenerateButton.disabled = state.upload.isGenerating || needsMorePhotos;
  elements.copyUploadPromptButton.disabled = !elements.uploadPrompt.value;
  elements.downloadUploadButton.disabled = !state.upload.result?.imageDataUrl;
  elements.useUploadResultButton.disabled = !state.upload.result?.imageDataUrl;

  if (state.upload.isGenerating) return;
  if (needsMorePhotos) {
    setUploadStatus("Upload one or more photos to begin");
  }
}

function renderUploadPhotos(container, density) {
  container.innerHTML = "";

  if (!state.upload.photos.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No uploaded photos yet";
    container.append(empty);
    return;
  }

  state.upload.photos.forEach((photo, index) => {
    const card = document.createElement("div");
    card.className = density === "large" ? "upload-large-card" : "upload-thumb";
    card.innerHTML = `
      <img src="${photo.dataUrl}" alt="Uploaded source ${index + 1}: ${escapeHtml(photo.name)}" />
      <span>${index + 1}. ${escapeHtml(photo.name)} · ${escapeHtml(photo.sizeLabel)}</span>
    `;
    container.append(card);
  });
}

function getUploadOperation() {
  return uploadOperations[state.upload.operation] || uploadOperations.similar;
}

function buildUploadPrompt() {
  const operation = getUploadOperation();
  const photoCount = state.upload.photos.length;
  const requirements = elements.uploadRequirements.value.trim();
  const sourceSummary = photoCount
    ? state.upload.photos
        .map((photo, index) => `Source ${index + 1}: ${photo.name}, ${photo.width}x${photo.height}.`)
        .join("\n")
    : "Source photos: none selected yet.";
  const requirementLine = requirements
    ? `Artist's reference notes: ${requirements}.`
    : "Artist's reference notes: none provided; make the most useful similar natural reference-photo result.";

  return [
    `${operation.title} for an artist's painting reference.`,
    `Use ${photoCount || "the"} uploaded source photo${photoCount === 1 ? "" : "s"} as visual input.`,
    sourceSummary,
    operation.prompt,
    requirementLine,
    `Output priorities: realistic source photograph, clean readable value structure, believable color temperature, coherent perspective, useful edges, and enough detail to paint from.`,
    `Constraints: do not create a painting, illustration, sketch, concept art, render, or stylized artwork; no brushstrokes; no canvas texture; no watercolor, oil paint, ink, or pastel effect; no text, signature, logo, or watermark.`,
  ].join("\n");
}

async function generateFromUploadedPhotos() {
  const operation = getUploadOperation();
  if (state.upload.photos.length < operation.minimumPhotos || state.upload.isGenerating) {
    updateUploadWorkspace();
    return null;
  }

  state.upload.generation += 1;
  const generationId = state.upload.generation;
  const requestId = `upload-${Date.now()}-${generationId}`;
  const prompt = buildUploadPrompt();

  state.upload.isGenerating = true;
  setUploadStatus(`Generating ${operation.status.toLowerCase()}...`);
  elements.uploadForm.classList.add("is-generating");
  updateUploadWorkspace();
  elements.uploadPrompt.value = prompt;

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        settings: getUploadSettings(),
        size: elements.uploadSize.value,
        requestId,
        uploadOperation: state.upload.operation,
        sourceImageDataUrls: state.upload.photos.map((photo) => photo.dataUrl),
        inputFidelity: elements.uploadFidelity.value,
      }),
    });
    const payload = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(payload.error || "Uploaded photo generation failed.");
    }

    if (state.upload.generation !== generationId) return null;

    state.upload.result = payload;
    await displayUploadResult(payload);
    setUploadStatus(`Generated similar reference ${generationId}`);
    updateUploadWorkspace();
    return payload;
  } catch (error) {
    setUploadStatus(error.message);
    return null;
  } finally {
    state.upload.isGenerating = false;
    elements.uploadForm.classList.remove("is-generating");
    updateUploadWorkspace();
  }
}

async function displayUploadResult(payload) {
  clearUploadResultImage();
  elements.uploadResultImage.src = payload.imageDataUrl;
  elements.uploadResultImage.hidden = false;
}

function getUploadSettings() {
  return {
    uploadOperation: state.upload.operation,
    sourcePhotoCount: state.upload.photos.length,
    sourceMatch: elements.uploadFidelity.value,
    outputSize: elements.uploadSize.value,
    requirements: elements.uploadRequirements.value.trim(),
  };
}

function clearUploadResultImage() {
  elements.uploadResultImage.removeAttribute("src");
  elements.uploadResultImage.hidden = true;
  elements.uploadResultImage.classList.remove("has-transparent-background");
}

function resetUploadResult(options = {}) {
  if (options.invalidateRequests) state.upload.generation += 1;
  state.upload.result = null;
  clearUploadResultImage();
}

function setUploadStatus(message) {
  elements.uploadNotice.textContent = message;
}

function copyUploadPrompt() {
  const text = elements.uploadPrompt.value;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      setUploadStatus("Upload prompt copied");
    });
    return;
  }

  elements.uploadPrompt.select();
  document.execCommand("copy");
  setUploadStatus("Upload prompt copied");
}

function downloadUploadResult() {
  if (!state.upload.result?.imageDataUrl) return;
  const link = document.createElement("a");
  link.download = `${makeSlug("reference-upload", state.upload.operation)}.png`;
  link.href = state.upload.result.imageDataUrl;
  link.click();
  setUploadStatus("Result downloaded");
}

function useUploadResultAsReference() {
  if (!state.upload.result?.imageDataUrl) return;
  state.generatedImageReady = false;
  state.generatedMeta = state.upload.result;
  state.mainReferenceMeta = state.upload.result;
  state.activeVariation = "";
  state.variations = {};
  state.imagePalette = null;
  state.paintabilityAnalysis = null;
  images.generated.src = state.upload.result.imageDataUrl;
  setWorkflow("generator");
  setGenerationStatus("Uploaded photo result loaded as main reference");
  updateVariationCards();
}

function clearUploadedPhotos() {
  state.upload.photos = [];
  resetUploadResult({ invalidateRequests: true });
  elements.photoUploadInput.value = "";
  updateUploadWorkspace();
}

function setChoice(groupName, value, options = {}) {
  if (!value) return;
  state.selected[groupName] = value;

  const group = document.querySelector(`[data-choice-group="${groupName}"]`);
  group.querySelectorAll(".choice-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.value === value);
  });

  if (groupName === "subject") {
    const subject = getSubject();
    elements.requirements.placeholder = subject.defaultText;
    if (options.forceText && typeof options.text === "string") {
      elements.requirements.value = options.text;
    }
  }
}

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  });
  elements.modeBadge.textContent = titleCase(mode);
  renderCanvas();
}

function applyPreset(preset) {
  state.activePreset = preset.name;
  markCriteriaChanged();
  applySettings(preset.settings);
  updatePresetButtons();
  setGenerationStatus("Preset loaded. Generate for a new reference.");
}

function applySettings(settings) {
  setChoice("subject", settings.subject, { forceText: true, text: settings.requirements || "" });
  renderGuidedChoices();
  setChoice("style", settings.style);
  setSelectValue(elements.purpose, settings.purpose);
  setSelectValue(elements.lighting, settings.lighting);
  setSelectValue(elements.mood, settings.mood);
  setSelectValue(elements.composition, settings.composition);
  setSelectValue(elements.camera, settings.camera);
  setSelectValue(elements.color, settings.color);
  setSelectValue(elements.pose, settings.pose);
  document.querySelector("#detailRange").value = String(settings.detail ?? 1);
  document.querySelector("#contrastRange").value = String(settings.contrast ?? 1);
  document.querySelector("#backgroundRange").value = String(settings.background ?? 1);
  document.querySelector("#abstractionRange").value = String(settings.abstraction ?? 0);
  elements.requirements.value = settings.requirements || "";
  updateFromState();
}

function updateFromState() {
  renderGuidedChoices();
  updateRangeLabels();
  updateTitle();
  updateMetrics();
  updatePalette();
  updateBrief();
  updatePaintability();
  updateVariationLabels();
  updateVariationCards();
  updatePresetButtons();
  resizeCanvasForSelection();
  elements.requirements.placeholder = getSubject().defaultText;
  elements.prompt.value = buildPrompt();
  renderCanvas();
}

function updateTitle() {
  const subject = getSubject().label.toLowerCase();
  const style = getStyle().label;
  const purpose = elements.purpose.value.toLowerCase();
  elements.title.textContent = `${style} ${subject} for ${purpose}`;
}

function updateMetrics() {
  elements.lightMetric.textContent = elements.lighting.value;
  elements.valueMetric.textContent = getRangeLabel("contrastRange");
  elements.detailMetric.textContent = getRangeLabel("detailRange");
  elements.colorMetric.textContent = elements.color.value;
  elements.cameraMetric.textContent = elements.camera.value;
  elements.moodMetric.textContent = elements.mood.value;
}

function updateRangeLabels() {
  Object.keys(rangeLabels).forEach((id) => {
    const output = document.querySelector(`[data-range-output="${id}"]`);
    if (output) output.textContent = getRangeLabel(id);
  });
}

function updatePalette() {
  const palette = getCurrentPalette();
  elements.paletteName.textContent = palette.name;
  elements.paletteSwatches.innerHTML = "";
  palette.colors.forEach((color) => {
    const swatch = document.createElement("span");
    swatch.className = "swatch";
    swatch.style.background = color;
    swatch.title = color;
    elements.paletteSwatches.append(swatch);
  });
}

function getCurrentPalette() {
  if (state.imagePalette?.colors?.length) return state.imagePalette;
  const style = getStyle();
  return {
    name: style.paletteName,
    colors: style.colors,
  };
}

function updatePaletteFromGeneratedImage() {
  const colors = extractImagePalette(images.generated, 5);
  if (!colors.length) {
    state.imagePalette = null;
    updatePalette();
    return;
  }

  state.imagePalette = {
    name: state.activeVariation ? `${titleCase(state.activeVariation)} variation colors` : "Current reference colors",
    colors,
  };
  updatePalette();
}

function extractImagePalette(image, colorCount) {
  if (!image.complete || !image.naturalWidth || !image.naturalHeight) return [];

  const sample = document.createElement("canvas");
  const sampleContext = sample.getContext("2d", { willReadFrequently: true });
  sample.width = 72;
  sample.height = Math.max(48, Math.round((image.naturalHeight / image.naturalWidth) * sample.width));
  sampleContext.drawImage(image, 0, 0, sample.width, sample.height);

  const data = sampleContext.getImageData(0, 0, sample.width, sample.height).data;
  const buckets = new Map();

  for (let index = 0; index < data.length; index += 16) {
    const alpha = data[index + 3];
    if (alpha < 180) continue;

    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const saturation = getSaturation(red, green, blue);
    const luminance = getLuminance(red, green, blue);

    if (luminance < 18 || luminance > 242) continue;

    const key = `${Math.round(red / 24) * 24},${Math.round(green / 24) * 24},${Math.round(blue / 24) * 24}`;
    const bucket = buckets.get(key) || { red: 0, green: 0, blue: 0, count: 0, score: 0 };
    bucket.red += red;
    bucket.green += green;
    bucket.blue += blue;
    bucket.count += 1;
    bucket.score += 1 + saturation * 1.4 + Math.max(0, 120 - Math.abs(luminance - 132)) / 180;
    buckets.set(key, bucket);
  }

  const colors = Array.from(buckets.values())
    .sort((a, b) => b.score - a.score)
    .map((bucket) =>
      rgbToHex(
        Math.round(bucket.red / bucket.count),
        Math.round(bucket.green / bucket.count),
        Math.round(bucket.blue / bucket.count),
      ),
    );

  return completePalette(uniqueColors(colors), colorCount);
}

function updateBrief() {
  const subject = getSubject();
  const points = [
    `Focus: ${subject.focus}.`,
    `Light: ${elements.lighting.value.toLowerCase()} with ${getRangeLabel("contrastRange").toLowerCase()} value contrast.`,
    `Composition: ${elements.composition.value.toLowerCase()} from ${elements.camera.value.toLowerCase()}.`,
    `Surface notes: ${getRangeLabel("detailRange").toLowerCase()} detail, ${elements.color.value.toLowerCase()}, ${getRangeLabel("backgroundRange").toLowerCase()} background.`,
  ];

  elements.briefList.innerHTML = "";
  points.forEach((point) => {
    const item = document.createElement("li");
    item.textContent = point;
    elements.briefList.append(item);
  });
}

function updatePaintability() {
  const analysis = getPaintabilityAnalysis();
  const score = analysis.score;
  elements.paintabilityScore.textContent = score;
  elements.scoreLabel.textContent =
    score >= 90 ? "Strong reference" : score >= 80 ? "Useful study" : score >= 70 ? "Needs refinement" : "Simplify first";
  updatePaintabilityBreakdown(analysis.breakdown);
}

function updatePaintabilityBreakdown(breakdown) {
  elements.scoreRows.forEach((row) => {
    const key = row.dataset.paintabilityRow;
    const value = breakdown[key] ?? 0;
    row.querySelector("strong").textContent = value;
    row.querySelector(".score-track i").style.width = `${value}%`;
  });
}

function updatePaintabilityFromGeneratedImage() {
  state.paintabilityAnalysis = analyzeImagePaintability(images.generated);
  updatePaintability();
}

function updateVariationLabels() {
  const labels = {
    lighting: `${elements.lighting.value.split(" ").slice(0, 3).join(" ")} variation`,
    palette: `${getStyle().label} palette`,
    background: `${getRangeLabel("backgroundRange")} background`,
    composition: `${elements.composition.value} crop`,
  };

  document.querySelectorAll(".variation-card").forEach((card) => {
    const label = card.querySelector(".variation-label");
    if (label) label.textContent = labels[card.dataset.variation];
  });
}

function updateVariationCards() {
  const hasMainReference = Boolean(state.mainReferenceMeta?.imageDataUrl);

  document.querySelectorAll(".variation-card").forEach((card) => {
    const type = card.dataset.variation;
    const image = card.querySelector("img");
    const placeholder = card.querySelector(".variation-placeholder");
    const variationState = card.querySelector(".variation-state");
    const variation = state.variations[type];
    const variationError = state.variationErrors[type];
    const isLoading = state.loadingVariationType === type;

    card.disabled = !ENABLE_VARIATIONS || !hasMainReference || isLoading;
    card.classList.toggle("is-empty", !variation);
    card.classList.toggle("is-active", state.activeVariation === type);
    card.classList.toggle("is-loading", isLoading);
    card.classList.toggle("has-error", Boolean(variationError));

    if (variation?.imageDataUrl) {
      image.src = variation.imageDataUrl;
      image.hidden = false;
      placeholder.hidden = true;
      variationState.textContent = isLoading ? "Generating..." : "Variation ready";
      return;
    }

    image.removeAttribute("src");
    image.hidden = true;
    placeholder.hidden = false;
    placeholder.textContent = getVariationPlaceholderText(hasMainReference, isLoading, variationError);
    variationState.textContent = getVariationStateText(hasMainReference, isLoading, variationError);
  });
}

function getVariationPlaceholderText(hasMainReference, isLoading, variationError) {
  if (!ENABLE_VARIATIONS) return "Paused";
  if (variationError) return "Try again";
  if (isLoading) return "Generating...";
  if (hasMainReference) return state.isGeneratingVariations ? "Queued" : "Generate variation";
  return "Generate main reference first";
}

function getVariationStateText(hasMainReference, isLoading, variationError) {
  if (!ENABLE_VARIATIONS) return "Variations paused";
  if (variationError) return "Variation failed";
  if (isLoading) return "Generating...";
  if (hasMainReference) return state.isGeneratingVariations ? "Queued" : "Generate variation";
  return "Waiting for main reference";
}

function updatePresetButtons() {
  document.querySelectorAll(".preset-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.preset === state.activePreset);
  });
}

function setGenerationStatus(message) {
  elements.generationStatus.textContent = message;
  elements.generationNotice.textContent = message;
}

function markCriteriaChanged() {
  state.activeGenerationRequest = -1;
  state.variationBatch += 1;
  if (!state.generatedImageReady && !state.generatedMeta && !state.mainReferenceMeta) return;
  state.generatedImageReady = false;
  state.generatedMeta = null;
  state.mainReferenceMeta = null;
  state.activeVariation = "";
  state.variations = {};
  state.imagePalette = null;
  state.paintabilityAnalysis = null;
  state.loadingVariationType = "";
  state.variationErrors = {};
  state.isGeneratingVariations = false;
  images.generated.removeAttribute("src");
  setGenerationStatus("Criteria changed. Generate for a new reference.");
  updateVariationCards();
  updatePalette();
  updatePaintability();
}

function buildPrompt() {
  const subject = getSubject();
  const style = getStyle();
  const requirements = elements.requirements.value.trim();
  const guardrails = Array.from(document.querySelectorAll(".guardrails input:checked")).map(
    (input) => input.value,
  );
  const requirementLine = requirements
    ? `Additional artist requirements: ${requirements}.`
    : `Additional artist requirements: none provided; invent a fresh, non-repeating subject appropriate for the selected ${subject.label.toLowerCase()} category.`;

  return [
    `Generate a realistic reference photograph for an artist to paint from: ${subject.label.toLowerCase()} ${elements.purpose.value.toLowerCase()}.`,
    `The image itself must look like a natural source photo, not a painting, illustration, sketch, concept art, render, or stylized artwork.`,
    `Artist's intended painting approach: ${style.label}. Use this only to guide reference-photo choices: ${style.detail}.`,
    `Subject focus: ${subject.focus}.`,
    requirementLine,
    `Lighting and mood: ${elements.lighting.value}; ${elements.mood.value.toLowerCase()}.`,
    `Composition: ${elements.composition.value.toLowerCase()}, ${elements.camera.value.toLowerCase()}, ${elements.pose.value.toLowerCase()}.`,
    `Visual priorities: ${getRangeLabel("contrastRange").toLowerCase()} value contrast, ${getRangeLabel("detailRange").toLowerCase()} detail, ${getRangeLabel("backgroundRange").toLowerCase()} background, ${elements.color.value.toLowerCase()}, ${getRangeLabel("abstractionRange").toLowerCase()} abstraction level.`,
    `Painter needs: readable silhouette, useful edge variety, believable color temperature, clear big value families.`,
    `Constraints: ${guardrails.join("; ")}; no brushstrokes; no canvas texture; no watercolor, oil paint, ink, or pastel effect; no text, signature, logo, or watermark.`,
  ].join("\n");
}

function buildGenerationPrompt(variationType = "") {
  const directive = getVariationDirective(variationType);
  return directive ? `${buildPrompt()}\nVariation request: ${directive}` : buildPrompt();
}

function getVariationDirective(type) {
  const directives = {
    lighting: "using the current main reference photo as the source, preserve the subject, pose, crop, and setting while changing only the lighting direction and light-shadow design.",
    palette: "using the current main reference photo as the source, preserve the subject, pose, crop, and setting while shifting the color temperature and palette relationships.",
    background: "using the current main reference photo as the source, preserve the subject, pose, and camera angle while simplifying or changing the background in a believable photographic way.",
    composition: "using the current main reference photo as the source, preserve the same subject and visual identity while creating a related alternate crop or camera angle.",
  };
  return directives[type] || "";
}

async function generateReference(options = {}) {
  if (state.isGenerating && !options.fromVariationQueue) return null;

  const variationType = options.variationType || "";
  const isVariation = Boolean(variationType);
  const shouldDisplayResult = options.displayResult !== false;
  if (isVariation && !state.mainReferenceMeta?.imageDataUrl) {
    setGenerationStatus("Generate a main reference before creating variations.");
    updateVariationCards();
    return null;
  }

  state.generation += 1;
  const generationId = state.generation;
  const requestId = `${Date.now()}-${generationId}`;
  if (!isVariation) state.activeGenerationRequest = generationId;
  const sourceRequestId = isVariation ? state.mainReferenceMeta.requestId || "" : "";
  state.isGenerating = true;
  state.loadingVariationType = variationType;
  setGenerationStatus(isVariation ? `Generating ${variationType} variation...` : "Generating new reference...");
  form.classList.add("is-generating");
  elements.saveButton.disabled = true;
  elements.downloadButton.disabled = true;

  if (!isVariation) {
    state.generatedImageReady = false;
    state.generatedMeta = null;
    state.mainReferenceMeta = null;
    state.activeVariation = "";
    state.variations = {};
    state.imagePalette = null;
    state.paintabilityAnalysis = null;
    state.variationErrors = {};
    state.variationBatch += 1;
    state.isGeneratingVariations = false;
    state.loadingVariationType = "";
    images.generated.removeAttribute("src");
  } else {
    delete state.variationErrors[variationType];
  }

  updateFromState();
  const prompt = buildGenerationPrompt(variationType);
  elements.prompt.value = prompt;
  const requestBody = {
    prompt,
    settings: getSettings(),
    size: getApiImageSize(),
    requestId,
    variationType,
  };

  if (isVariation) {
    requestBody.sourceImageDataUrl = state.mainReferenceMeta.imageDataUrl;
    requestBody.sourceRequestId = sourceRequestId;
  }

  let generatedPayload = null;

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    const payload = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(payload.error || "Image generation failed.");
    }

    if (!isVariation && state.activeGenerationRequest !== generationId) return null;
    if (isVariation && state.mainReferenceMeta?.requestId !== sourceRequestId) return null;

    if (isVariation) {
      state.variations[variationType] = payload;
      if (shouldDisplayResult) {
        state.generatedImageReady = false;
        state.generatedMeta = payload;
        state.imagePalette = null;
        state.paintabilityAnalysis = null;
        state.activeVariation = variationType;
        images.generated.src = payload.imageDataUrl;
      }
    } else {
      state.generatedImageReady = false;
      state.generatedMeta = payload;
      state.imagePalette = null;
      state.paintabilityAnalysis = null;
      state.mainReferenceMeta = payload;
      state.activeVariation = "";
      state.variations = {};
      state.variationErrors = {};
      images.generated.src = payload.imageDataUrl;
    }
    setGenerationStatus(isVariation ? `Generated ${variationType} variation` : `Generated new reference ${generationId}`);
    generatedPayload = payload;
  } catch (error) {
    if (isVariation) {
      state.variationErrors[variationType] = error.message;
      updateVariationCards();
    }
    setGenerationStatus(error.message);
  } finally {
    state.isGenerating = false;
    state.loadingVariationType = "";
    form.classList.remove("is-generating");
    elements.saveButton.disabled = false;
    elements.downloadButton.disabled = false;
    updateVariationCards();
  }

  if (ENABLE_VARIATIONS && generatedPayload && !isVariation && options.autoGenerateVariations !== false) {
    generateAllVariationsForMain(generatedPayload.requestId);
  }

  return generatedPayload;
}

async function generateAllVariationsForMain(mainRequestId) {
  if (!state.mainReferenceMeta?.imageDataUrl || state.isGeneratingVariations) return;

  const batchId = state.variationBatch;
  state.isGeneratingVariations = true;
  updateVariationCards();

  for (const type of variationTypes) {
    if (state.variationBatch !== batchId || state.mainReferenceMeta?.requestId !== mainRequestId) break;
    if (state.variations[type]?.imageDataUrl) continue;

    await generateReference({
      variationType: type,
      displayResult: false,
      autoGenerateVariations: false,
      fromVariationQueue: true,
    });
  }

  if (state.variationBatch === batchId && state.mainReferenceMeta?.requestId === mainRequestId) {
    state.isGeneratingVariations = false;
    state.loadingVariationType = "";
    const readyCount = variationTypes.filter((type) => state.variations[type]?.imageDataUrl).length;
    setGenerationStatus(readyCount === variationTypes.length ? "Generated all variations" : "Some variations need retry");
    updateVariationCards();
  }
}

async function readJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return { error: `Generation endpoint returned HTTP ${response.status}. Restart the Reference Studio server.` };
  }
}

function applyVariation(type) {
  if (!ENABLE_VARIATIONS) {
    setGenerationStatus("Variations are paused to save API usage.");
    updateVariationCards();
    return;
  }

  if (!state.mainReferenceMeta?.imageDataUrl) {
    setGenerationStatus("Generate a main reference before creating variations.");
    updateVariationCards();
    return;
  }

  if (state.variations[type]?.imageDataUrl) {
    state.activeVariation = type;
    state.generatedImageReady = false;
    state.generatedMeta = state.variations[type];
    state.imagePalette = null;
    state.paintabilityAnalysis = null;
    images.generated.src = state.variations[type].imageDataUrl;
    setGenerationStatus(`Showing ${type} variation`);
    updateVariationCards();
    return;
  }

  generateReference({ variationType: type, autoGenerateVariations: false });
}

function shuffleSettings() {
  state.activePreset = "";
  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  setChoice("subject", subject.label, { forceText: true });
  renderGuidedChoices();

  const availableStyles = getAvailableStyles();
  const style = availableStyles[Math.floor(Math.random() * availableStyles.length)];
  setChoice("style", style.label);

  randomSelect(elements.purpose);
  randomSelect(elements.lighting);
  randomSelect(elements.mood);
  randomSelect(elements.composition);
  randomSelect(elements.camera);
  randomSelect(elements.color);
  randomSelect(elements.pose);

  form.querySelectorAll("input[type='range']").forEach((range) => {
    range.value = String(Math.floor(Math.random() * 3));
  });

  elements.requirements.value = "";
  markCriteriaChanged();
  updateFromState();
  setGenerationStatus("Shuffled criteria ready. Generate for a new reference.");
}

function resetSettings() {
  state.activePreset = "";
  markCriteriaChanged();
  applySettings({
    subject: "Portrait",
    style: "Traditional",
    purpose: "Finished painting",
    lighting: "Warm window light from the left",
    mood: "Quiet and contemplative",
    composition: "Three-quarter crop",
    camera: "Eye level",
    color: "Natural muted color",
    pose: "Still and natural",
    detail: 1,
    contrast: 2,
    background: 1,
    abstraction: 0,
    requirements: "",
  });
  document.querySelectorAll(".guardrails input").forEach((input) => {
    input.checked = true;
  });
  setMode("original");
  setGenerationStatus("Ready");
}

function getPaintabilityAnalysis() {
  return state.paintabilityAnalysis || calculateSettingsPaintability();
}

function calculatePaintability() {
  return getPaintabilityAnalysis().score;
}

function calculateSettingsPaintability() {
  let score = 68;
  const guardrailCount = document.querySelectorAll(".guardrails input:checked").length;
  score += guardrailCount * 3;
  score += Number(document.querySelector("#contrastRange").value) * 4;
  score += Number(document.querySelector("#detailRange").value) === 2 ? 1 : 4;
  score += Number(document.querySelector("#backgroundRange").value) === 2 ? 0 : 5;
  score += elements.lighting.value.includes("Dramatic") || elements.lighting.value.includes("window") ? 4 : 2;
  score += elements.requirements.value.trim().length > 24 ? 4 : 0;
  score -= Number(document.querySelector("#abstractionRange").value) === 2 && getStyle().label !== "Abstract" ? 5 : 0;
  score = Math.round(clamp(score, 52, 98));

  const contrastValue = Number(document.querySelector("#contrastRange").value);
  const detailValue = Number(document.querySelector("#detailRange").value);
  const backgroundValue = Number(document.querySelector("#backgroundRange").value);
  const colorBonus = elements.color.value.includes("contrast") || elements.color.value.includes("warm") ? 6 : 0;

  return {
    score,
    source: "settings",
    breakdown: {
      value: Math.round(clamp(64 + contrastValue * 12, 0, 100)),
      clarity: Math.round(clamp(78 - Math.abs(detailValue - 1) * 8 - backgroundValue * 5 + guardrailCount, 0, 100)),
      composition: Math.round(clamp(72 + (backgroundValue === 0 ? 8 : 0) + (elements.composition.value.includes("space") ? 8 : 0), 0, 100)),
      color: Math.round(clamp(70 + colorBonus + (getStyle().label === "Tonalism" ? 4 : 0), 0, 100)),
    },
  };
}

function analyzeImagePaintability(image) {
  if (!image.complete || !image.naturalWidth || !image.naturalHeight) {
    return calculateSettingsPaintability();
  }

  const sample = document.createElement("canvas");
  const sampleContext = sample.getContext("2d", { willReadFrequently: true });
  sample.width = 96;
  sample.height = Math.max(56, Math.round((image.naturalHeight / image.naturalWidth) * sample.width));
  sampleContext.drawImage(image, 0, 0, sample.width, sample.height);

  const imageData = sampleContext.getImageData(0, 0, sample.width, sample.height);
  const stats = getImagePaintabilityStats(imageData);
  const breakdown = {
    value: scoreValueStructure(stats),
    clarity: scoreShapeClarity(stats),
    composition: scoreComposition(stats),
    color: scoreColorUsefulness(stats),
  };
  const score = Math.round(
    breakdown.value * 0.35 + breakdown.clarity * 0.25 + breakdown.composition * 0.2 + breakdown.color * 0.2,
  );

  return {
    score: Math.round(clamp(score, 0, 100)),
    source: "image",
    breakdown,
  };
}

function getImagePaintabilityStats(imageData) {
  const { width, height, data } = imageData;
  const luminanceValues = [];
  const gray = new Float32Array(width * height);
  const saturationValues = [];
  const hueBins = new Set();
  let clippedPixels = 0;
  let saturationTotal = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const luminance = getLuminance(red, green, blue);
      const saturation = getSaturation(red, green, blue);
      const hue = getHue(red, green, blue);

      gray[y * width + x] = luminance;
      luminanceValues.push(luminance);
      saturationValues.push(saturation);
      saturationTotal += saturation;

      if (luminance < 8 || luminance > 247) clippedPixels += 1;
      if (saturation > 0.12) hueBins.add(Math.floor(hue / 30));
    }
  }

  luminanceValues.sort((a, b) => a - b);
  const p10 = percentileSorted(luminanceValues, 0.1);
  const p90 = percentileSorted(luminanceValues, 0.9);
  const mean = average(luminanceValues);
  const stdDev = standardDeviation(luminanceValues, mean);

  const valueBins = [0, 0, 0, 0, 0];
  luminanceValues.forEach((luminance) => {
    valueBins[Math.min(valueBins.length - 1, Math.floor(luminance / 52))] += 1;
  });

  const edgeStats = getEdgeStats(gray, width, height);
  const avgSaturation = saturationTotal / saturationValues.length;
  const saturationStdDev = standardDeviation(saturationValues, avgSaturation);

  return {
    width,
    height,
    valueRange: p90 - p10,
    stdDev,
    clippedRatio: clippedPixels / luminanceValues.length,
    largestValueBinShare: Math.max(...valueBins) / luminanceValues.length,
    avgSaturation,
    saturationStdDev,
    hueBinCount: hueBins.size,
    ...edgeStats,
  };
}

function getEdgeStats(gray, width, height) {
  let edgeCount = 0;
  let edgeTotal = 0;
  let left = 0;
  let right = 0;
  let top = 0;
  let bottom = 0;
  let center = 0;
  let border = 0;
  const threshold = 32;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      const gx =
        -gray[i - width - 1] -
        2 * gray[i - 1] -
        gray[i + width - 1] +
        gray[i - width + 1] +
        2 * gray[i + 1] +
        gray[i + width + 1];
      const gy =
        -gray[i - width - 1] -
        2 * gray[i - width] -
        gray[i - width + 1] +
        gray[i + width - 1] +
        2 * gray[i + width] +
        gray[i + width + 1];
      const magnitude = Math.sqrt(gx * gx + gy * gy);

      if (magnitude <= threshold) continue;

      edgeCount += 1;
      edgeTotal += magnitude;
      if (x < width / 2) left += magnitude;
      else right += magnitude;
      if (y < height / 2) top += magnitude;
      else bottom += magnitude;

      const inCenter = x > width * 0.22 && x < width * 0.78 && y > height * 0.18 && y < height * 0.82;
      const inBorder = x < width * 0.12 || x > width * 0.88 || y < height * 0.12 || y > height * 0.88;
      if (inCenter) center += magnitude;
      if (inBorder) border += magnitude;
    }
  }

  return {
    edgeDensity: edgeCount / ((width - 2) * (height - 2)),
    edgeTotal,
    edgeBalance:
      edgeTotal > 0
        ? 1 - clamp((Math.abs(left - right) + Math.abs(top - bottom)) / (edgeTotal * 1.4), 0, 1)
        : 0.6,
    centerEdgeShare: edgeTotal > 0 ? center / edgeTotal : 0.45,
    borderEdgeShare: edgeTotal > 0 ? border / edgeTotal : 0.18,
  };
}

function scoreValueStructure(stats) {
  const rangeScore = scoreBand(stats.valueRange, 74, 176, 78);
  const deviationScore = scoreBand(stats.stdDev, 28, 74, 38);
  const clippingPenalty = stats.clippedRatio * 180;
  return Math.round(clamp(rangeScore * 0.62 + deviationScore * 0.38 - clippingPenalty, 0, 100));
}

function scoreShapeClarity(stats) {
  const edgeScore = scoreBand(stats.edgeDensity, 0.035, 0.18, 0.035);
  const massScore = scoreBand(stats.largestValueBinShare, 0.24, 0.62, 0.22);
  return Math.round(clamp(edgeScore * 0.68 + massScore * 0.32, 0, 100));
}

function scoreComposition(stats) {
  const balanceScore = stats.edgeBalance * 100;
  const centerScore = scoreBand(stats.centerEdgeShare, 0.24, 0.68, 0.3);
  const borderScore = 100 - clamp((stats.borderEdgeShare - 0.16) * 190, 0, 70);
  return Math.round(clamp(balanceScore * 0.4 + centerScore * 0.36 + borderScore * 0.24, 0, 100));
}

function scoreColorUsefulness(stats) {
  const saturationScore = scoreBand(stats.avgSaturation, 0.1, 0.5, 0.24);
  const spreadScore = scoreBand(stats.saturationStdDev, 0.04, 0.24, 0.16);
  const hueScore = scoreBand(stats.hueBinCount, 2, 8, 5);
  return Math.round(clamp(saturationScore * 0.42 + spreadScore * 0.28 + hueScore * 0.3, 0, 100));
}

function getApiImageSize() {
  if (canvas.width > canvas.height) return "1536x1024";
  if (canvas.height > canvas.width) return "1024x1536";
  return "1024x1024";
}

function resizeCanvasForSelection() {
  const subject = getSubject();
  const composition = elements.composition.value;
  let nextSize = { width: 768, height: 1152 };

  if (subject.orientation === "landscape" || composition === "Wide scene") {
    nextSize = { width: 1152, height: 768 };
  }

  if (subject.orientation === "square" && composition !== "Wide scene") {
    nextSize = { width: 960, height: 960 };
  }

  if (canvas.width !== nextSize.width || canvas.height !== nextSize.height) {
    canvas.width = nextSize.width;
    canvas.height = nextSize.height;
  }
}

function renderCanvas() {
  if (!ctx) return;

  const source = getCurrentSource();
  if (!source.image.complete || !source.image.naturalWidth) {
    drawFallback();
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSourceCover(ctx, source);
  applyLightingTreatment();

  if (state.mode === "value") {
    applyValueStudy();
  }

  if (state.mode === "shape") {
    applyShapeStudy(source);
  }

  if (state.mode === "contour") {
    applyContourStudy(source);
  }
}

function getCurrentSource() {
  if (state.generatedImageReady && images.generated.naturalWidth) {
    return { image: images.generated, crop: { source: "generated" } };
  }

  const crop = getSubject().crop;
  const image = crop.source === "board" ? images.board : images.portrait;
  return { image, crop };
}

function drawSourceCover(context, source, targetCanvas = canvas) {
  const { image, crop } = source;
  const gutter = crop.source === "board" ? image.naturalWidth * 0.008 : 0;
  let sx = 0;
  let sy = 0;
  let sw = image.naturalWidth;
  let sh = image.naturalHeight;

  if (typeof crop.x === "number") {
    sx = image.naturalWidth * crop.x + gutter;
    sy = image.naturalHeight * crop.y + gutter;
    sw = image.naturalWidth * crop.w - gutter * 2;
    sh = image.naturalHeight * crop.h - gutter * 2;
  }

  const scale = Math.max(targetCanvas.width / sw, targetCanvas.height / sh);
  const drawWidth = targetCanvas.width / scale;
  const drawHeight = targetCanvas.height / scale;
  const drawX = sx + (sw - drawWidth) / 2;
  const drawY = sy + (sh - drawHeight) / 2;

  context.drawImage(
    image,
    drawX,
    drawY,
    drawWidth,
    drawHeight,
    0,
    0,
    targetCanvas.width,
    targetCanvas.height,
  );
}

function applyLightingTreatment() {
  const lighting = elements.lighting.value;

  ctx.save();
  if (lighting.includes("Low-key") || lighting.includes("Dramatic")) {
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(31, 24, 22, 0.16)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (lighting.includes("High-key") || lighting.includes("Overcast")) {
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "rgba(245, 248, 244, 0.18)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (lighting.includes("Golden") || lighting.includes("Candle")) {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "rgba(220, 145, 72, 0.22)");
    gradient.addColorStop(1, "rgba(55, 72, 90, 0.12)");
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.restore();
}

function applyValueStudy() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const contrastMap = [0.92, 1.06, 1.22];
  const contrast = contrastMap[Number(document.querySelector("#contrastRange").value)];

  for (let i = 0; i < data.length; i += 4) {
    const lum = data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
    const adjusted = clamp((lum - 128) * contrast + 128, 0, 255);
    data[i] = adjusted;
    data[i + 1] = adjusted;
    data[i + 2] = adjusted;
  }

  ctx.putImageData(imageData, 0, 0);
}

function applyShapeStudy(source) {
  const small = document.createElement("canvas");
  const smallContext = small.getContext("2d");
  small.width = Math.max(36, Math.round(canvas.width / 18));
  small.height = Math.max(36, Math.round(canvas.height / 18));
  drawSourceCover(smallContext, source, small);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(small, 0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] * 0.96 + 8, 0, 255);
    data[i + 1] = clamp(data[i + 1] * 0.94 + 7, 0, 255);
    data[i + 2] = clamp(data[i + 2] * 0.9 + 5, 0, 255);
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyContourStudy(source) {
  const edge = document.createElement("canvas");
  const edgeContext = edge.getContext("2d", { willReadFrequently: true });
  edge.width = Math.round(canvas.width / 2);
  edge.height = Math.round(canvas.height / 2);
  drawSourceCover(edgeContext, source, edge);

  const input = edgeContext.getImageData(0, 0, edge.width, edge.height);
  const output = edgeContext.createImageData(edge.width, edge.height);
  const gray = new Uint8ClampedArray(edge.width * edge.height);

  for (let y = 0; y < edge.height; y += 1) {
    for (let x = 0; x < edge.width; x += 1) {
      const index = (y * edge.width + x) * 4;
      gray[y * edge.width + x] =
        input.data[index] * 0.2126 + input.data[index + 1] * 0.7152 + input.data[index + 2] * 0.0722;
    }
  }

  for (let y = 1; y < edge.height - 1; y += 1) {
    for (let x = 1; x < edge.width - 1; x += 1) {
      const i = y * edge.width + x;
      const gx =
        -gray[i - edge.width - 1] -
        2 * gray[i - 1] -
        gray[i + edge.width - 1] +
        gray[i - edge.width + 1] +
        2 * gray[i + 1] +
        gray[i + edge.width + 1];
      const gy =
        -gray[i - edge.width - 1] -
        2 * gray[i - edge.width] -
        gray[i - edge.width + 1] +
        gray[i + edge.width - 1] +
        2 * gray[i + edge.width] +
        gray[i + edge.width + 1];
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      const value = 255 - clamp(magnitude * 1.55, 0, 255);
      const outputIndex = i * 4;
      output.data[outputIndex] = value;
      output.data[outputIndex + 1] = value;
      output.data[outputIndex + 2] = value;
      output.data[outputIndex + 3] = 255;
    }
  }

  edgeContext.putImageData(output, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(edge, 0, 0, canvas.width, canvas.height);
}

function applyStyleTreatment() {
  const style = getStyle().label;
  if (style === "Abstract") applyAbstractOverlay();
  if (style === "Minimalism") applyMinimalTone();
  if (style === "Impressionism" || style === "Plein air" || style === "Alla prima") applyPainterlyMarks();
  if (style === "Expressionism") applyExpressionistTone();
  if (style === "Surrealism") applySurrealTone();
  if (style === "Tonalism") applyTonalism();
  if (style === "Decorative / Folk") applyDecorativeFlattening();
}

function applyAbstractOverlay() {
  ctx.save();
  ctx.globalAlpha = 0.2;
  const palette = styleMap.Abstract.colors;
  for (let i = 0; i < 7; i += 1) {
    ctx.fillStyle = palette[i % palette.length];
    ctx.beginPath();
    const x = (canvas.width / 8) * (i + 0.7);
    const y = i % 2 === 0 ? canvas.height * 0.2 : canvas.height * 0.62;
    ctx.ellipse(x, y, canvas.width * 0.16, canvas.height * 0.09, i * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function applyMinimalTone() {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = "rgba(255, 255, 255, 0.24)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function applyPainterlyMarks() {
  const style = getStyle();
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.lineWidth = Math.max(8, canvas.width * 0.012);
  for (let i = 0; i < 18; i += 1) {
    ctx.strokeStyle = style.colors[i % style.colors.length];
    ctx.beginPath();
    const y = (canvas.height / 20) * (i + 1);
    ctx.moveTo(canvas.width * 0.08, y);
    ctx.bezierCurveTo(canvas.width * 0.28, y - 26, canvas.width * 0.58, y + 34, canvas.width * 0.92, y - 10);
    ctx.stroke();
  }
  ctx.restore();
}

function applyExpressionistTone() {
  ctx.save();
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "rgba(184, 78, 53, 0.22)");
  gradient.addColorStop(1, "rgba(61, 75, 117, 0.2)");
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function applySurrealTone() {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = "rgba(132, 119, 165, 0.16)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function applyTonalism() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const lum = data[i] * 0.28 + data[i + 1] * 0.55 + data[i + 2] * 0.17;
    data[i] = clamp(lum * 0.86 + 28, 0, 255);
    data[i + 1] = clamp(lum * 0.9 + 34, 0, 255);
    data[i + 2] = clamp(lum * 0.78 + 30, 0, 255);
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyDecorativeFlattening() {
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = "rgba(210, 178, 85, 0.12)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(32, 59, 58, 0.32)";
  ctx.lineWidth = Math.max(6, canvas.width * 0.008);
  ctx.strokeRect(canvas.width * 0.035, canvas.height * 0.035, canvas.width * 0.93, canvas.height * 0.93);
  ctx.restore();
}

function drawFallback() {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#3f6276");
  gradient.addColorStop(0.52, "#e5ebe7");
  gradient.addColorStop(1, "#9c4f32");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.84)";
  ctx.fillRect(canvas.width * 0.12, canvas.height * 0.12, canvas.width * 0.76, canvas.height * 0.76);
  ctx.fillStyle = "#20201e";
  ctx.font = "700 32px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Reference loading", canvas.width / 2, canvas.height / 2);
}

function copyPrompt() {
  const text = elements.prompt.value;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      setGenerationStatus("Prompt copied");
    });
    return;
  }

  elements.prompt.select();
  document.execCommand("copy");
  setGenerationStatus("Prompt copied");
}

function downloadCanvas() {
  const link = document.createElement("a");
  link.download = `${makeSlug("reference-studio", getStyle().label, getSubject().label, state.mode)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function exportBrief() {
  const paintability = getPaintabilityAnalysis();
  const payload = {
    exportedAt: new Date().toISOString(),
    title: elements.title.textContent,
    paintability: paintability.score,
    paintabilityBreakdown: paintability.breakdown,
    settings: getSettings(),
    palette: {
      name: getCurrentPalette().name,
      colors: getCurrentPalette().colors,
    },
    prompt: elements.prompt.value,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.download = `${makeSlug("reference-brief", getStyle().label, getSubject().label)}.json`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
  setGenerationStatus("Brief exported");
}

function saveCurrentReference() {
  const item = {
    id: Date.now(),
    title: elements.title.textContent,
    style: getStyle().label,
    subject: getSubject().label,
    mode: titleCase(state.mode),
    prompt: elements.prompt.value,
    thumb: makeThumbnail(),
    settings: getSettings(),
  };

  state.saved = [item, ...state.saved].slice(0, 12);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.saved));
  renderSaved();
  setGenerationStatus("Saved");
}

function makeThumbnail() {
  const thumb = document.createElement("canvas");
  const ratio = canvas.width / canvas.height;
  thumb.width = 360;
  thumb.height = Math.max(220, Math.round(thumb.width / ratio));
  const thumbContext = thumb.getContext("2d");
  thumbContext.drawImage(canvas, 0, 0, thumb.width, thumb.height);
  return thumb.toDataURL("image/jpeg", 0.72);
}

function renderSaved() {
  elements.savedGrid.innerHTML = "";

  if (!state.saved.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No saved references yet";
    elements.savedGrid.append(empty);
    return;
  }

  state.saved.forEach((item) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "saved-card";
    card.innerHTML = `
      <img src="${item.thumb}" alt="${escapeHtml(item.title)} preview" />
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.mode)} study</span>
    `;
    card.addEventListener("click", () => {
      markCriteriaChanged();
      if (item.settings) applySettings(item.settings);
      elements.prompt.value = item.prompt;
      setGenerationStatus("Saved reference loaded");
    });
    elements.savedGrid.append(card);
  });
}

function clearSaved() {
  state.saved = [];
  localStorage.removeItem(STORAGE_KEY);
  renderSaved();
  setGenerationStatus("Saved cleared");
}

function getSettings() {
  return {
    subject: getSubject().label,
    style: getStyle().label,
    purpose: elements.purpose.value,
    lighting: elements.lighting.value,
    mood: elements.mood.value,
    composition: elements.composition.value,
    camera: elements.camera.value,
    color: elements.color.value,
    pose: elements.pose.value,
    detail: Number(document.querySelector("#detailRange").value),
    contrast: Number(document.querySelector("#contrastRange").value),
    background: Number(document.querySelector("#backgroundRange").value),
    abstraction: Number(document.querySelector("#abstractionRange").value),
    requirements: elements.requirements.value,
    guardrails: Array.from(document.querySelectorAll(".guardrails input:checked")).map((input) => input.value),
  };
}

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function getSubject() {
  return subjectMap[state.selected.subject] || subjects[0];
}

function getStyle() {
  return styleMap[state.selected.style] || styles[0];
}

function getRangeLabel(id) {
  const range = document.querySelector(`#${id}`);
  return rangeLabels[id][Number(range.value)];
}

function setSelectValue(select, value) {
  if (!value) return;
  const option = Array.from(select.options).find((item) => item.value === value || item.textContent === value);
  if (option) select.value = option.value;
}

function randomSelect(select) {
  select.selectedIndex = Math.floor(Math.random() * select.options.length);
}

function titleCase(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function makeSlug(...parts) {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  const units = ["bytes", "KB", "MB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 || unitIndex === 0 ? Math.round(value) : value.toFixed(1)} ${units[unitIndex]}`;
}

function uniqueColors(colors) {
  const seen = new Set();
  return colors.filter((color) => {
    if (seen.has(color)) return false;
    seen.add(color);
    return true;
  });
}

function completePalette(colors, targetCount) {
  if (!colors.length) return [];
  const palette = colors.slice(0, targetCount);
  let cursor = 0;

  while (palette.length < targetCount) {
    const base = colors[cursor % colors.length];
    const amount = palette.length % 2 === 0 ? 22 : -24;
    palette.push(adjustHexColor(base, amount));
    cursor += 1;
  }

  return palette;
}

function adjustHexColor(hex, amount) {
  const value = hex.replace("#", "");
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  return rgbToHex(red + amount, green + amount, blue + amount);
}

function getSaturation(red, green, blue) {
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  if (max === 0) return 0;
  return (max - min) / max;
}

function getHue(red, green, blue) {
  const normalizedRed = red / 255;
  const normalizedGreen = green / 255;
  const normalizedBlue = blue / 255;
  const max = Math.max(normalizedRed, normalizedGreen, normalizedBlue);
  const min = Math.min(normalizedRed, normalizedGreen, normalizedBlue);
  const delta = max - min;

  if (delta === 0) return 0;
  if (max === normalizedRed) return ((normalizedGreen - normalizedBlue) / delta + (normalizedGreen < normalizedBlue ? 6 : 0)) * 60;
  if (max === normalizedGreen) return ((normalizedBlue - normalizedRed) / delta + 2) * 60;
  return ((normalizedRed - normalizedGreen) / delta + 4) * 60;
}

function getLuminance(red, green, blue) {
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function average(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function standardDeviation(values, mean) {
  const variance = values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function percentileSorted(values, percentile) {
  if (!values.length) return 0;
  const index = clamp((values.length - 1) * percentile, 0, values.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return values[lower] * (1 - weight) + values[upper] * weight;
}

function scoreBand(value, min, max, falloff) {
  if (value >= min && value <= max) return 100;
  const distance = value < min ? min - value : value - max;
  return clamp(100 - (distance / falloff) * 100, 0, 100);
}

function rgbToHex(red, green, blue) {
  return [red, green, blue]
    .map((channel) => Math.round(clamp(channel, 0, 255)).toString(16).padStart(2, "0"))
    .join("")
    .replace(/^/, "#");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
