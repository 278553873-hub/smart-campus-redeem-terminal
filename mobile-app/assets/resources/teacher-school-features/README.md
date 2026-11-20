# 学校版功能图标

通过内置 imagegen 以用户提供的「精准同步」图标为直接风格参考生成。统一橙黄渐变圆底、奶白浅浮雕符号和轻微投影，不带图内文字。透明 PNG 资源为192×192像素，在40×40像素圆形窗口内展示；统一裁切透明余量及圆外光晕，保持四枚图标的可见尺寸一致。生成原图保留在 Codex 的 generated_images 目录。

| 文件 | 语义与配色 |
| --- | --- |
| ai-assistant-v4.png | 对话气泡与智能星芒，表达智能助理 |
| custom-indicators-v4.png | 三条调节轨道与滑块，表达自定义评价指标 |
| growth-reports-v4.png | 报告文档与上升柱形图，表达多维成长分析 |
| education-tools-v4.png | 问卷清单与档案夹，表达问卷采集与档案设计 |
| personal-edition-background-v1.jpg | 同构浅银灰个人版底图，右侧浅浮雕层叠，中心近白留空 |
| school-edition-background-v1.jpg | 浅米金卡片底图，右侧边缘少量浅浮雕层叠，中心留白 |

完整生成提示词见 [generation-prompts.json](generation-prompts.json)。共同约束：沿用用户参考的渐变、圆底、奶白浮雕与光源；正视、清楚的功能符号、圆外透明、不带文字；不使用拟人机器人、玻璃、金属或宝石效果。每项分别生成。

`school-contact-qr.png` 依据用户于2026-11-11提供的真实联系二维码，由内置 imagegen 整理为1254×1254像素高清方图，并净化为纯黑白、清除背景杂色。保留完整码区、中央标识及四周均匀白色留边；使用系统二维码识别校验处理前后内容完全一致。独立用于两版对比卡片之外的最底部，不随卡片切换移动，显示为192×192像素，配文「扫码咨询学校版」。463×399像素用户原图保留在 `sources/school-contact-qr-original.png`，处理提示词见 `generation-prompts.json` 的 `contactQr` 字段。


个人版银灰底图由内置 imagegen 以学校版底图为参考编辑生成，输出压缩 JPEG（768×1152像素），提示词见 `generation-prompts.json` 的 `personalBackground` 字段。两版复用相同四枚功能图标，个人版通过界面灰度滤镜显示为银灰，不另存重复图标。
