import base64
import html
import json
import os
import re
import socket
import subprocess
import sys
import tempfile
import threading
import unittest
import zlib
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import server as reference_server


CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


def make_png_data_url(red, green, blue, size=24):
    raw_rows = []
    pixel = bytes([red, green, blue])
    for _ in range(size):
        raw_rows.append(b"\x00" + pixel * size)
    raw = b"".join(raw_rows)

    def chunk(kind, data):
        body = kind + data
        checksum = zlib.crc32(body) & 0xFFFFFFFF
        return len(data).to_bytes(4, "big") + body + checksum.to_bytes(4, "big")

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", size.to_bytes(4, "big") + size.to_bytes(4, "big") + b"\x08\x02\x00\x00\x00")
    png += chunk(b"IDAT", zlib.compress(raw))
    png += chunk(b"IEND", b"")
    return "data:image/png;base64," + base64.b64encode(png).decode("ascii")


def free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def extract_probe_json(dom):
    match = re.search(r'<pre id="output">(?P<json>.*?)</pre>', dom, re.S)
    if not match:
        raise AssertionError(f"Probe output was not found in Chrome DOM:\n{dom[-1200:]}")
    return json.loads(html.unescape(match.group("json")))


class MockGenerationHandler(SimpleHTTPRequestHandler):
    requests = []
    generation_count = 0
    main_count = 0

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_POST(self):
        if self.path != "/api/generate":
            self.send_error(404, "Not found")
            return

        content_length = int(self.headers.get("Content-Length", "0"))
        payload = json.loads(self.rfile.read(content_length).decode("utf-8"))
        type(self).requests.append(payload)
        type(self).generation_count += 1
        variation_type = payload.get("variationType")
        variation_colors = {
            "lighting": (36, 64, 224),
            "palette": (224, 176, 36),
            "background": (36, 164, 148),
            "composition": (168, 64, 204),
        }

        if payload.get("uploadOperation"):
            image_data_url = make_png_data_url(64, 76, 224)
        elif variation_type in variation_colors:
            image_data_url = make_png_data_url(*variation_colors[variation_type])
        else:
            type(self).main_count += 1
            image_data_url = (
                make_png_data_url(224, 36, 36)
                if type(self).main_count == 1
                else make_png_data_url(42, 212, 76)
            )

        self.write_json(
            200,
            {
                "imageDataUrl": image_data_url,
                "model": "mock-image-model",
                "requestId": payload["requestId"],
                "size": payload["size"],
                "quality": "test",
            },
        )

    def do_GET(self):
        if self.path == "/test/requests":
            self.write_json(200, type(self).requests)
            return
        super().do_GET()

    def write_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *_args):
        return


