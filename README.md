# Sutom Game

一个基于 T3 Stack 构建的猜词游戏，类似于 Wordle。

## 项目简介

Sutom 是一个 Web 端猜词游戏，玩家需要通过多次猜测来找到正确的单词。游戏具有以下特色：

- 🎮 类似 Wordle 的游戏玩法
- 🎹 支持法语键盘布局 (AZERTY)
- 🔊 丰富的音效反馈
- 📱 响应式设计，支持移动设备
- ⚡ 基于 T3 Stack 的现代技术栈

## 技术栈

- **Next.js 13+** - React 框架，使用 App Router
- **TypeScript** - 类型安全的 JavaScript
- **TailwindCSS** - 实用优先的 CSS 框架
- **React Hooks** - 状态管理和副作用处理

## 开始使用

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始游戏。

### 构建生产版本

```bash
npm run build
npm run start
```

## 游戏规则

1. 猜测目标单词，每次猜测都是一个完整的单词
2. 第一个字母已经给出作为提示
3. 提交猜测后，每个字母会显示不同的颜色：
   - 🟢 **绿色**: 字母正确且位置正确
   - 🟡 **黄色**: 字母正确但位置错误
   - ⚫ **灰色**: 字母不存在于目标单词中

## 游戏特色

### 音效反馈
- 找到正确字母时播放成功音效
- 字母位置错误时播放提示音效
- 字母不存在时播放错误音效
- 游戏获胜时播放胜利音效

### 键盘支持
- 支持物理键盘输入
- 提供虚拟键盘交互
- 键盘按键会根据使用情况显示对应状态

### 自定义单词
可以通过 URL 参数指定单词：
```
http://localhost:3000?word=<base64编码的单词>
```

例如：
```
http://localhost:3000?word=Ym9uam91cg==
```

## 项目结构

```
src/
├── app/                 # Next.js App Router 页面
├── components/          # React 组件
│   ├── Game.tsx        # 主游戏组件
│   ├── GameGrid.tsx    # 游戏网格组件
│   └── VirtualKeyboard.tsx # 虚拟键盘组件
├── hooks/              # 自定义 React Hooks
│   └── useGame.ts      # 游戏状态管理
├── lib/                # 工具函数
│   └── gameUtils.ts    # 游戏逻辑工具
├── types/              # TypeScript 类型定义
│   └── game.ts         # 游戏相关类型
└── styles/             # 样式文件
    └── globals.css     # 全局样式

doc/                     # 项目文档
├── requirements.md      # 需求文档
├── changes.md          # 改动记录
├── iterations.md       # 迭代过程
├── project-summary.md  # 项目总结
├── iteration-plan.md   # 迭代计划方案
└── index.md           # 文档索引
```

## 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建项目
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 代码格式化
npm run lint:fix
```

## 部署

项目可以部署到以下平台：

- [Vercel](https://vercel.com) (推荐)
- [Netlify](https://netlify.com)
- [Railway](https://railway.app)

## 贡献

欢迎提交 Issue 和 Pull Request 来改进项目。

## 许可证

MIT License
