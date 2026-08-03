from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import base64
import binascii
import json
import os
from pathlib import Path
import time
import uuid
from urllib import error, request


ROOT_DIR = Path(__file__).resolve().parent
ENV_FILE_PATH = ROOT_DIR / ".env"


def load_local_env(path, override=False):
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except FileNotFoundError:
        return False

    for raw_line in lines:
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue

        if line.startswith("export "):
            line = line[len("export ") :].strip()

        if "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()

        if not key:
            continue

        if len(value) >= 2 and value[0] == value[-1] and value[0] in {'"', "'"}:
            value = value[1:-1]

        if override or key not in os.environ:
            os.environ[key] = value

    return True


load_local_env(ENV_FILE_PATH)

HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "5174"))
OPENAI_IMAGES_ENDPOINT = "https://api.openai.com/v1/images/generations"
OPENAI_IMAGE_EDITS_ENDPOINT = "https://api.openai.com/v1/images/edits"
OPENAI_IMAGE_MODEL = os.environ.get("OPENAI_IMAGE_MODEL", "gpt-image-1")
OPENAI_IMAGE_QUALITY = os.environ.get("OPENAI_IMAGE_QUALITY", "medium")
OPENAI_TIMEOUT_SECONDS = int(os.environ.get("OPENAI_TIMEOUT_SECONDS", "180"))
ALLOWED_IMAGE_SIZES = {"1024x1024", "1024x1536", "1536x1024", "auto"}


class ReferenceStudioHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "application/javascript",
        ".css": "text/css",
        ".png": "image/png",
        ".json": "application/json",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        if self.path.split("?", 1)[0] == "/api/status":
            self.write_json(200, api_status())
            return
        super().do_GET()

    def do_POST(self):
        if self.path != "/api/generate":
            self.send_error(404, "Not found")
            return

        try:
            payload = self.read_json_body()
            result = generate_reference_image(payload)
            self.write_json(200, result)
        except MissingApiKeyError as exc:
            self.write_json(503, {"error": str(exc), "requiresApiKey": True})
        except BadRequestError as exc:
            self.write_json(400, {"error": str(exc)})
        except OpenAIRequestError as exc:
            self.write_json(502, {"error": str(exc)})
        except Exception as exc:
            self.write_json(500, {"error": f"Unexpected generation error: {exc}"})

    def read_json_body(self):
        content_length = int(self.headers.get("Content-Length", "0"))
        if content_length <= 0:
            raise BadRequestError("Missing request body.")

        raw_body = self.rfile.read(content_length)
        try:
            return json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError as exc:
            raise BadRequestError("Request body must be valid JSON.") from exc

    def write_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


class MissingApiKeyError(Exception):
    pass


class BadRequestError(Exception):
    pass


class OpenAIRequestError(Exception):
    pass


def generate_reference_image(payload):
    api_key = get_openai_api_key()
    if not api_key:
        raise MissingApiKeyError(
            "Add a real OPENAI_API_KEY to .env in the ReferencePhotoGen folder, then restart the server to generate new reference photos."
        )

    prompt = str(payload.get("prompt", "")).strip()
    if not prompt:
        raise BadRequestError("A prompt is required.")

    request_id = str(payload.get("requestId", int(time.time() * 1000)))
    size = str(payload.get("size", "1024x1024"))
    if size not in ALLOWED_IMAGE_SIZES:
        size = "1024x1024"

    source_image_data_urls = source_data_urls_from_payload(payload)
    source_images = [data_url_to_image(data_url, index) for index, data_url in enumerate(source_image_data_urls, start=1)]

    final_prompt = build_generation_prompt(prompt, request_id, source_image_count=len(source_images))
    openai_payload = {
        "model": OPENAI_IMAGE_MODEL,
        "prompt": final_prompt,
        "n": 1,
        "size": size,
        "quality": OPENAI_IMAGE_QUALITY,
        "background": "opaque",
        "output_format": "png",
    }

    if source_images:
        openai_payload["input_fidelity"] = str(payload.get("inputFidelity", "high"))
        api_response = post_openai_multipart(api_key, openai_payload, source_images)
    else:
        api_response = post_openai_json(api_key, openai_payload)

    image = first_image(api_response)
    image_data_url = image_to_data_url(image)

    return {
        "imageDataUrl": image_data_url,
        "created": api_response.get("created"),
        "model": OPENAI_IMAGE_MODEL,
        "size": api_response.get("size") or size,
        "quality": api_response.get("quality") or OPENAI_IMAGE_QUALITY,
        "requestId": request_id,
        "revisedPrompt": image.get("revised_prompt"),
        "sourceRequestId": str(payload.get("sourceRequestId", "")),
        "variationType": str(payload.get("variationType", "")),
        "uploadOperation": str(payload.get("uploadOperation", "")),
        "sourceImageCount": len(source_images),
    }


