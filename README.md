# Lab2Sim Project Page

论文 **"Lab2Sim: Turning Real-World Experiment Videos into Interactive Virtual Experiments"** 的项目主页。
布局风格参考 [WeVisOne-VL](https://tencent.github.io/WeVisOne-VL/)，内容全部取自
`../_ARR_Oct__arixv_public__Eduvideo2code_/acl_latex.tex`（ARR Oct 投稿版）。

## 本地预览

需要 HTTP 伺服（Demo iframe 内有 `fetch`，`file://` 直开不可用）：

```bash
cd project_page
python3 -m http.server 8080
# 打开 http://localhost:8080
```

## 目录结构

```
project_page/
├── index.html              # 单页主页（所有文案）
├── static/
│   ├── css/style.css       # 深色实验室风格样式
│   ├── js/main.js          # 粒子 Hero / 打字机 / 计数器 / 视频懒播放 / 终端动画 / 灯箱
│   ├── images/             # teaser / bench / method / case_study（论文 PDF 图转 PNG，已裁白边）
│   └── videos/             # Demo 对比视频
│       ├── original.mp4    # 原始实验视频（氢气燃烧，来自 v2-runs/30_氢气在空气里燃烧.mp4）
│       └── simulation.webm # EduVideo2Code 生成页面的浏览器操作录屏（自动录制）
└── demos/                  # EduVideo2Code 生成的真实虚拟实验（英文版，静态站，可交互）
    └── hydrogen-combustion/ # 氢气燃烧（Demo 区展示 + 试玩 CTA；v2-runs 产物翻译为英文）
```

Demo 页面来源：`../case-study/generated-en/cc-glm-plugin/` 与 `../v2-runs/30_氢气在空气里燃烧/app/dist`
（氢气燃烧 case 的中文 UI 已按实验室 translate_dist 思路整体替换为英文，脚本见 `../scripts/translate_h2_dist.py`）。
`simulation.webm` 由脚本操作生成页面实录（氢气燃烧完整 4 步：点燃 → 移开火柴 → 罩烧杯 → 水雾 + 成功面板）。

## 发布前待填（在 index.html 中搜索 `TODO`）

| 位置 | 待填内容 |
|---|---|
| Hero `Dataset` 按钮 | 数据集（HF / GitHub release）URL |

已填：GitHub → https://github.com/black1948/lab2sim ｜ arXiv → https://arxiv.org/abs/2611.02928（BibTeX 同步为 `arXiv:2611.02928`）

## 更新发布

```bash
cd project_page && ./deploy.sh "更新说明"
```

推送到 `gh-pages` 分支，约 1 分钟后 <https://black1948.github.io/lab2sim/> 生效。

## 部署到 GitHub Pages

1. 新建 `<org>.github.io` 仓库或项目仓库的 `gh-pages` 分支，把 `project_page/` 内容推上去（`index.html` 在根目录）。
2. Settings → Pages → 选择该分支即可；无需构建步骤。

## 内容口径备忘（均来自论文）

- 数据：218 视频（化学 89 / 物理 87 / 生物 42），均值 135.8 s、7.1 步、23.2 个状态转移、54.5 条/共 11,881 条 rubric；θ=0.8，T_max=10，平均 5.3 轮修复；标注约 13 min/视频。
- 主表与消融表数字：见 `index.html` 中 `results-table`（与论文 Table 2 / Table 3 逐项一致）。
- 若论文更新，同步改 `index.html`（表格、统计卡、hero 计数器）与 `static/images/` 四张图即可。
