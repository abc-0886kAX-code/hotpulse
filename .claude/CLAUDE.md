# CLAUDE.md

## 交流语言

**请始终使用中文与用户交流。** 所有代码注释、文档说明、提交信息都应使用中文（除非技术术语本身为英文）。

---

## 项目信息

项目特定信息（名称、技术栈版本、特殊依赖等）请参阅 `project-info.md`。

---

## 行为准则

### 1. 编码前先思考

实施之前：
- 明确说明你的假设。如有不确定，请提问。
- 如果存在多种解释，请列出它们 — 不要默默选择。
- 如果有更简单的方法，请说出来。
- 如果有不清楚的地方，停下来，说明困惑之处，提问。

### 2. 简单优先

- 不要添加要求之外的功能。
- 不要为一次性使用的代码创建抽象。
- 不要添加未被要求的"灵活性"或"可配置性"。
- 如果你写了 200 行代码但可以精简到 50 行，请重写。

### 3. 精准修改

编辑现有代码时：
- 不要"改进"相邻的代码、注释或格式。
- 不要重构没有问题的代码。
- 匹配现有风格，即使你会采用不同方式。
- 如果发现无关的死代码，请提及 — 不要删除。
- 删除因你的修改而未使用的导入/变量/函数。

### 4. 目标驱动执行

将任务转化为可验证的目标。对于多步骤任务，陈述简要计划：
```
1. [步骤] → 验证：[检查]
2. [步骤] → 验证：[检查]
3. [步骤] → 验证：[检查]
```

---

## 前端开发规范

### Vue 通用规范

- 优先使用 **Composition API**（`<script setup>`）
- Vue 2 项目允许使用 Options API，但新代码优先 Composition API
- 组件命名使用 **PascalCase**，文件名与组件名一致
- **Props 定义**：必须定义类型，推荐使用 TypeScript 接口
- **Emits 定义**：必须显式声明 `defineEmits`
- **避免 Props 下钻**超过 2 层，优先使用 provide/inject 或状态管理

### 组件结构（`<script setup>` 顺序）

```vue
<script setup lang="ts">
// 1. 类型定义
// 2. Props & Emits
// 3. 响应式数据 (ref, reactive, computed)
// 4. 方法
// 5. 生命周期钩子
// 6. Watch
// 7. 暴露 (defineExpose)
</script>

<template>
  <!-- 模板内容 -->
</template>

<style scoped lang="scss">
/* 样式 */
</style>
```

### TypeScript 规范

- 优先使用 `interface` 而非 `type`（除非需要联合类型）
- 避免 `any`，使用 `unknown` + 类型守卫代替
- API 响应类型集中定义在 `types/` 目录
- 组件 Props 使用 `defineProps<T>()` 泛型语法

### 样式规范

- 使用 **Scoped CSS**，避免样式污染
- 样式预处理使用 **Sass/SCSS**
- 颜色值使用项目主题变量，不硬编码
- 响应式断点统一使用项目约定值
- class 命名使用 BEM 或项目约定的命名规范

### 状态管理

- Vue 3：使用 **Pinia**
- Vue 2：使用 **Vuex**
- Store 按模块拆分，模块名与功能域对应
- 仅将需要跨组件共享的状态放入 Store

### 路由规范

- 路由配置集中管理在 `router/` 目录
- 懒加载路由：`() => import('@/views/xxx.vue')`
- 路由 meta 字段统一类型定义
- 嵌套路由层级不超过 3 层

### API 层规范

- 请求封装统一在 `api/` 或 `services/` 目录
- 按业务模块拆分 API 文件
- 请求/响应拦截器统一配置
- API 函数命名：`动词 + 资源名`（如 `getUserList`、`createOrder`）
- 错误处理统一在拦截器中，业务层只处理业务逻辑

### 目录结构规范

```
src/
├── api/              # API 请求
├── assets/           # 静态资源
├── components/       # 通用组件
│   └── [component]/  # 组件目录（同名文件夹）
├── composables/      # 组合式函数 (hooks)
├── constants/        # 常量定义
├── directives/       # 自定义指令
├── layouts/          # 布局组件
├── plugins/          # 插件配置
├── router/           # 路由配置
├── stores/           # 状态管理
├── styles/           # 全局样式
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
└── views/            # 页面组件
    └── [module]/     # 按模块分组
```

---

## 代码规范

- 使用 ESLint 进行代码检查
- 使用 `npm run lint` 检查代码，`npm run lint:fix` 自动修复
- 文件夹使用小写字母和连字符（kebab-case）

---

## 提交规范

提交信息使用中文，格式：
```
type(scope): description

例如：
feat(用户管理): 添加用户登录功能
fix(数据展示): 修复图表显示错误
docs(README): 更新部署说明
```

type 类型：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链更新