def get_openai_api_key():
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()

    if not api_key or is_placeholder_api_key(api_key):
        load_local_env(ENV_FILE_PATH, override=bool(api_key))
        api_key = os.environ.get("OPENAI_API_KEY", "").strip()

    if not api_key or is_placeholder_api_key(api_key):
        return ""

    return api_key


def is_placeholder_api_key(api_key):
    placeholder_tokens = ("your-api-key", "replace-me", "sk-your-api-key-here")
    return any(token in api_key.lower() for token in placeholder_tokens)


def api_status():
    return {
        "openaiApiKeyConfigured": bool(get_openai_api_key()),
        "envFilePresent": ENV_FILE_PATH.exists(),
        "model": OPENAI_IMAGE_MODEL,
        "quality": OPENAI_IMAGE_QUALITY,
        "port": PORT,
    }


def source_data_urls_from_payload(payload):
    data_urls = []
    source_image_data_urls = payload.get("sourceImageDataUrls")

    if isinstance(source_image_data_urls, list):
        data_urls.extend(str(data_url).strip() for data_url in source_image_data_urls if str(data_url).strip())

    source_image_data_url = str(payload.get("sourceImageDataUrl", "")).strip()
    if source_image_data_url:
        data_urls.append(source_image_data_url)

    unique_data_urls = []
    seen = set()
    for data_url in data_urls:
        if data_url in seen:
            continue
        seen.add(data_url)
        unique_data_urls.append(data_url)

    if len(unique_data_urls) > 6:
        raise BadRequestError("Use up to 6 source photos for one edit.")

    return unique_data_urls


def build_generation_prompt(prompt, request_id, source_image_count=0):
    instructions = [
        prompt,
        "",
        "Generate a brand-new image for this request. Do not reuse or copy any previous generation.",
        f"Variation request id: {request_id}.",
    ]

    if source_image_count == 1:
        instructions.append(
            "Use the provided source photograph as the visual anchor; preserve the requested subject identity, pose, lighting logic, and camera realism unless the prompt explicitly asks for a change."
        )
    elif source_image_count > 1:
        instructions.append(
            "Use the provided source photographs as visual anchors; combine or edit them only as the prompt requests, with coherent perspective, scale, lighting, and photographic realism."
        )

    instructions.extend(
        [
            "The output must be a realistic source photograph for artists to paint from.",
            "Do not create a painting, illustration, sketch, concept art, 3D render, or painterly/stylized image.",
            "Avoid brushstrokes, canvas texture, watercolor effects, oil paint effects, ink outlines, pastel texture, and gallery-art presentation.",
            "No text, no signature, no logo, no watermark.",
        ]
    )
    return "\n".join(instructions)


def post_openai_json(api_key, payload):
    body = json.dumps(payload).encode("utf-8")
    api_request = request.Request(
        OPENAI_IMAGES_ENDPOINT,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )

    try:
        with request.urlopen(api_request, timeout=OPENAI_TIMEOUT_SECONDS) as response:
            return json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        message = read_openai_error(exc)
        raise OpenAIRequestError(message) from exc
    except error.URLError as exc:
        raise OpenAIRequestError(f"Could not reach OpenAI image generation: {exc.reason}") from exc


