/**
 * Stats Tracker Logic
 */

export const calculateNewStats = (currentStats, result, betAmount) => {
  const newStats = { ...currentStats };
  
  newStats.totalGames++;

  if (result === 'win' || result === 'blackjack') {
    newStats.wins++;
    newStats.winStreak++;
    const winAmount = result === 'blackjack' ? betAmount * 1.5 : betAmount;
    if (winAmount > newStats.biggestWin) {
      newStats.biggestWin = winAmount;
    }
  } else if (result === 'loss' || result === 'bust') {
    newStats.losses++;
    newStats.winStreak = 0;
    if (betAmount > newStats.biggestLoss) {
      newStats.biggestLoss = betAmount;
    }
  } else if (result === 'push') {
    newStats.pushes++;
    // Streak typically doesn't reset on push
  }

  return newStats;
};

export const getSessionSummary = (stats) => {
  return {
    games: stats.totalGames,
    wins: stats.wins,
    losses: stats.losses,
    profit: stats.sessionProfit,
    streak: stats.winStreak
  };
};
