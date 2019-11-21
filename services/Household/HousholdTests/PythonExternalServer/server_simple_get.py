from http.server import HTTPServer, BaseHTTPRequestHandler
import sys

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"data_loaded_from_external_server")


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

httpd = HTTPServer(('localhost', port), SimpleHTTPRequestHandler)
httpd.serve_forever()
