"""Template engine for ExamPass HTML generation.

Zero Unicode-in-source: all CJK text lives in JSON/CSS/JS files.
"""

import os
import json

_TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'templates')


def _read(filename):
    path = os.path.join(_TEMPLATES_DIR, filename)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    return ''


def _page_shell(title, body_html, extra_css='', extra_js=''):
    css = _read('base.css') + '\n' + extra_css
    return '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8"/>\n<meta name="viewport" content="width=device-width, initial-scale=1.0"/>\n<title>' + title + '</title>\n<script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml-full.js"></script>\n<style>\n' + css + '\n</style>\n' + extra_js + '\n</head>\n<body>\n\n<header id="exampass-header">\n  <div class="header-left"><span class="header-brand">ExamPass Assistant</span></div>\n  <div class="header-right"><span class="header-url">exampass.ai</span></div>\n</header>\n<hr class="header-divider">\n\n' + body_html + '\n\n</body>\n</html>'


# ─── Knowledge page ─────────────────────────────────────────────────

def render_knowledge_html(body_html, title):
    return _page_shell(title, body_html)


def save_knowledge_html(body_html, output_path, title):
    html = render_knowledge_html(body_html, title)
    out_dir = os.path.dirname(output_path)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)


# ─── Interactive test page ──────────────────────────────────────────

def render_test(questions, title, subtitle=''):
    """Generate an interactive test page.

    questions: list of dicts with keys:
      type: "choice" | "tf" | "short" | "essay"
      points: int
      question: str (HTML allowed)
      options: list of str (for choice only)
      answer: int (0-index for choice/tf, -1 for open-ended)
      explanation: str (HTML allowed)
      pitfall: str (optional)
    """
    questions_json = json.dumps(questions, ensure_ascii=False)
    labels = json.loads(_read('test_labels.json'))
    labels_json = json.dumps(labels, ensure_ascii=False)
    js_template = _read('test_js_template.js')
    js = js_template.replace('__QUESTIONS_PLACEHOLDER__', questions_json)
    js = js.replace('__LABELS_PLACEHOLDER__', labels_json)
    js = '<script>\n' + js + '\n</script>'

    sub_html = ''
    if subtitle:
        sub_html = '<p style="text-align:center;color:var(--ink-light);font-size:0.95em">' + subtitle + '</p>'

    labels_import = json.loads(_read('test_labels.json'))
    body = '\n<h1>' + title + '</h1>\n<h2 style="text-align:center">' + labels_import['section']['choice'][0:4] + '</h2>\n' + sub_html + '\n\n<div id="score-box"><div class="score-num" id="score-num">0</div><div class="score-label">' + labels_import['score_label'] + '</div></div>\n<div id="questions-container"></div>\n<div class="grading-bar no-print"><button onclick="gradeAll()" id="grade-btn">' + labels_import['grade_button'] + '</button></div>\n'

    return _page_shell(title, body, extra_css=_read('test.css'), extra_js=js)


def save_test(questions, output_path, title, subtitle=''):
    html = render_test(questions, title, subtitle)
    out_dir = os.path.dirname(output_path)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)
