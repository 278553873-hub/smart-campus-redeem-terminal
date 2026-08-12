# 教师手机端内嵌图标资源

这些图标原本直接写在教师手机端页面代码中，不属于 `lucide-react` 导入。现已导出为独立 SVG，供 Vue 项目直接使用。

| 页面或组件 | 页面用途 | 文件 |
| --- | --- | --- |
| 公共页面 | 返回 | `back.svg` |
| 公共反馈 | 加载中 | `loading-spinner.svg` |
| 学期报告 | 删除高光 | `term-highlight-delete.svg` |
| 学期报告 | 更换图片、拍照 | `term-highlight-camera.svg` |
| 学期报告 | 查看大图 | `term-highlight-zoom-in.svg` |
| 学期报告 | 新增高光 | `term-highlight-add.svg` |
| 学期报告 | 上传图片 | `term-highlight-upload.svg` |
| 学期报告 | 从相册选择 | `term-highlight-gallery.svg` |
| 虚拟键盘 | 大写切换 | `keyboard-shift.svg` |
| 虚拟键盘 | 删除字符 | `keyboard-delete.svg` |
| 旧公共图标封装 | 打印 | `printer.svg` |
| 旧公共图标封装 | 分享 | `share-upload.svg` |

雷达图、头像进度环等由数据动态绘制的 SVG 属于图表组件，不是静态图标，因此未作为图标资源导出。