def post_openai_multipart(api_key, payload, source_images):
    boundary = f"ReferenceStudio{uuid.uuid4().hex}"
    body = build_multipart_body(boundary, payload, source_images)
    api_request = request.Request(
        OPENAI_IMAGE_EDITS_ENDPOINT,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
    )

    try:
        with request.urlopen(api_request, timeout=OPENAI_TIMEOUT_SECONDS) as response:
            return json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        message = read_openai_error(exc)
        raise OpenAIRequestError(message) from exc
    except error.URLError as exc:
        raise OpenAIRequestError(f"Could not reach OpenAI image variation: {exc.reason}") from exc


def build_multipart_body(boundary, fields, source_images):
    parts = []
    for key, value in fields.items():
        parts.append(
            (
                f"--{boundary}\r\n"
                f'Content-Disposition: form-data; name="{key}"\r\n\r\n'
                f"{value}\r\n"
            ).encode("utf-8")
        )

    if isinstance(source_images, tuple):
        source_images = [source_images]

    image_field_name = "image" if len(source_images) == 1 else "image[]"
    for filename, content_type, image_bytes in source_images:
        parts.append(
            (
                f"--{boundary}\r\n"
                f'Content-Disposition: form-data; name="{image_field_name}"; filename="{filename}"\r\n'
                f"Content-Type: {content_type}\r\n\r\n"
            ).encode("utf-8")
            + image_bytes
            + b"\r\n"
        )
    parts.append(f"--{boundary}--\r\n".encode("utf-8"))
    return b"".join(parts)


def data_url_to_image(data_url, index=1):
    if not data_url.startswith("data:") or "," not in data_url:
        raise BadRequestError("Source image must be a base64 data URL.")

    header, encoded = data_url.split(",", 1)
    if ";base64" not in header:
        raise BadRequestError("Source image must be base64 encoded.")

    content_type = (header[5:].split(";", 1)[0] or "image/png").lower()
    extensions = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
    }
    if content_type not in extensions:
        raise BadRequestError("Source image must be a PNG, JPEG, or WEBP file.")

    try:
        image_bytes = base64.b64decode(encoded, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise BadRequestError("Source image could not be decoded.") from exc

    if not image_bytes:
        raise BadRequestError("Source image is empty.")

    extension = extensions[content_type]
    return (f"reference-source-{index}.{extension}", content_type, image_bytes)


def read_openai_error(exc):
    try:
        body = exc.read().decode("utf-8")
        payload = json.loads(body)
        api_error = payload.get("error", {})
        return api_error.get("message") or body
    except Exception:
        return f"OpenAI image generation failed with HTTP {exc.code}."


def first_image(api_response):
    images = api_response.get("data") or []
    if not images:
        raise OpenAIRequestError("OpenAI returned no generated image.")
    return images[0]


def image_to_data_url(image):
    b64_json = image.get("b64_json")
    if b64_json:
        return f"data:image/png;base64,{b64_json}"

    image_url = image.get("url")
    if image_url:
        return url_to_data_url(image_url)

    raise OpenAIRequestError("OpenAI returned an image without base64 data or URL.")


def url_to_data_url(image_url):
    try:
        with request.urlopen(image_url, timeout=OPENAI_TIMEOUT_SECONDS) as response:
            content_type = response.headers.get("Content-Type", "image/png")
            encoded = base64.b64encode(response.read()).decode("ascii")
            return f"data:{content_type};base64,{encoded}"
    except error.URLError as exc:
        raise OpenAIRequestError(f"Generated image URL could not be fetched: {exc.reason}") from exc


def main():
    server = ThreadingHTTPServer((HOST, PORT), ReferenceStudioHandler)
    print(f"Reference Studio running at http://{HOST}:{PORT}")
    if not get_openai_api_key():
        print("OPENAI_API_KEY is not set; add a real key to .env, then restart the server.")
    else:
        print("OPENAI_API_KEY is configured; live reference photo generation is enabled.")
    server.serve_forever()


if __name__ == "__main__":
    main()
