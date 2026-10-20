"""Buildless preview: serve docs at / and source Markdown at /md/."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]

class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        clean = unquote(urlsplit(path).path)
        base = ROOT / 'md' if clean.startswith('/md/') else ROOT / 'docs'
        relative = clean[4:] if clean.startswith('/md/') else clean.lstrip('/')
        target = (base / relative).resolve()
        return str(target if target.is_relative_to(base.resolve()) else base / '__not_found__')

if __name__ == '__main__':
    print('Preview: http://127.0.0.1:8765/', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8765), Handler).serve_forever()