class BrowserGenerateFlowTests(unittest.TestCase):
    def setUp(self):
        if not Path(CHROME).exists():
            self.skipTest("Google Chrome is not installed at the expected path.")

        MockGenerationHandler.requests = []
        MockGenerationHandler.generation_count = 0
        MockGenerationHandler.main_count = 0
        self.port = free_port()
        handler = partial(MockGenerationHandler, directory=str(ROOT))
        self.server = ThreadingHTTPServer(("127.0.0.1", self.port), handler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)

    def test_generate_button_uses_api_response_for_each_new_reference(self):
        completed = subprocess.run(
            [
                CHROME,
                "--headless=new",
                "--disable-gpu",
                "--virtual-time-budget=5000",
                "--dump-dom",
                f"http://127.0.0.1:{self.port}/tests/browser_generate_probe.html",
            ],
            check=True,
            capture_output=True,
            text=True,
            timeout=20,
        )

        result = extract_probe_json(completed.stdout)

        self.assertEqual(result["requestCount"], 1)
        self.assertIn("Generated new reference", result["firstStatus"])
        self.assertIn("Generated new reference", result["statusAfterPausedClick"])
        self.assertEqual(result["notice"], result["statusAfterPausedClick"])
        self.assertGreater(result["firstPixel"][0], 180)
        self.assertLess(result["firstPixel"][1], 120)
        self.assertLessEqual(result["firstCanvasChannelRange"], 1)
        self.assertGreater(result["pixelAfterPausedClick"][0], 180)
        self.assertLess(result["pixelAfterPausedClick"][1], 120)
        self.assertEqual(result["firstPalette"]["name"], "Current reference colors")
        self.assertEqual(result["firstPalette"]["colors"][0], "#e02424")
        self.assertLess(result["firstPaintability"]["score"], 60)
        self.assertEqual(result["firstPaintability"]["label"], "Simplify first")
        self.assertLess(result["firstPaintability"]["breakdown"]["value"], 20)
        self.assertLess(result["firstPaintability"]["breakdown"]["clarity"], 20)
        self.assertIn("composition", result["firstPaintability"]["breakdown"])
        self.assertIn("color", result["firstPaintability"]["breakdown"])
        self.assertEqual(len(set(result["requestIds"])), 1)
        self.assertEqual(result["sizes"], ["1536x1024"])
        self.assertEqual(result["hasSourceImages"], [False])
        self.assertIn("Guided for seascape", result["guidedState"]["status"])
        self.assertIn("Plein air", result["guidedState"]["styles"])
        self.assertIn("Tonalism", result["guidedState"]["styles"])
        self.assertNotIn("Decorative / Folk", result["guidedState"]["styles"])
        self.assertIn("Golden surf study", result["guidedState"]["presets"])
        self.assertIn("Storm coast", result["guidedState"]["presets"])
        self.assertIn("Low-tide rocks", result["guidedState"]["presets"])
        self.assertNotIn("Rembrandt portrait", result["guidedState"]["presets"])
        self.assertNotIn("Dramatic figure", result["guidedState"]["presets"])
        self.assertIn("Storm-filtered light", result["guidedState"]["lighting"])
        self.assertNotIn("Candlelight", result["guidedState"]["lighting"])
        self.assertIn("Shoreline diagonal", result["guidedState"]["composition"])
        self.assertIn("Breaking wave rhythm", result["guidedState"]["pose"])

        self.assertFalse(any(card["hasImage"] for card in result["cardsAfterGenerate"]))
        self.assertTrue(all(card["disabled"] for card in result["cardsAfterGenerate"]))
        self.assertTrue(all(card["state"] == "Variations paused" for card in result["cardsAfterGenerate"]))
        self.assertFalse(any(card["hasImage"] for card in result["cardsAfterPausedClick"]))
        self.assertTrue(all(card["disabled"] for card in result["cardsAfterPausedClick"]))

        self.assertEqual(len(MockGenerationHandler.requests), 1)
        for request_payload in MockGenerationHandler.requests:
            self.assertIn("Generate a realistic reference photograph", request_payload["prompt"])
            self.assertIn("not a painting", request_payload["prompt"])
            self.assertNotIn("painting-ready reference photo", request_payload["prompt"])
            self.assertNotIn("elderly woman", request_payload["prompt"])
            self.assertNotIn("ceramic cup", request_payload["prompt"])
            self.assertIn("Constraints:", request_payload["prompt"])
            self.assertEqual(request_payload["settings"]["requirements"], "")
            self.assertEqual(request_payload["settings"]["subject"], "Seascape")
            self.assertEqual(request_payload["settings"]["style"], "Plein air")
            self.assertEqual(request_payload["settings"]["lighting"], "Dramatic side light")

        self.assertNotIn("sourceImageDataUrl", MockGenerationHandler.requests[0])
        self.assertEqual(
            [request_payload["variationType"] for request_payload in MockGenerationHandler.requests],
            [""],
        )

    def test_upload_tab_sends_photos_for_similar_reference(self):
        completed = subprocess.run(
            [
                CHROME,
                "--headless=new",
                "--disable-gpu",
                "--virtual-time-budget=7000",
                "--dump-dom",
                f"http://127.0.0.1:{self.port}/tests/browser_upload_probe.html",
            ],
            check=True,
            capture_output=True,
            text=True,
            timeout=20,
        )

        result = extract_probe_json(completed.stdout)

        self.assertEqual(result["activeTab"], "true")
        self.assertEqual(result["photoCount"], 2)
        self.assertIn("Generated similar reference", result["status"])
        self.assertTrue(result["resultVisible"])
        self.assertFalse(result["removedControlsPresent"])
        self.assertIn("Generate a similar reference photo", result["prompt"])
        self.assertIn("keep the red cup color relationship", result["prompt"])
        self.assertNotIn("Combine uploaded photos", result["prompt"])
        self.assertNotIn("Remove the background", result["prompt"])
        self.assertNotIn("Change part", result["prompt"])
        self.assertEqual(result["requestCount"], 1)

        request_payload = result["requestPayload"]
        self.assertEqual(request_payload["uploadOperation"], "similar")
        self.assertEqual(request_payload["sourceCount"], 2)
        self.assertFalse(request_payload["hasLegacySource"])
        self.assertEqual(request_payload["size"], "auto")
        self.assertEqual(request_payload["inputFidelity"], "high")
        self.assertEqual(request_payload["settings"]["sourcePhotoCount"], 2)
        self.assertEqual(request_payload["settings"]["uploadOperation"], "similar")
        self.assertIn("realistic reference photograph", request_payload["prompt"])
        self.assertIn("not create a painting", request_payload["prompt"])


