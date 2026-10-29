# AI 创作项目备份

本仓库只保存两个项目：

- `game/`：莲华古城 MOBA / 爆破 / 一分钟残局游戏，2.3.1。
- `learning-plan/`：Jarvais 的学习计划网站，包含 AI 创作路线、韩语学习和校内任务。

## 运行

需要 Python 3 和现代浏览器。在仓库根目录分别运行：

```sh
python3 -m http.server 8778 --directory game/dist
python3 -m http.server 8766 --directory learning-plan/dist
```

然后访问 `http://localhost:8778/` 或 `http://localhost:8766/`。两条命令分别在终端窗口运行。

游戏正式地址：https://lotus-clutch-play.snowypanda18.chatgpt.site/

学习计划网站：https://jarvais-learning-workbench.snowypanda18.chatgpt.site/

## 内容与边界

保留源码、必需资源、测试、项目文档和第三方许可。学习进度保存在使用者浏览器中，不包含个人浏览器存档。安装程序、临时网络工具、发布凭证、Git 内部目录和重复历史打包文件不属于本次备份。

游戏中的 Riot 名称及枪械图片用于个人学习，并非商业授权。第三方资源遵循各自许可，不能把整个仓库默认视为可商用。
