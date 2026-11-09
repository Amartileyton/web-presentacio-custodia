import base64
import os
import re

def bundle():
    # 1. Base64 de la imatge PGME_claro.png
    with open('PGME_claro.png', 'rb') as f:
        img_b64 = base64.b64encode(f.read()).decode('utf-8')
    data_uri = f'data:image/png;base64,{img_b64}'

    # 2. Llegir CSS i JS
    with open('css/styles.css', 'r', encoding='utf-8') as f:
        css_content = f.read()

    with open('js/app.js', 'r', encoding='utf-8') as f:
        js_content = f.read()

    # 3. Llegir index.html
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # 4. Reemplaçar les imatges per data_uri (si no ho estan ja)
    html = re.sub(r'src=["\'](?:assets/)?PGME_claro\.png["\']', f'src="{data_uri}"', html)
    html = re.sub(r'onerror=["\'][^"\']+["\']', '', html)

    # 5. Reemplaçar els estils CSS usant replace exacte (evita corrupció de backslashes per re.sub)
    css_tag = f'<style>\n{css_content}\n  </style>'
    if '<link rel="stylesheet" href="css/styles.css">' in html:
        html = html.replace('<link rel="stylesheet" href="css/styles.css">', css_tag)
    elif '<style>' in html and '</style>' in html:
        # Trobar posició del primer estil i substituir
        s_start = html.find('<style>')
        s_end = html.find('</style>', s_start) + len('</style>')
        html = html[:s_start] + css_tag + html[s_end:]
    else:
        html = html.replace('</head>', f'{css_tag}\n</head>')

    # 6. Reemplaçar el script de l'aplicació usant replace exacte (evita corrupció de \\n per re.sub)
    js_tag = f'<script>\n{js_content}\n  </script>'
    if '<script src="js/app.js"></script>' in html:
        html = html.replace('<script src="js/app.js"></script>', js_tag)
    else:
        html = html.replace('</body>', f'{js_tag}\n</body>')

    bundled_filename = 'Presentacio_CGIA_Custodia_Contencions_Grup3.html'
    with open(bundled_filename, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f'Successfully created standalone bundle:')
    print(f'  -> {bundled_filename} ({os.path.getsize(bundled_filename):,} bytes)')

if __name__ == '__main__':
    bundle()
