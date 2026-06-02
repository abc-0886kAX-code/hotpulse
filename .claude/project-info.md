# 项目特定信息

> 新项目拷贝此配置后，修改此文件即可，无需改动 CLAUDE.md。

## 基本信息

- **项目名称**：孤山水库前端项目
- **项目描述**：孤山水库的数据管理和展示 Web 应用

## 技术栈版本

| 依赖 | 版本 |
|------|------|
| Vue | 3.2.47 |
| Element Plus | 2.4.2 |
| Vite | 4.3.2 |
| Pinia | 2.0.28 |
| Vue Router | 4.2.1 |
| Axios | 1.1.3 |
| ECharts | 6.0.0 |
| Day.js | 1.11.7 |
| Lodash-es | 4.17.21 |
| @vueuse/core | 9.9.0 |
| Sass | 1.89.1 |

## 项目特殊说明

- 集成了 Epicgames Pixel Streaming（UE5.4 像素流传输）
- 使用 v-scale-screen 实现大屏自适应
- 使用 NProgress 显示页面加载进度
- 使用 normalize.css 重置默认样式
- 使用 unplugin-auto-import 自动导入 Vue API
- 使用 unplugin-vue-components 自动注册组件
- 使用 unplugin-icons 自动导入图标

## 开发命令

- `npm run dev` - 启动开发服务器（--host 允许局域网访问）
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建
- `npm run lint` - ESLint 代码检查
- `npm run lint:fix` - ESLint 自动修复问题
