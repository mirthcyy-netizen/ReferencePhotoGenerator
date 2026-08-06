from http.server import BaseHTTPRequestHandler
import json
from pathlib import Path
import sys


ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from server import BadRequestError, MissingApiKeyError, OpenAIRequestError, generate_reference_image


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
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

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

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
