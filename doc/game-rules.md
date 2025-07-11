# Sutom 游戏规则与玩法指南

## 🎮 游戏概述

Sutom 是一个基于法语的猜词游戏，类似于 Wordle。玩家需要通过逐个字母的猜测来找到正确的目标单词。

## 🎯 游戏目标

**主要目标**: 猜出正确的目标单词

## 🎲 游戏玩法

### 基本规则

1. **目标单词**
   - 游戏开始时会给出一个目标单词（通过 URL 参数指定）
   - 默认单词是 "cacophonie"（法语，意为"刺耳的声音"）
   - 第一个字母会作为提示显示出来

2. **输入方式**
   - 可以使用物理键盘输入（A-Z）
   - 可以点击虚拟键盘（法语 AZERTY 布局）
   - 支持退格键删除字母
   - 按回车键或点击 ↲ 提交当前猜测

3. **猜测过程**
   - 每次需要输入一个完整的单词
   - 单词长度必须与目标单词完全一致
   - 不能跳过字母，必须填满所有位置

## 🎨 反馈系统

### 颜色反馈

每次提交猜测后，系统会逐个检查字母并给出颜色反馈：

| 颜色 | 含义 | CSS 类 | 十六进制色值 |
|------|------|--------|-------------|
| 🟢 **绿色** | 字母正确且位置正确 | `.found` | #e7002a |
| 🟡 **黄色** | 字母正确但位置错误 | `.wrong` | #ffbd00 |
| ⚫ **灰色** | 字母不存在于目标单词中 | `.not-found` | #707070 |
| 🔵 **蓝色** | 默认状态（未检查） | `.default` | #0077c7 |

### 音效反馈

- **找到正确字母**: `found.wav` - 成功音效
- **位置错误**: `wrong.wav` - 提示音效  
- **字母不存在**: `not-found.wav` - 错误音效
- **游戏胜利**: `win.mp3` - 胜利音效

### 键盘状态同步

虚拟键盘的按键会根据使用情况显示对应的颜色状态，帮助玩家记住已经尝试过的字母。

## ⚠️ 当前实现的问题与限制

### 1. 词典验证问题

**❌ 当前状态**: 
```javascript
// 原始代码中没有词典验证
const checkWord = async() => {
  const cells = Array.from(document.querySelectorAll('.current .cell'));
  // 只检查是否填满，不验证是否为有效单词
  if (cells.map((cell) => cell.innerHTML).join('').includes('.')) {
    return;
  }
  // 直接进行字母匹配检查
}
```

**问题**: 
- ❌ 没有词典验证机制
- ❌ 任何字母组合都可以提交（只要长度匹配）
- ❌ 可以输入无意义的字母组合

**建议改进**:
```typescript
// 建议的词典验证实现
const FRENCH_DICTIONARY = [
  'cacophonie', 'telephone', 'ordinateur', 'clavier', 'souris'
  // ... 更多法语单词
];

const isValidWord = (word: string): boolean => {
  return FRENCH_DICTIONARY.includes(word.toLowerCase());
};

const checkWord = async () => {
  const currentWord = getCurrentWord();
  
  // 首先验证是否为有效单词
  if (!isValidWord(currentWord)) {
    showError('请输入一个有效的法语单词');
    return;
  }
  
  // 然后进行字母匹配检查
  // ...
};
```

### 2. 游戏结束条件

**❌ 当前状态**:
```javascript
// 只有胜利条件，没有失败条件
if (nextLetters.join('') === word) {
  // 游戏胜利
  const audioWin = new Audio('sound/win.mp3');
  audioWin.play();
  // 移除事件监听器和键盘
  return;
}

// 没有失败条件，可以无限次尝试
addLine(nextLetters);
```

**问题**:
- ❌ 没有最大尝试次数限制
- ❌ 理论上可以无限次猜测
- ❌ 缺少失败条件和相应的游戏结束逻辑

**建议改进**:
```typescript
// 建议的游戏结束机制
interface GameConfig {
  maxAttempts: number;     // 最大尝试次数（建议 6 次）
  timeLimit?: number;      // 时间限制（可选）
}

interface GameState {
  currentAttempt: number;
  maxAttempts: number;
  gameStatus: 'playing' | 'won' | 'lost';
}

const checkGameEnd = (gameState: GameState, isCorrect: boolean) => {
  if (isCorrect) {
    return { status: 'won', message: '恭喜！您猜对了！' };
  }
  
  if (gameState.currentAttempt >= gameState.maxAttempts) {
    return { 
      status: 'lost', 
      message: `游戏结束！正确答案是：${targetWord}` 
    };
  }
  
  return { status: 'playing', message: '' };
};
```

