"""只读分析原始工作簿，保留统计口径和精选证据的可追溯性。"""
import csv
import json
from collections import Counter
from pathlib import Path
import openpyxl

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
record_file = next((ROOT / '资料').glob('*评价记录*.xlsx'))
book = openpyxl.load_workbook(record_file, data_only=True)
records = {}
for name in ('周智皓', '任芊语'):
    values = list(book[name].values)
    records[name] = [dict(zip(values[0], row), Excel行号=i) for i, row in enumerate(values[1:], 2)]
all_rows = sum(records.values(), [])
summary = {
    '导出记录条数': len(all_rows),
    '记录ID去重数': len({r['记录ID'] for r in all_rows}),
    '样本涉及批次ID去重数_不等于全班评价次数': len({r['批次ID'] for r in all_rows}),
    '两位学生共享批次数': len(records['周智皓']) + len(records['任芊语']) - len({r['批次ID'] for r in all_rows}),
    '涉及教师数': len({r['教师'] for r in all_rows}),
    '事件日期覆盖': [min(r['事件日期'] for r in all_rows), max(r['事件日期'] for r in all_rows)],
    '10月13日录入条数': sum(r['录入时间'].startswith('2026-10-13') for r in all_rows),
    '一级指标条数': dict(Counter(r['一级指标'] for r in all_rows)),
    '说明': '统计为未经语义清洗的导出条目，不代表能力、行为发生频率或改善幅度。原始评价优先于AI生成内容。按事件日期梳理，不能按录入时间判断变化。',
    '学生': {},
}
for name, rows in records.items():
    summary['学生'][name] = {
        '成长记录条数': len(rows), '教师数': len({r['教师'] for r in rows}),
        '指标分布': dict(Counter(r['一级指标'] for r in rows)),
        '事件月份条数': dict(Counter(r['事件日期'][:7] for r in rows)),
        '录入日期条数': dict(Counter(r['录入时间'][:10] for r in rows)),
    }
(OUT / '资料统计.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')

selected = {
    '周智皓': [2, 6, 8, 15, 19, 25, 29, 31, 32, 33, 38, 45, 55, 56, 78, 79, 90, 98, 101, 108, 113, 117, 130, 138, 144, 145, 146, 151, 152, 158, 159, 160, 161],
    '任芊语': [2, 5, 18, 19, 27, 29, 34, 35, 36, 37, 42, 47, 48, 51, 54, 59, 72, 73, 80, 87, 106, 112, 118, 138, 144, 149, 153],
}
with (OUT / '精选行为证据.csv').open('w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['引用代码', '文件', '工作表', 'Excel行号', '记录ID', '批次ID', '事件日期', '教师', '原始评价', '使用说明'])
    for name, indices in selected.items():
        for row in records[name]:
            if row['Excel行号'] in indices:
                prefix = 'Z' if name == '周智皓' else 'R'
                writer.writerow([f'{prefix}{row["Excel行号"]}', record_file.name, name, row['Excel行号'], row['记录ID'], row['批次ID'], row['事件日期'], row['教师'], row['评价内容(原始)'], '依据结构化学生归属；转写姓名变体仍需教师核对，不按转写姓名另建学生。'])

flags = {
    '周智皓': {47: '原文只提到其他学生，暂不用于个体结论', 74: '姓名明显不一致，暂不用于个体结论', 102: '原文只提到其他学生，两份工作表均有此批次，暂不用于个体结论', 166: '语义不完整，不用于个体结论'},
    '任芊语': {6: '姓氏或姓名不一致，暂不用于个体结论', 21: '语义识别不清，不用于技能判断', 38: '姓氏不一致，暂不用于个体结论', 39: '姓氏不一致，暂不用于个体结论', 57: '学生姓名和编号对应存疑，暂不用于个体结论', 64: '语义不清，暂不用于个体结论', 98: '原文只提到其他学生，两份工作表均有此批次，暂不用于个体结论', 134: '姓氏不一致，暂不用于全校表扬结论', 157: '语义不完整，不用于个体结论'},
}
with (OUT / '优先核对记录.csv').open('w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['学生', 'Excel行号', '记录ID', '批次ID', '原始评价', '核对原因'])
    for name, indices in flags.items():
        for r in records[name]:
            if r['Excel行号'] in indices:
                writer.writerow([name, r['Excel行号'], r['记录ID'], r['批次ID'], r['评价内容(原始)'], indices[r['Excel行号']]])
print(json.dumps(summary, ensure_ascii=False, indent=2))
