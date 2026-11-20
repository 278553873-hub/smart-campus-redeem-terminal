"""生成可编辑手机报告与教师手机壳预览；不修改 A4 或其他学生文件。"""
from pathlib import Path
import argparse
import copy
import json
import re
import runpy
import subprocess
import tempfile
import time

OUT = Path(__file__).resolve().parent
REPORT = runpy.run_path(str(OUT / '生成工具四.py'))


def heading_text(value):
    return value.split('（', 1)[0]


def render_mobile_html(name, data, output_path=None):
    target = Path(output_path) if output_path else OUT / f'{name}_工具四_初始成像_手机阅读版.html'
    preview = target.with_name(target.stem.replace('手机阅读版', '手机壳预览') + '.html')
    if preview == target:
        preview = target.with_name(target.stem + '_手机壳预览.html')
    content = copy.deepcopy(data)
    for key in ['five', 'three']:
        content[key] = [[REPORT['DISPLAY_LABELS'].get(label, label), text] for label, text in data[key]]
    _, image = REPORT['image_uri'](data)
    payload = {
        'revision': 4,
        'updatedAt': int(time.time() * 1000),
        'storageId': f'student-initial-portrait:{name}:v4',
        'meta': {
            'name': name, 'school': REPORT['SCHOOL_NAME'], 'title': REPORT['REPORT_TITLE'],
            'motto': REPORT['COVER_MESSAGE'], 'sources': '家长问卷 × 学生访谈 × 教师观察',
        },
        'coverImage': image,
        'labels': {
            'sections': {
                'observations': heading_text(REPORT['H1']), 'card': heading_text(REPORT['H2']),
                'five': heading_text(REPORT['FIVE']), 'three': heading_text(REPORT['THREE']),
                'light': heading_text(REPORT['LIGHT']), 'watch': REPORT['WATCH'], 'message': REPORT['MESSAGE'],
            },
            'sources': dict(zip(['parent', 'child', 'teacher'], ['家长问卷', '学生访谈', '教师观察'])),
            'quotes': dict(zip(['parent', 'child', 'teacher'], REPORT['SOURCE_LABELS'])),
            'light': dict(zip(['want', 'strong', 'parent', 'teacher'], REPORT['LIGHT_LABELS'])),
            'synthesis': REPORT['LIGHT_RESULT'], 'lightNote': REPORT['LIGHT_NOTE'], 'watchHelp': REPORT['WATCH_HELP'],
        },
        'data': content,
    }
    # 样式更新沿用同一内容时间戳，避免覆盖老师已经保存在浏览器中的修改。
    if target.exists():
        match = re.search(r'<script id="report-data" type="application/json">(.*?)</script>', target.read_text(encoding='utf-8'), re.S)
        if match:
            previous = json.loads(match.group(1))
            stable = lambda item: {key: value for key, value in item.items() if key != 'updatedAt'}
            if stable(previous) == stable(payload):
                payload['updatedAt'] = previous['updatedAt']
    with tempfile.TemporaryDirectory(prefix='student-mobile-') as temp:
        source = Path(temp) / 'report.json'
        source.write_text(json.dumps(payload, ensure_ascii=False), encoding='utf-8')
        subprocess.run(['node', str(OUT / '生成手机预览.mjs'), str(source), str(target), str(preview)], check=True)
    return target


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='生成可编辑手机报告及教师手机壳预览')
    parser.add_argument('--student', default='吴浩')
    args = parser.parse_args()
    content = json.loads((OUT / f'{args.student}_工具四_新版提示词内容.json').read_text(encoding='utf-8'))
    render_mobile_html(args.student, content[args.student])
