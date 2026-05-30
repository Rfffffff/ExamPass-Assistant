---
name: exampass
description: 将课程资料（PPT/Word/PDF）按章节生成知识清单和交互式章节测试，帮助高效期末复习。
---

# ExamPass Assistant

## 触发
用户调用 `/exampass`。

## 执行流程

### 第一步：提取内容
```bash
python scripts/run_exampass.py <目标目录>
```
这会递归扫描目录，提取所有 PPTX/DOCX/PDF 的文字和图片，保存 `_extraction_bundle.json` 到每个章节文件夹。

### 第二步：生成知识清单和测试题
Claude 读取 `_extraction_bundle.json`，深度分析内容后，直接生成 HTML body 和题目数据，用模板引擎输出：

```python
from scripts.template_engine import save_knowledge_html, save_test

# 知识清单 — HTML body 直接传入
save_knowledge_html(body_html, '第一章-知识清单.html', '第一章标题')

# 交互式测试 — 题目列表直接传入
save_test(questions_list, '第一章-章节测试.html', '第一章标题', '满分100分 | 建议45分钟')
```

### 第三步
浏览器打开 HTML 即可使用。Ctrl+P 打印为 PDF（MathJax 完美渲染公式）。

## 重要约定

1. **所有中文内容通过 JSON 文件或独立模板文件加载**，不在 Python 源码中内联中文字符串
2. **所有生成脚本保存为独立 .py 文件执行**，避免 shell 内联 Python 的转义冲突
3. **题目数据中的解释文本避免使用中文弯引号 ""**，使用「」或直接省略
4. **HTML body 中避免使用 Unicode 箭头符号**，使用 HTML 实体或文字替代
5. **模板引擎的 CSS/JS 分别存储在 templates/ 目录**，Python 代码只做拼接，不含样式逻辑
