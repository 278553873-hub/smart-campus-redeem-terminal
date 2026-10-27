"""独立的 A4 展示层：内容来自个人报告内容.json，插画复用教师手机端资源。"""
from pathlib import Path
import base64
import csv
import json
import re
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
OUT = HERE.parent
ROOT = next(p for p in HERE.parents if (p / 'mobile-app').exists())
CSS = (HERE / '个人报告样式.css').read_text()
DATA = json.loads((HERE / '个人报告内容.json').read_text())


def xml(html):
    return ET.fromstring('<root>' + html.replace('<br>', '<br/>') + '</root>')


def html(el):
    return ET.tostring(el, encoding='unicode', method='html')


def text(el):
    return ''.join(el.itertext()).strip()


def get(root, cls):
    return next(e for e in root if cls in e.get('class', '').split())


def classes(root, cls):
    return [e for e in root if cls in e.get('class', '').split()]


def icon(n):
    shapes = [
        '<path d="M4 5h6a3 3 0 0 1 3 3v12a4 4 0 0 0-3-2H4zM13 8a3 3 0 0 1 3-3h4v13h-4a4 4 0 0 0-3 2"/>',
        '<path d="M21 11a8 8 0 0 1-8 8H7l-4 3v-7a8 8 0 1 1 18-4Z"/><path d="M7 10h10M7 14h6"/>',
        '<rect x="5" y="4" width="15" height="17" rx="2"/><path d="m8 10 2 2 4-4M8 17h8M9 4V2M16 4V2"/>',
        '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
        '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v2"/>',
        '<path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>'
    ]
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + shapes[n % len(shapes)] + '</svg>'


def portrait(table):
    cards = []
    for i, row in enumerate(table.findall('tbody/tr')):
        t, desc = list(row)
        cards.append(f'<article class="portrait-card tone-{i%3}"><h3><span class="icon">{icon(i)}</span>{text(t)}</h3><p>{text(desc)}</p></article>')
    return '<div class="portrait-grid">' + ''.join(cards) + '</div>'


def insight(el):
    title = el.find('h3')
    ps = el.findall('p')
    parts = []
    for i, p in enumerate(ps):
        if p.find('b') is not None:
            label = p.find('b')
            label_text = text(label)
            tail = (label.tail or '').strip(' 　：:')
            p.remove(label)
            content = tail + ''.join(ET.tostring(c, encoding='unicode', method='html') for c in p)
            parts.append(f'<div class="insight-part part-{i}"><span class="label">{label_text}</span><p>{content}</p></div>')
        else:
            parts.append('<p>' + ''.join(p.itertext()) + '</p>')
    return f'<article class="insight"><h3>{text(title)}</h3><div class="insight-parts">' + ''.join(parts) + '</div></article>'


def action_cards(table, compact=False):
    heads = [text(e) for e in table.findall('thead/tr/th')]
    cards = []
    for i, row in enumerate(table.findall('tbody/tr')):
        cells = list(row)
        details = ''.join(f'<div><span class="label">{heads[j]}</span><p>{text(c)}</p></div>' for j,c in enumerate(cells[1:],1))
        cards.append(f'<article class="action-card"><h3><span class="step-number">{i+1:02d}</span>{text(cells[0])}</h3><div class="action-details">{details}</div></article>')
    return '<div class="action-cards'+ (' compact' if compact else '')+'">' + ''.join(cards) + '</div>'


def timeline(table):
    rows = []
    for i, row in enumerate(table.findall('tbody/tr')):
        cells = list(row)
        label = html(cells[0]).replace('<td>', '').replace('</td>', '')
        label = re.sub(r'^第[1-4]周<br[ /]*>', '', label)
        rows.append(f'<article class="week"><div class="week-mark"><b>0{i+1}</b><span>第{i+1}周</span></div><div><h3>{label}</h3><p>{text(cells[1])}</p><div class="week-check"><span>走向下一步的依据</span><p>{text(cells[2])}</p></div></div></article>')
    return '<div class="weeks">' + ''.join(rows) + '</div>'


