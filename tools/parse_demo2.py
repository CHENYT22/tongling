#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图灵 2.0 Demo2 内容解析器
从 图灵2.0-Demo2.md 提取公共数据集全部条目（193 条 × 24 字段），
渲染为 data.js（window.TURING_DATA），供 datasets.html 客户端渲染。

用法: python3 parse_demo2.py <md路径> <输出data.js路径>
"""
import json
import re
import sys
import html as html_mod

# 字段规范顺序（页面渲染按此顺序）
META_FIELDS = ['英文名称', '条目编号', '数据集编号', '能力大类', '细分任务',
               '年份', '模态', '语言', '访问状态', '官方链接']
SECTION_FIELDS = ['摘要', '任务适配理由', '数据规模', '获取方式', '标注信息',
                  '内容字段', '数据处理', '使用说明', '评测指标', '榜单信息',
                  '许可证', '验证信息', '维护信息', '版本信息']
ALL_FIELDS = META_FIELDS + SECTION_FIELDS

CATEGORIES = ['情感共情', '认知共情', '共情关怀', '安全交互']
CAT_IDS = {'情感共情': 'affective', '认知共情': 'cognitive',
           '共情关怀': 'concern', '安全交互': 'safety'}

FIELD_RE = re.compile(r'^\*\*([^*：]{1,20})：\*\*\s?(.*)$')
SUBTASK_RE = re.compile(r'^####\s+(.+?)（(\d+)\s*条）\s*$')
SUMMARY_RE = re.compile(r'<summary>(.+?)</summary>')


def inline_md(text):
    """处理行内 markdown: **bold** 与 `code`（先 escape HTML）。"""
    t = html_mod.escape(text, quote=False)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    return t


def render_block(lines):
    """把多行纯文本渲染为 HTML 片段：
    - 连续 '- ' 行归为一个 <ul>
    - 其余每个非空行一个 <p>（保留信息密度，接近原文排版）
    """
    out = []
    ul_buf = []

    def flush_ul():
        if ul_buf:
            out.append('<ul>' + ''.join('<li>%s</li>' % li for li in ul_buf) + '</ul>')
            ul_buf.clear()

    for raw in lines:
        line = raw.rstrip()
        if not line.strip():
            flush_ul()
            continue
        s = line.strip()
        if s.startswith('- '):
            ul_buf.append(inline_md(s[2:]))
        else:
            flush_ul()
            # 保留 markdown 硬换行语义：去掉行尾两个空格
            out.append('<p>%s</p>' % inline_md(s.rstrip('  ')))
    flush_ul()
    return ''.join(out)


def parse_details_block(block_lines):
    """解析单个 <details> 块 → (title, fields_dict_rawlines)"""
    title = None
    fields = {}          # field_name -> list of raw content lines 或 inline str
    cur_field = None
    for line in block_lines:
        if title is None:
            m = SUMMARY_RE.search(line)
            if m:
                title = m.group(1).strip()
                continue
        if line.strip() in ('<details>', '</details>'):
            continue
        fm = FIELD_RE.match(line)
        if fm and fm.group(1).strip() in ALL_FIELDS:
            cur_field = fm.group(1).strip()
            inline_val = fm.group(2).strip()
            fields[cur_field] = [inline_val] if inline_val else []
            continue
        if cur_field is not None:
            fields[cur_field].append(line)
    return title, fields


def clean_scalar(v):
    return v.strip().strip('`').strip() if v else ''


def main(md_path, out_path):
    lines = open(md_path, encoding='utf-8').read().split('\n')

    # 定位「公共数据集」section 范围
    start = next(i for i, l in enumerate(lines) if l.strip() == '## 公共数据集')
    end = next(i for i, l in enumerate(lines) if l.strip() == '## 自有数据集')

    entries = []
    cur_cat = None
    cur_subtask = None
    i = start
    warnings = []

    while i < end:
        line = lines[i]
        s = line.strip()

        if s.startswith('### ') and s[4:] in CATEGORIES:
            cur_cat = s[4:]
            cur_subtask = None
            i += 1
            continue

        sm = SUBTASK_RE.match(s)
        if sm:
            cur_subtask = {'name': sm.group(1).strip(), 'declared': int(sm.group(2))}
            i += 1
            continue

        if s == '<details>':
            # 收集到 </details>
            block = []
            j = i
            while j < end:
                block.append(lines[j])
                if lines[j].strip() == '</details>':
                    break
                j += 1
            if j >= end:
                warnings.append('未闭合的 details @line %d' % (i + 1))
                break
            title, fields = parse_details_block(block)
            if title is None:
                warnings.append('缺 summary @line %d' % (i + 1))
                title = '(未命名)'

            # 名称/年份：从 summary 提取（去掉前导序号与尾部括号）
            name = re.sub(r'^\d+[\.、]\s*', '', title)
            name = re.sub(r'（[^（）]*）\s*$', '', name).strip() or title

            meta = {}
            for f in META_FIELDS:
                raw = fields.get(f, [])
                meta[f] = clean_scalar(' '.join(x.strip() for x in raw if x.strip()))

            sections = {}
            for f in SECTION_FIELDS:
                raw = fields.get(f, [])
                sections[f] = render_block(raw)

            # 校验字段完整性
            missing = [f for f in ALL_FIELDS if f not in fields]
            if missing:
                warnings.append('%s 缺字段: %s' % (title, ','.join(missing)))

            entries.append({
                'title': title,
                'name': name,
                'category': cur_cat,
                'categoryId': CAT_IDS.get(cur_cat, ''),
                'subtask': cur_subtask['name'] if cur_subtask else '',
                'entryId': meta.get('条目编号', ''),
                'datasetId': meta.get('数据集编号', ''),
                'en': meta.get('英文名称', ''),
                'year': meta.get('年份', ''),
                'modality': meta.get('模态', ''),
                'language': meta.get('语言', ''),
                'access': meta.get('访问状态', ''),
                'link': meta.get('官方链接', ''),
                'sections': sections,
            })
            i = j + 1
            continue

        i += 1

    # ---- 组装分类结构 ----
    cat_map = {c: {'name': c, 'id': CAT_IDS[c], 'subtasks': []} for c in CATEGORIES}
    for e in entries:
        cat = cat_map[e['category']]
        subs = cat['subtasks']
        if not subs or subs[-1]['name'] != e['subtask']:
            subs.append({'name': e['subtask'], 'entries': []})
        subs[-1]['entries'].append(e)

    # ---- 校验 ----
    report = []
    total = 0
    for c in CATEGORIES:
        cat = cat_map[c['name']] if isinstance(c, dict) else cat_map[c]
        cat_count = sum(len(st['entries']) for st in cat['subtasks'])
        total += cat_count
        cat['count'] = cat_count
        report.append('%s: %d 条 (%d 个细分任务)' % (cat['name'], cat_count, len(cat['subtasks'])))

    data = {
        'updated': '2026-07-27',
        'totalEntries': total,
        'categories': [cat_map[c] for c in CATEGORIES],
    }

    js = 'window.TURING_DATA = ' + json.dumps(data, ensure_ascii=False) + ';\n'
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(js)

    print('=== 解析报告 ===')
    for r in report:
        print(' ', r)
    print('  总计: %d 条' % total)
    print('  data.js 大小: %.1f KB' % (len(js.encode('utf-8')) / 1024))
    if warnings:
        print('=== 警告 (%d) ===' % len(warnings))
        for w in warnings[:30]:
            print('  [warn]', w)
    else:
        print('  无警告 ✓')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
