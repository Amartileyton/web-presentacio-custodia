import json
import math
import pandas as pd

# Load GeoJSON
with open('catalunya_comarques.geojson', 'r', encoding='utf-8') as f:
    geo = json.load(f)

# Bounds
min_lng = 0.169709
max_lng = 3.322045
min_lat = 40.523192
max_lat = 42.861845

# Target SVG viewBox: 0 0 900 800, tight padding so map is maximal full size
svg_w = 900
svg_h = 800
padding = 16

inner_w = svg_w - 2 * padding
inner_h = svg_h - 2 * padding

def project(lng, lat):
    x_norm = (lng - min_lng) / (max_lng - min_lng)
    y_norm = (max_lat - lat) / (max_lat - min_lat)
    x = padding + x_norm * inner_w
    y = padding + y_norm * inner_h
    return round(x, 1), round(y, 1)

# Convert GeoJSON to SVG paths
comarques_out = []
for feat in geo['features']:
    props = feat.get('properties', {})
    nom = props.get('nom_comar', props.get('comarca', 'Comarca'))
    geom = feat['geometry']
    gtype = geom['type']
    coords = geom['coordinates']
    
    def process_poly(poly_coords):
        res = []
        for ring in poly_coords:
            ring_cmds = []
            for i, pt in enumerate(ring):
                x, y = project(pt[0], pt[1])
                cmd = "M" if i == 0 else "L"
                ring_cmds.append(f"{cmd}{x} {y}")
            ring_cmds.append("Z")
            res.append(" ".join(ring_cmds))
        return " ".join(res)

    if gtype == 'Polygon':
        path_d = process_poly(coords)
    elif gtype == 'MultiPolygon':
        path_d = " ".join([process_poly(poly) for poly in coords])
        
    comarques_out.append({
        'id': props.get('comarca', nom),
        'nom': nom,
        'd': path_d
    })

# Load Mossos CSV
df = pd.read_csv('mossos_esquadra_catalunya.csv')
estacions_out = []

for idx, row in df.iterrows():
    lat = float(row['Coord_Y_Latitud'])
    lng = float(row['Coord_X_Longitud'])
    x, y = project(lng, lat)
    
    estacions_out.append({
        'id': f'st_{idx}',
        'nom': str(row['Nombre']),
        'municipi': str(row['Municipio']),
        'adreca': str(row['Direccion']),
        'tipus': str(row.get('Tipus', 'Comissaria')),
        'comarca': str(row.get('Comarca', '')),
        'lat': lat,
        'lng': lng,
        'x': x,
        'y': y,
        'te_acd': bool(row['Te_ACD']),
        'gmaps': str(row['URL_Google_Maps'])
    })

map_data = {
    'viewBox': f'0 0 {svg_w} {svg_h}',
    'bounds': {'min_lng': min_lng, 'max_lng': max_lng, 'min_lat': min_lat, 'max_lat': max_lat},
    'comarques': comarques_out,
    'estacions': estacions_out
}

with open('catalunya_map_data.json', 'w', encoding='utf-8') as f:
    json.dump(map_data, f, ensure_ascii=False)

print(f'catalunya_map_data.json regenerat amb pantalla completa:')
print(f' - Comarques: {len(comarques_out)}')
print(f' - Estacions amb ACD: {sum(1 for s in estacions_out if s["te_acd"])}')