## ✅ 建议的完整游戏规则

### 改进后的游戏流程

1. **开始游戏**
   - 显示目标单词的第一个字母
   - 玩家有 **6 次** 猜测机会

2. **输入验证**
   - 输入必须是有效的法语单词
   - 单词长度必须匹配目标单词
   - 从预定义词典中验证

3. **反馈机制**
   - 颜色反馈：绿色（正确位置）、黄色（错误位置）、灰色（不存在）
   - 音效反馈：不同状态播放不同音效
   - 键盘状态同步显示

4. **结束条件**
   - **胜利**: 猜出正确单词
   - **失败**: 用完所有 6 次机会仍未猜对
   - **放弃**: 玩家主动退出（可选功能）

### 技术实现建议

```typescript
// 游戏配置
const GAME_CONFIG = {
  maxAttempts: 6,
  enableDictionary: true,
  enableTimeLimit: false,
  showHints: true
};

// 词典管理
class DictionaryManager {
  private dictionary: Set<string>;
  
  constructor(words: string[]) {
    this.dictionary = new Set(words.map(w => w.toLowerCase()));
  }
  
  isValidWord(word: string): boolean {
    return this.dictionary.has(word.toLowerCase());
  }
  
  getSimilarWords(word: string): string[] {
    // 返回相似的单词作为提示
  }
}

// 游戏状态管理
class GameManager {
  private attempts: number = 0;
  private maxAttempts: number;
  private dictionary: DictionaryManager;
  
  checkWord(word: string): GameResult {
    // 1. 验证词典
    if (!this.dictionary.isValidWord(word)) {
      return { valid: false, error: '无效单词' };
    }
    
    // 2. 检查字母匹配
    const result = this.checkLetters(word);
    
    // 3. 检查游戏结束条件
    return this.checkGameEnd(result);
  }
}
```

## 🎲 自定义单词玩法

### URL 参数设置

玩家可以通过 URL 参数自定义目标单词：

```
http://localhost:3000?word=<base64编码的单词>
```

**示例**:
- `bonjour` → `Ym9uam91cg==`
- `telephone` → `dGVsZXBob25l`
- `ordinateur` → `b3JkaW5hdGV1cg==`

### Base64 编码工具

```javascript
// 编码单词
const encodeWord = (word) => btoa(word);

// 解码单词  
const decodeWord = (encoded) => atob(encoded);

// 示例
console.log(encodeWord('bonjour')); // "Ym9uam91cg=="
```

## 📊 难度等级建议

### 初级 (3-5 字母)
- `chat` (猫)
- `eau` (水)  
- `pain` (面包)

### 中级 (6-8 字母)
- `bonjour` (你好)
- `telephone` (电话)
- `clavier` (键盘)

### 高级 (9+ 字母)
- `cacophonie` (刺耳声音)
- `ordinateur` (计算机)
- `refrigerateur` (冰箱)

## 🔧 未来改进建议

### 短期改进
1. **添加词典验证** - 防止无意义输入
2. **设置尝试次数限制** - 增加游戏挑战性
3. **改进错误提示** - 提供更好的用户反馈

### 中期改进
1. **难度选择** - 不同长度的单词
2. **提示系统** - 给出单词类别或释义
3. **统计功能** - 记录游戏历史和胜率

### 长期改进
1. **每日挑战** - 每天一个固定单词
2. **多语言支持** - 支持英语、中文等
3. **社交功能** - 分享结果、排行榜

## 🎯 总结

当前的 Sutom 游戏实现了基本的猜词机制，但在以下方面需要改进：

**✅ 已实现的功能**:
- 基本的猜词游戏逻辑
- 颜色和音效反馈系统
- 键盘交互支持
- 自定义单词功能

**❌ 需要改进的问题**:
- 缺少词典验证
- 没有游戏失败条件
- 无尝试次数限制
- 缺少错误处理

建议在下一个迭代中优先解决这些核心游戏规则问题，以提供更完整和合理的游戏体验。 