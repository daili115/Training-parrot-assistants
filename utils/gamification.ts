import { SessionStats, Badge } from '../types';

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