def image_uri(gender):
    asset = ROOT / f'mobile-app/assets/resources/term-report-covers/primary-lower-{gender}-discovery-v2.png'
    return 'data:image/png;base64,' + base64.b64encode(asset.read_bytes()).decode()


def render_all():
    for name, original in DATA.items():
        is_boy = name == '周智皓'
        nick = '皓皓' if is_boy else '芊语'
        art = image_uri('boy' if is_boy else 'girl')
        roots = [xml(p['body']) for p in original]
        c, overview, topic1, topic2, teacher, family, plan, ending = roots
        pages = []
        def add(section, title, deck, body, evidence='', cls=''):
            pages.append(dict(section=section,title=title,deck=deck,body=body,evidence=evidence,cls=cls))

        traits = text(get(c, 'cover-focus').findall('p')[0]).split(' · ')
        trait_html = '<ul class="traits">' + ''.join(f'<li class="trait-{i}">{s}</li>' for i,s in enumerate(traits)) + '</ul>'
        cover_body = f'''<div class="cover-wash" aria-hidden="true"></div><div class="cover-school">川大附小分校</div><p class="cover-term">2026 秋季 · 一年级入学适应期</p><h1 id="title-1">个人成长<span>报告<i aria-hidden="true"></i></span></h1><p class="cover-subtitle">多维理解与个性化培养建议</p><div class="cover-art"><img src="{art}" width="1254" height="1254" alt="一年级学生主题虚拟形象"/></div><div class="cover-identity"><h2>{name}</h2><p>2026级2班 · 家长与教师共读</p>{trait_html}</div><p class="cover-range">成长记录范围　2026.09.01—10.23</p>'''
        add('', '', '', cover_body, cls='cover '+('blue' if is_boy else 'violet'))

        # 家长速读：数字只表示经原始评价核对的不同记录日期，不充当能力评分。
        if is_boy:
            quick = [
                ('已经看到的力量','愿意为班级和同伴做事，喜欢动手探索。'),
                ('当前需要的支持','分歧时练习停手和说需要；课前准备借助固定步骤。'),
                ('本周先做一件事','用“收好—取用—推椅”三步卡，成人先示范，再让孩子自查。'),
            ]
            evidence = [
                ('至少 5 天','服务集体','9月4日、8日、14日；10月20日、22日',['Z6','Z15','Z29','Z145','Z161']),
                ('至少 3 天','课前准备提醒','9月15日、16日、18日',['Z31','Z32','Z45']),
                ('1 天','主动准备被肯定','10月9日',['Z101']),
            ]
        else:
            quick = [
                ('已经看到的力量','喜欢画画，能细致观察，也曾在课堂主动回答。'),
                ('当前需要的支持','把熟悉的发现说清楚，再练习独立检查一个地方。'),
                ('本周先做一件事','选一幅画，讲一个发现；说完后自己核对是否讲到这个细节。'),
            ]
            evidence = [
                ('2 天','细致观察植物','9月30日、10月14日',['R80','R118']),
                ('至少 3 天','课堂回答或示范','9月2日、10日、11日',['R2','R19','R27']),
                ('2 天','主动帮助同伴','10月20日、22日',['R144','R153']),
            ]
        evidence_rows = {row['引用代码']: row for row in csv.DictReader((OUT.parent/'分析附件/精选行为证据.csv').open(encoding='utf-8-sig'))}
        for _,_,_,codes in evidence:
            for code in codes:
                assert evidence_rows[code]['工作表'] == name
        quick_html = '<div class="quick-grid">'+''.join(f'<article><h3>{label}</h3><p>{value}</p></article>' for label,value in quick)+'</div>'
        metric_html = '<h3 class="quick-section">记录中能核对的片段</h3><div class="metric-grid">'+''.join(f'<article><strong>{amount}</strong><h4>{label}</h4><p>{dates}</p></article>' for amount,label,dates,_ in evidence)+'</div>'
        method_note = '<p class="metric-note">数字按不同事件日期列出，表示资料中“至少有这些记录”，不代表实际发生总次数、能力高低或进步幅度。也不用于与其他学生比较。</p>'
        overview_body = quick_html + metric_html + method_note
        add('01 / 成长提要', '从孩子已有的力量出发', '把日常表现、家长反馈与孩子的声音放在一起，找到当前最值得支持的一步。', overview_body, original[1]['evidence'], 'overview-page')

        add('02 / 多维成长画像', '看见不同情境中的孩子', '六个领域共同构成当前画像。每个领域既有可继续发展的资源，也有需要具体支持的地方。', portrait(overview.find('table')), original[1]['evidence'], 'portrait-page')

        topic1_body = ''.join(insight(e) for e in classes(topic1,'insight'))
        if not is_boy:
            topic1_body += '<div class="expression-steps">' + action_cards(topic1.find('table'),compact=True) + '</div>'
        topic1_body += ''.join(html(e) for e in classes(topic1,'note'))
        add('03 / 关键洞察 · '+('学习与自主' if is_boy else '表达与信心'), original[2]['title'], original[2]['deck'], topic1_body, original[2]['evidence'], 'insight-page')

        topic2_body = (html(get(topic2,'voice')) if is_boy else '') + ''.join(insight(e) for e in classes(topic2,'insight'))
        topic2_body += html(get(topic2,'headline')) if is_boy else html(get(topic2,'two-col'))
        topic2_body += ''.join(html(e) for e in classes(topic2,'note'))
        add('04 / 关键洞察 · '+('情绪与交往' if is_boy else '细致与自主'), original[3]['title'], original[3]['deck'], topic2_body, original[3]['evidence'], 'insight-page')

        methods_body = '<h3 class="section-title">'+('把提醒变成能做到的动作' if is_boy else '做事卡住时，先找具体环节')+'</h3>'
        if is_boy:
            methods_body += action_cards(topic1.find('table'))
        if is_boy:
            methods_body += '<h3 class="section-title">分歧发生前、发生时、发生后</h3>' + html(get(topic2,'three-col'))
        else:
            methods_body += action_cards(topic2.find('table'),compact=True)
            methods_body += '<div class="tool-reminder"><h3>一次只选一个检查点</h3><p>可以从刚完成的一幅画开始：请芊语自己圈出想讲的一个细节，讲完再核对是否提到。先示范、共同做，再逐步让孩子自己检查。</p><p class="note">这是后续练习示例。先了解哪一步有困难，再决定使用哪种支持，不把四种情况同时当作孩子存在的问题。</p></div>'
        add('05 / 日常支持工具', '把建议放进真实的每一天', '先辨认当下需要，再给一个清楚、可完成的动作。家校可以选择相同的提示方法。', methods_body, original[2]['evidence']+' '+original[3]['evidence'], 'methods-page')

        teacher_body = html(get(teacher,'project')) + action_cards(teacher.find('table'),compact=True)
        
        add('06 / 给老师的培养建议', original[4]['title'], original[4]['deck'], teacher_body, original[4]['evidence'], 'teacher-page')

        shared_body = html(get(teacher,'two-col')) + html(get(teacher,'quote')) + '<h3 class="section-title">把家庭经验带进家校沟通</h3>' + html(get(family,'two-col'))
        add('07 / 课堂延伸与家校配合', '让好方法在不同情境中延续', '课堂的帮助逐步调整，家庭的观察具体反馈，共同找到孩子能够使用的方法。', shared_body, '本页内容为培养建议与反馈示例，请结合孩子的实际反应选择、调整。', 'shared-page')

        family_body = ''.join(insight(e) for e in classes(family,'insight'))
        add('08 / 给家长的陪伴建议', original[5]['title'].replace('<br>',''), original[5]['deck'], family_body, original[5]['evidence'], 'family-page')

        plan_body = html(get(plan,'goal')) + timeline(plan.find('table'))
        add('09 / 未来四周 · 共同尝试', original[6]['title'], original[6]['deck'], plan_body, original[6]['evidence'], 'plan-page')

        progress = '<h3 class="section-title">'+('值得记录的三种进步' if is_boy else '看见表达背后的进步')+'</h3>' + html(get(plan,'three-col')) + html(get(plan,'box')) + html(get(plan,'note'))

        add('10 / 家校回看与调整', '看见方法怎样慢慢被孩子用起来', '用一两个具体例子了解变化，也听孩子说说这些帮助是否合适。', progress, '阅读提示：以下观察方式用于后续共同尝试，不代表已经取得的实施效果。', 'review-page')

        letter_node = get(ending,'letter')
        letter_node.remove(letter_node.find('h3'))
        letter = f'<div class="letter-art" aria-hidden="true"><img src="{art}" width="1254" height="1254" alt=""/></div>' + html(letter_node)
        letter += '<h3 class="section-title">下一次家校沟通，聚焦三件事</h3>' + html(ending.find('ol'))
        add('11 / 写给孩子，也写给陪伴者', original[7]['title'], original[7]['deck'], letter, original[7]['evidence'], 'letter-page')

        source_cards = '<div class="evidence-list">'
        for row in ending.find('table').findall('tbody/tr'):
            cells = list(row)
            source_cards += f'<article><h3>{text(cells[0])}</h3><p>{text(cells[1])}</p></article>'
        source_cards += '</div>'
        source_cards += '<h3 class="section-title">怎样理解这份报告</h3>'+html(get(ending,'note'))
        source_cards += '<h3 class="section-title">培养方法参考</h3>'+html(get(ending,'method-ref'))
        add('12 / 阅读依据与方法说明', '每一个判断，都回到具体材料', '资料帮助我们理解孩子当前的表现。后续培养仍需在真实互动中了解、验证与调整。', source_cards, '资料截止：2026年10月23日 · 仅供本学生家长与相关教师使用', 'sources-page')

        # 标题直接说明本页主题，避免小栏目名与抒情标题反复表达同一件事。
        theme_titles = [
            '',
            '一页读懂'+nick+'：优势、需要与下一步',
            '六维成长画像',
            '学习与自我管理' if is_boy else '表达与信心',
            '情绪与同伴关系' if is_boy else '专注、细致与自主',
            '日常支持：具体怎么做',
            '教师培养：课堂活动设计',
            '家校协同：把方法用起来',
            '家庭陪伴：三件可以做的事',
            '未来四周：练习与观察',
            '家校回看：看什么、怎么调整',
            f'写给{nick}的话',
            '依据与方法说明',
        ]
        sections = []
        for i,p in enumerate(pages,1):
            head = '' if i==1 else f'<header><h2 id="title-{i}">{theme_titles[i-1]}</h2></header>'
            content = p['body']
            if i==10:
                content += '<p class="future-note">这四周是接下来可以尝试的安排；目前尚无实施结果。</p>'
            sections.append(f'<section class="page {p["cls"]}" id="page-{i}" aria-labelledby="title-{i}">{head}<div class="body">{content}</div><footer aria-label="第{i}页，共{len(pages)}页">{i:02d} / {len(pages):02d}</footer></section>')
        toolbar = f'<a class="skip-link" href="#page-2">跳到报告正文</a><nav class="toolbar" aria-label="报告操作"><strong>{name} · 个人成长报告</strong><div class="actions"><a href="#page-2">成长提要</a><a href="#page-7">培养建议</a><button onclick="window.print()" type="button">导出 PDF / 打印</button></div></nav>'
        doc = '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>'+name+'｜个人成长与培养建议</title><style>'+CSS+'</style></head><body>'+toolbar+'<main>'+''.join(sections)+'</main></body></html>'
        assert ('任芊语' if is_boy else '周智皓') not in doc
        (OUT / f'{name}个人成长报告.html').write_text(doc)
        print(name, len(pages), '页 · 插画已内嵌，可离线阅读')


if __name__ == '__main__':
    render_all()
