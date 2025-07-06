export interface UserLevel {
  level: number;
  title: string;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressToNextLevel: number; // 0-1 (percentage as decimal)
  totalXPNeeded: number;
}

export interface LevelDefinition {
  level: number;
  title: string;
  xpRequired: number;
  color: string;
  emoji: string;
}

// Level progression system inspired by Duolingo
export const LEVEL_DEFINITIONS: LevelDefinition[] = [
  { level: 1, title: "Spark Starter", xpRequired: 0, color: "#9E9E9E", emoji: "🌱" },
  { level: 2, title: "Habit Seeker", xpRequired: 100, color: "#8BC34A", emoji: "🔍" },
  { level: 3, title: "Momentum Builder", xpRequired: 300, color: "#4CAF50", emoji: "⚡" },
  { level: 4, title: "Consistency Keeper", xpRequired: 600, color: "#2196F3", emoji: "🎯" },
  { level: 5, title: "Routine Master", xpRequired: 1000, color: "#3F51B5", emoji: "🏆" },
  { level: 6, title: "Habit Hero", xpRequired: 1500, color: "#9C27B0", emoji: "🦸" },
  { level: 7, title: "Life Transformer", xpRequired: 2200, color: "#E91E63", emoji: "✨" },
  { level: 8, title: "Wellness Warrior", xpRequired: 3000, color: "#FF5722", emoji: "⚔️" },
  { level: 9, title: "Progress Pioneer", xpRequired: 4000, color: "#FF9800", emoji: "🚀" },
  { level: 10, title: "Lifespark Legend", xpRequired: 5500, color: "#FFC107", emoji: "👑" },
  { level: 11, title: "Habit Sage", xpRequired: 7500, color: "#FFEB3B", emoji: "🧙" },
  { level: 12, title: "Ultimate Achiever", xpRequired: 10000, color: "#FFD700", emoji: "🌟" },
];

// Add more levels with exponentially increasing XP requirements
const generateHigherLevels = (): LevelDefinition[] => {
  const higherLevels: LevelDefinition[] = [];
  let baseXP = 10000;
  
  for (let level = 13; level <= 50; level++) {
    baseXP = Math.floor(baseXP * 1.3); // 30% increase per level
    higherLevels.push({
      level,
      title: `Master Level ${level}`,
      xpRequired: baseXP,
      color: "#FFD700",
      emoji: "⭐"
    });
  }
  
  return higherLevels;
};

// Complete level system
export const ALL_LEVELS = [...LEVEL_DEFINITIONS, ...generateHigherLevels()];

/**
 * Calculate user's current level and progress based on total XP
 */
export const calculateUserLevel = (totalXP: number): UserLevel => {
  // Find the current level
  let currentLevel = ALL_LEVELS[0];
  let nextLevel = ALL_LEVELS[1];
  
  for (let i = 0; i < ALL_LEVELS.length - 1; i++) {
    if (totalXP >= ALL_LEVELS[i].xpRequired && totalXP < ALL_LEVELS[i + 1].xpRequired) {
      currentLevel = ALL_LEVELS[i];
      nextLevel = ALL_LEVELS[i + 1];
      break;
    }
  }
  
  // Handle max level
  if (totalXP >= ALL_LEVELS[ALL_LEVELS.length - 1].xpRequired) {
    currentLevel = ALL_LEVELS[ALL_LEVELS.length - 1];
    nextLevel = currentLevel; // Max level reached
  }
  
  // Calculate progress to next level
  const xpInCurrentLevel = totalXP - currentLevel.xpRequired;
  const xpNeededForNextLevel = nextLevel.xpRequired - currentLevel.xpRequired;
  const progressToNextLevel = nextLevel === currentLevel ? 1 : xpInCurrentLevel / xpNeededForNextLevel;
  
  return {
    level: currentLevel.level,
    title: currentLevel.title,
    currentXP: totalXP,
    xpForCurrentLevel: currentLevel.xpRequired,
    xpForNextLevel: nextLevel.xpRequired,
    progressToNextLevel: Math.min(progressToNextLevel, 1),
    totalXPNeeded: nextLevel === currentLevel ? 0 : xpNeededForNextLevel,
  };
};

/**
 * Get level definition by level number
 */
export const getLevelDefinition = (level: number): LevelDefinition => {
  return ALL_LEVELS.find(l => l.level === level) || ALL_LEVELS[0];
};

/**
 * Calculate XP needed to reach a specific level
 */
export const getXPNeededForLevel = (targetLevel: number): number => {
  const levelDef = getLevelDefinition(targetLevel);
  return levelDef.xpRequired;
};

/**
 * Check if user leveled up between two XP amounts
 */
export const checkLevelUp = (oldXP: number, newXP: number): { leveledUp: boolean; newLevel?: UserLevel; oldLevel?: UserLevel } => {
  const oldLevel = calculateUserLevel(oldXP);
  const newLevel = calculateUserLevel(newXP);
  
  return {
    leveledUp: newLevel.level > oldLevel.level,
    newLevel: newLevel.level > oldLevel.level ? newLevel : undefined,
    oldLevel: newLevel.level > oldLevel.level ? oldLevel : undefined,
  };
};

/**
 * Get XP multiplier based on level (higher levels get small bonus)
 */
export const getLevelXPMultiplier = (level: number): number => {
  if (level >= 10) return 1.2; // 20% bonus
  if (level >= 7) return 1.15; // 15% bonus
  if (level >= 5) return 1.1; // 10% bonus
  if (level >= 3) return 1.05; // 5% bonus
  return 1.0; // No bonus for levels 1-2
};