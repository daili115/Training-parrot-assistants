import { SessionStats, Badge, GameSession, GameStats } from '../types';

export const BADGE_DEFINITIONS: Omit<Badge, 'unlockedAt'>[] = [
    {
        id: 'streak_7',
        name: '坚持不懈',
        description: '连续训练 7 天',
        icon: '🔥'
    },
    {
        id: 'streak_30',
        name: '毅力大师',
        description: '连续训练 30 天',
        icon: '👑'
    },
    {
        id: 'total_100',
        name: '百炼成钢',
        description: '累计播放超过 100 次',
        icon: '💯'
    },
    // 游戏相关徽章
    {
        id: 'game_1',
        name: '初试身手',
        description: '完成 1 个游戏',
        icon: '🎮'
    },
    {
        id: 'game_10',
        name: '游戏爱好者',
        description: '完成 10 个游戏',
        icon: '🕹️'
    },
    {
        id: 'game_50',
        name: '游戏大师',
        description: '完成 50 个游戏',
        icon: '🏆'
    },
    {
        id: 'score_1000',
        name: '千分达人',
        description: '单次游戏获得 1000 分',
        icon: '💯'
    },
    {
        id: 'perfect_game',
        name: '完美通关',
        description: '获得游戏满分',
        icon: '✨'
    }
];

function getDayString(timestamp: number): string {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function calculateStreak(history: SessionStats[]): number {
    if (history.length === 0) return 0;

    // Sort history by date descending
    const sorted = [...history].sort((a, b) => b.date - a.date);

    // Get unique days
    const uniqueDays = Array.from(new Set(sorted.map(s => getDayString(s.date))));

    if (uniqueDays.length === 0) return 0;

    const today = getDayString(Date.now());
    const yesterday = getDayString(Date.now() - 86400000);

    // If the last training was not today or yesterday, streak is broken (unless history is empty which is handled)
    if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) {
        return 0;
    }

    let streak = 1;
    let currentDay = new Date(uniqueDays[0]);

    for (let i = 1; i < uniqueDays.length; i++) {
        const prevDay = new Date(uniqueDays[i]);
        const expectedPrevDay = new Date(currentDay);
        expectedPrevDay.setDate(expectedPrevDay.getDate() - 1);

        if (getDayString(prevDay.getTime()) === getDayString(expectedPrevDay.getTime())) {
            streak++;
            currentDay = prevDay;
        } else {
            break;
        }
    }

    return streak;
}

export function checkNewBadges(
    history: SessionStats[],
    currentBadges: Badge[],
    totalPlays: number
): Badge[] {
    const newBadges: Badge[] = [];
    const streak = calculateStreak(history);
    const existingIds = new Set(currentBadges.map(b => b.id));

    // Check 7 Day Streak
    if (streak >= 7 && !existingIds.has('streak_7')) {
        const def = BADGE_DEFINITIONS.find(b => b.id === 'streak_7')!;
        newBadges.push({ ...def, unlockedAt: Date.now() });
    }

    // Check 30 Day Streak
    if (streak >= 30 && !existingIds.has('streak_30')) {
        const def = BADGE_DEFINITIONS.find(b => b.id === 'streak_30')!;
        newBadges.push({ ...def, unlockedAt: Date.now() });
    }

    // Check Total Plays
    if (totalPlays >= 100 && !existingIds.has('total_100')) {
        const def = BADGE_DEFINITIONS.find(b => b.id === 'total_100')!;
        newBadges.push({ ...def, unlockedAt: Date.now() });
    }

    return newBadges;
}

export function checkNewGameBadges(
    gameStats: GameStats,
    gameSessions: GameSession[],
    currentBadges: Badge[]
): Badge[] {
    const newBadges: Badge[] = [];
    const existingIds = new Set(currentBadges.map(b => b.id));

    // Check Game 1
    if (gameStats.gamesCompleted >= 1 && !existingIds.has('game_1')) {
        const def = BADGE_DEFINITIONS.find(b => b.id === 'game_1')!;
        newBadges.push({ ...def, unlockedAt: Date.now() });
    }

    // Check Game 10
    if (gameStats.gamesCompleted >= 10 && !existingIds.has('game_10')) {
        const def = BADGE_DEFINITIONS.find(b => b.id === 'game_10')!;
        newBadges.push({ ...def, unlockedAt: Date.now() });
    }

    // Check Game 50
    if (gameStats.gamesCompleted >= 50 && !existingIds.has('game_50')) {
        const def = BADGE_DEFINITIONS.find(b => b.id === 'game_50')!;
        newBadges.push({ ...def, unlockedAt: Date.now() });
    }

    // Check Score 1000
    if (gameStats.bestScore >= 1000 && !existingIds.has('score_1000')) {
        const def = BADGE_DEFINITIONS.find(b => b.id === 'score_1000')!;
        newBadges.push({ ...def, unlockedAt: Date.now() });
    }

    // Check Perfect Game
    if (gameStats.perfectGames >= 1 && !existingIds.has('perfect_game')) {
        const def = BADGE_DEFINITIONS.find(b => b.id === 'perfect_game')!;
        newBadges.push({ ...def, unlockedAt: Date.now() });
    }

    return newBadges;
}
