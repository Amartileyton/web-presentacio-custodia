import os
import glob

temp_patterns = [
    'inspect_*.py',
    'read_*.py',
    'find_*.py',
    'check_*.py',
    'save_*.py',
    'try_*.py',
    'compare_*.py',
    'annotate_*.py',
    'verify_*.py',
    'extract_*.py',
    'prep_*.py',
    'update_*.py',
    'make_*.py',
    'test_*.py',
    'generate_*.py',
    'do_*.py',
    '*.txt',
    'crop_*.png',
    'crops_detencio',
    'col_*.png',
    'box_*.png',
    'legend.png',
    'clean_lanes_bg.png',
    'base_swimlanes.png',
    'fg_content.png',
    'guide_coords.png',
    'annotated_detencio.png',
    'extracted_boxes_view.html',
    'strips_view.html',
    'stage1_content.html',
    'tobe_script.js',
    'tobe_standalone_script.js',
    'asme_html_script.js',
    'detencio_data_uris.py'
]

for pat in temp_patterns:
    for f in glob.glob(pat):
        try:
            if os.path.isdir(f):
                import shutil
                shutil.rmtree(f)
            else:
                os.remove(f)
        except Exception:
            pass

print("Cleaned temporary scripts.")
