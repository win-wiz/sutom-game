## 1. /guess 方法中的统计信息
```
// /guess 中返回的单词统计
wordStats: {
  totalAttempts: 150,        // 这个单词总共被尝试了150次
  totalSuccesses: 120,       // 成功猜出120次  
  successRate: 80,           // 成功率80%
  averageAttemptsToWin: 3.2, // 平均需要3.2次猜出
  averageGameTime: 180,      // 平均游戏时间3分钟
  perceivedDifficulty: 3.5,  // 感知难度评分
  sampleSize: 150,
  lastPlayed: "2024-01-10"
}
```

- 每日挑战统计：/daily-stats/:date - 针对特定日期的全服/个人统计
- 单词统计：/guess 中的 wordStats - 针对特定单词的历史表现统计


## 2. /stats 全局系统统计

```
// /stats 返回的全局统计
{
  overall: {
    totalSessions: 5420,      // 系统总游戏数
    completedSessions: 4800,  // 完成的游戏数
    wonSessions: 3600,        // 获胜的游戏数  
    winRate: 0.75,            // 全系统胜率75%
    averageAttempts: 4.2,     // 系统平均尝试次数
    averageGameTime: 210      // 系统平均游戏时间
  },
  dailyChallenge: {
    totalSessions: 1200       // 每日挑战总数
  }
}
```

- 用途：适合在首页或统计页面显示整个游戏系统的概览数据

## /daily-stats/:date 	每日挑战

```

// 全服统计
  server: {
    totalParticipants: challengeStats.server.totalParticipants,
    totalCompleted: challengeStats.server.totalCompleted,
    totalWon: challengeStats.server.totalWon,
    winRate: challengeStats.server.winRate,
    completionRate: challengeStats.server.completionRate,
    averageAttempts: challengeStats.server.averageAttempts,
    averageGameTime: challengeStats.server.averageGameTime,
    attemptsDistribution: challengeStats.server.attemptsDistribution,
    topPerformers: challengeStats.server.topPerformers,
    recentActivity: challengeStats.server.recentActivity,
    isActive: challengeStats.server.isActive
  },
  // 个人统计（如果有用户ID）
  personal: challengeStats.personal ? {
    todayStatus: challengeStats.personal.todayStatus,
    dailyStats: {
      dailyChallengesPlayed: challengeStats.personal.personalStats?.dailyChallengesPlayed || 0,
      dailyChallengesWon: challengeStats.personal.personalStats?.dailyChallengesWon || 0,
      dailyWinRate: challengeStats.personal.personalStats?.dailyWinRate || 0,
      currentDailyStreak: challengeStats.personal.personalStats?.currentDailyStreak || 0,
      longestDailyStreak: challengeStats.personal.personalStats?.longestDailyStreak || 0
    },
    overallStats: challengeStats.personal.personalStats ? {
      totalGamesPlayed: challengeStats.personal.personalStats.totalGamesPlayed,
      totalGamesWon: challengeStats.personal.personalStats.totalGamesWon,
      overallWinRate: challengeStats.personal.personalStats.overallWinRate,
      currentWinStreak: challengeStats.personal.personalStats.currentWinStreak,
      longestWinStreak: challengeStats.personal.personalStats.longestWinStreak,
      averageAttempts: challengeStats.personal.personalStats.averageAttempts,
      averageGameTime: challengeStats.personal.personalStats.averageGameTime,
      skillLevel: challengeStats.personal.personalStats.skillLevel
    } : null,
    recentHistory: challengeStats.personal.recentHistory
  }

```


| 接口 |	统计维度	| 用途	| 缓存策略 |
|----|----|----|----|
| /daily-stats/:date	| 每日挑战	 | 特定日期的全服/个人统计	| 实时获取 |
| /guess 的 wordStats  | 	单词级别  |	 单词历史表现，难度洞察	 |  游戏完成时返回 |
| /stats |	全局系统 |	整个系统概览数据 |	5分钟缓存 |