class ServerGenerationContractTests(unittest.TestCase):
    def test_load_local_env_reads_dotenv_without_overwriting_existing_values(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            env_path = Path(temp_dir) / ".env"
            env_path.write_text(
                "\n".join(
                    [
                        "# Local developer settings",
                        "OPENAI_API_KEY='test-local-key'",
                        "export OPENAI_TIMEOUT_SECONDS=42",
                        "OPENAI_IMAGE_QUALITY=low",
                    ]
                ),
                encoding="utf-8",
            )

            with patch.dict(os.environ, {"OPENAI_IMAGE_QUALITY": "high"}, clear=True):
                loaded = reference_server.load_local_env(env_path)

                self.assertTrue(loaded)
                self.assertEqual(os.environ["OPENAI_API_KEY"], "test-local-key")
                self.assertEqual(os.environ["OPENAI_TIMEOUT_SECONDS"], "42")
                self.assertEqual(os.environ["OPENAI_IMAGE_QUALITY"], "high")

    def test_load_local_env_missing_file_returns_false(self):
        missing_env_path = ROOT / ".definitely-missing-env"

        with patch.dict(os.environ, {}, clear=True):
            self.assertFalse(reference_server.load_local_env(missing_env_path))
            self.assertNotIn("OPENAI_API_KEY", os.environ)

    def test_placeholder_api_key_is_not_configured(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            missing_env_path = Path(temp_dir) / ".env"

            with patch.object(reference_server, "ENV_FILE_PATH", missing_env_path):
                with patch.dict(os.environ, {"OPENAI_API_KEY": "sk-your-api-key-here"}, clear=True):
                    self.assertEqual(reference_server.get_openai_api_key(), "")
                    self.assertFalse(reference_server.api_status()["openaiApiKeyConfigured"])

    def test_get_openai_api_key_reloads_dotenv_after_server_start(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            env_path = Path(temp_dir) / ".env"
            env_path.write_text("OPENAI_API_KEY=test-late-key", encoding="utf-8")

            with patch.object(reference_server, "ENV_FILE_PATH", env_path):
                with patch.dict(os.environ, {}, clear=True):
                    self.assertEqual(reference_server.get_openai_api_key(), "test-late-key")

    def test_get_openai_api_key_replaces_placeholder_from_dotenv(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            env_path = Path(temp_dir) / ".env"
            env_path.write_text("OPENAI_API_KEY=test-real-key", encoding="utf-8")

            with patch.object(reference_server, "ENV_FILE_PATH", env_path):
                with patch.dict(os.environ, {"OPENAI_API_KEY": "sk-your-api-key-here"}, clear=True):
                    self.assertEqual(reference_server.get_openai_api_key(), "test-real-key")

    def test_api_status_reports_safe_setup_state(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            env_path = Path(temp_dir) / ".env"
            env_path.write_text("OPENAI_API_KEY=test-local-key", encoding="utf-8")

            with patch.object(reference_server, "ENV_FILE_PATH", env_path):
                with patch.dict(os.environ, {"OPENAI_API_KEY": "test-local-key"}, clear=True):
                    status = reference_server.api_status()

        self.assertTrue(status["openaiApiKeyConfigured"])
        self.assertTrue(status["envFilePresent"])
        self.assertEqual(status["model"], reference_server.OPENAI_IMAGE_MODEL)
        self.assertEqual(status["port"], reference_server.PORT)

    def test_missing_api_key_is_explicit(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            missing_env_path = Path(temp_dir) / ".env"

            with patch.object(reference_server, "ENV_FILE_PATH", missing_env_path):
                with patch.dict(os.environ, {}, clear=True):
                    with self.assertRaises(reference_server.MissingApiKeyError) as context:
                        reference_server.generate_reference_image({"prompt": "portrait", "requestId": "missing-key"})
        self.assertIn("OPENAI_API_KEY", str(context.exception))

    def test_openai_payload_requests_fresh_image_and_returns_data_url(self):
        image_b64 = base64.b64encode(b"fake png bytes").decode("ascii")

        with patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"}, clear=True):
            with patch.object(reference_server, "post_openai_json") as post_openai_json:
                post_openai_json.return_value = {
                    "created": 123,
                    "data": [{"b64_json": image_b64, "revised_prompt": "revised prompt"}],
                }

                result = reference_server.generate_reference_image(
                    {"prompt": "Paintable portrait", "size": "1536x1024", "requestId": "fresh-123"}
                )

        api_key, payload = post_openai_json.call_args.args
        self.assertEqual(api_key, "test-key")
        self.assertEqual(payload["size"], "1536x1024")
        self.assertEqual(payload["output_format"], "png")
        self.assertIn("fresh-123", payload["prompt"])
        self.assertIn("brand-new image", payload["prompt"])
        self.assertIn("realistic source photograph", payload["prompt"])
        self.assertIn("Do not create a painting", payload["prompt"])
        self.assertEqual(result["imageDataUrl"], f"data:image/png;base64,{image_b64}")
        self.assertEqual(result["requestId"], "fresh-123")
        self.assertEqual(result["revisedPrompt"], "revised prompt")
        self.assertEqual(result["variationType"], "")

    def test_openai_variation_uses_source_image_edit_request(self):
        source_data_url = make_png_data_url(42, 212, 76)
        output_b64 = base64.b64encode(b"variation png bytes").decode("ascii")

        with patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"}, clear=True):
            with patch.object(reference_server, "post_openai_multipart") as post_openai_multipart:
                with patch.object(reference_server, "post_openai_json") as post_openai_json:
                    post_openai_multipart.return_value = {
                        "created": 456,
                        "data": [{"b64_json": output_b64, "revised_prompt": "variation prompt"}],
                    }

                    result = reference_server.generate_reference_image(
                        {
                            "prompt": "Paintable portrait\nVariation request: change light only",
                            "size": "1024x1536",
                            "requestId": "variation-123",
                            "variationType": "lighting",
                            "sourceRequestId": "main-123",
                            "sourceImageDataUrl": source_data_url,
                        }
                    )

        post_openai_json.assert_not_called()
        api_key, payload, source_images = post_openai_multipart.call_args.args
        self.assertEqual(len(source_images), 1)
        filename, content_type, image_bytes = source_images[0]
        self.assertEqual(api_key, "test-key")
        self.assertEqual(payload["size"], "1024x1536")
        self.assertEqual(payload["input_fidelity"], "high")
        self.assertIn("variation-123", payload["prompt"])
        self.assertIn("provided source photograph", payload["prompt"])
        self.assertIn("Do not create a painting", payload["prompt"])
        self.assertEqual(filename, "reference-source-1.png")
        self.assertEqual(content_type, "image/png")
        self.assertGreater(len(image_bytes), 0)
        self.assertEqual(result["imageDataUrl"], f"data:image/png;base64,{output_b64}")
        self.assertEqual(result["sourceRequestId"], "main-123")
        self.assertEqual(result["variationType"], "lighting")
        self.assertEqual(result["sourceImageCount"], 1)

    def test_uploaded_similar_reference_can_send_multiple_source_images(self):
        source_data_url_a = make_png_data_url(42, 212, 76)
        source_data_url_b = make_png_data_url(212, 42, 76)
        output_b64 = base64.b64encode(b"similar png bytes").decode("ascii")

        with patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"}, clear=True):
            with patch.object(reference_server, "post_openai_multipart") as post_openai_multipart:
                post_openai_multipart.return_value = {
                    "created": 789,
                    "data": [{"b64_json": output_b64, "revised_prompt": "similar prompt"}],
                }

                result = reference_server.generate_reference_image(
                    {
                        "prompt": "Generate a similar reference photo from uploaded photos",
                        "size": "auto",
                        "requestId": "upload-123",
                        "uploadOperation": "similar",
                        "sourceImageDataUrls": [source_data_url_a, source_data_url_b],
                        "inputFidelity": "low",
                    }
                )

        api_key, payload, source_images = post_openai_multipart.call_args.args
        self.assertEqual(api_key, "test-key")
        self.assertEqual(payload["size"], "auto")
        self.assertEqual(payload["input_fidelity"], "low")
        self.assertIn("upload-123", payload["prompt"])
        self.assertIn("provided source photographs", payload["prompt"])
        self.assertEqual(len(source_images), 2)
        self.assertEqual(source_images[0][0], "reference-source-1.png")
        self.assertEqual(source_images[1][0], "reference-source-2.png")
        self.assertEqual(result["imageDataUrl"], f"data:image/png;base64,{output_b64}")
        self.assertEqual(result["uploadOperation"], "similar")
        self.assertEqual(result["sourceImageCount"], 2)

    def test_multipart_body_uses_image_array_for_multiple_sources(self):
        source_a = reference_server.data_url_to_image(make_png_data_url(1, 2, 3), 1)
        source_b = reference_server.data_url_to_image(make_png_data_url(4, 5, 6), 2)

        body = reference_server.build_multipart_body("TestBoundary", {"prompt": "combine"}, [source_a, source_b])

        self.assertIn(b'name="prompt"', body)
        self.assertEqual(body.count(b'name="image[]"'), 2)
        self.assertNotIn(b'name="image";', body)

    def test_invalid_size_falls_back_to_square(self):
        image_b64 = base64.b64encode(b"fake png bytes").decode("ascii")

        with patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"}, clear=True):
            with patch.object(reference_server, "post_openai_json") as post_openai_json:
                post_openai_json.return_value = {"data": [{"b64_json": image_b64}]}
                result = reference_server.generate_reference_image(
                    {"prompt": "Paintable still life", "size": "777x777", "requestId": "bad-size"}
                )

        _api_key, payload = post_openai_json.call_args.args
        self.assertEqual(payload["size"], "1024x1024")
        self.assertEqual(result["size"], "1024x1024")


if __name__ == "__main__":
    unittest.main()
