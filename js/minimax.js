/**
 * AI Engine using Minimax Algorithm with Alpha-Beta Pruning
 * Handles Easy, Medium, and Impossible difficulties for 3x3, 4x4, and 5x5 grids.
 */

class AIEngine {
  constructor() {}

  /**
   * Get best move based on difficulty and board state
   * @param {Array} board - Array representing board cells (null, 'X', 'O')
   * @param {number} gridSize - 3, 4, or 5
   * @param {string} difficulty - 'easy', 'medium', 'impossible'
   * @param {string} aiPlayer - 'O' or 'X'
   * @returns {number} Index of chosen cell
   */
  getBestMove(board, gridSize, difficulty, aiPlayer) {
    const humanPlayer = aiPlayer === 'O' ? 'X' : 'O';
    const winTarget = gridSize === 3 ? 3 : 4; // 3 in a row for 3x3, 4 in a row for 4x4 and 5x5
    const emptyIndices = this.getEmptyIndices(board);

    if (emptyIndices.length === 0) return -1;

    // Easy Difficulty: Semi-random move
    if (difficulty === 'easy') {
      // 20% chance to block/win if immediate, 80% random
      if (Math.random() < 0.2) {
        const winningMove = this.findImmediateWinningMove(board, gridSize, winTarget, aiPlayer);
        if (winningMove !== -1) return winningMove;
      }
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    // Medium Difficulty: Always takes immediate win or blocks immediate human win, else strategic
    if (difficulty === 'medium') {
      const immediateWin = this.findImmediateWinningMove(board, gridSize, winTarget, aiPlayer);
      if (immediateWin !== -1) return immediateWin;

      const immediateBlock = this.findImmediateWinningMove(board, gridSize, winTarget, humanPlayer);
      if (immediateBlock !== -1) return immediateBlock;

      // Prefer center or corners
      const center = Math.floor(board.length / 2);
      if (board[center] === null && Math.random() < 0.6) return center;

      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    // Impossible Difficulty: Minimax Algorithm
    if (difficulty === 'impossible') {
      // 1. Check immediate win or block for high speed
      const immediateWin = this.findImmediateWinningMove(board, gridSize, winTarget, aiPlayer);
      if (immediateWin !== -1) return immediateWin;

      const immediateBlock = this.findImmediateWinningMove(board, gridSize, winTarget, humanPlayer);
      if (immediateBlock !== -1) return immediateBlock;

      // 2. Run Minimax with Alpha-Beta Pruning
      // For 3x3, search max depth 9. For 4x4/5x5, limit search depth to 3 or 4 to maintain instant response.
      const maxDepth = gridSize === 3 ? 9 : 3;
      let bestScore = -Infinity;
      let bestMove = emptyIndices[0];

      // Shuffle empty indices slightly to add variance among equal best moves
      const shuffledIndices = [...emptyIndices].sort(() => Math.random() - 0.5);

      for (let index of shuffledIndices) {
        board[index] = aiPlayer;
        let score = this.minimax(board, 0, false, -Infinity, Infinity, gridSize, winTarget, aiPlayer, humanPlayer, maxDepth);
        board[index] = null;

        if (score > bestScore) {
          bestScore = score;
          bestMove = index;
        }
      }

      return bestMove;
    }

    return emptyIndices[0];
  }

  getEmptyIndices(board) {
    const indices = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) indices.push(i);
    }
    return indices;
  }

  findImmediateWinningMove(board, gridSize, winTarget, player) {
    const emptyIndices = this.getEmptyIndices(board);
    for (let index of emptyIndices) {
      board[index] = player;
      const isWin = this.checkWinState(board, gridSize, winTarget, player);
      board[index] = null;
      if (isWin) return index;
    }
    return -1;
  }

  minimax(board, depth, isMaximizing, alpha, beta, gridSize, winTarget, aiPlayer, humanPlayer, maxDepth) {
    if (this.checkWinState(board, gridSize, winTarget, aiPlayer)) {
      return 10 - depth;
    }
    if (this.checkWinState(board, gridSize, winTarget, humanPlayer)) {
      return depth - 10;
    }
    const emptyIndices = this.getEmptyIndices(board);
    if (emptyIndices.length === 0 || depth >= maxDepth) {
      return 0; // Draw or depth limit reached
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let index of emptyIndices) {
        board[index] = aiPlayer;
        let evaluation = this.minimax(board, depth + 1, false, alpha, beta, gridSize, winTarget, aiPlayer, humanPlayer, maxDepth);
        board[index] = null;
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break; // Alpha-beta cutoff
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let index of emptyIndices) {
        board[index] = humanPlayer;
        let evaluation = this.minimax(board, depth + 1, true, alpha, beta, gridSize, winTarget, aiPlayer, humanPlayer, maxDepth);
        board[index] = null;
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break; // Alpha-beta cutoff
      }
      return minEval;
    }
  }

  /**
   * Universal win check function for arbitrary grid size and target length
   */
  checkWinState(board, size, target, player) {
    const winningCombo = this.getWinningCombination(board, size, target, player);
    return winningCombo !== null;
  }

  getWinningCombination(board, size, target, player) {
    // Check Rows
    for (let r = 0; r < size; r++) {
      for (let c = 0; c <= size - target; c++) {
        let win = true;
        let combo = [];
        for (let k = 0; k < target; k++) {
          const idx = r * size + (c + k);
          combo.push(idx);
          if (board[idx] !== player) {
            win = false;
            break;
          }
        }
        if (win) return combo;
      }
    }

    // Check Columns
    for (let c = 0; c < size; c++) {
      for (let r = 0; r <= size - target; r++) {
        let win = true;
        let combo = [];
        for (let k = 0; k < target; k++) {
          const idx = (r + k) * size + c;
          combo.push(idx);
          if (board[idx] !== player) {
            win = false;
            break;
          }
        }
        if (win) return combo;
      }
    }

    // Check Diagonals (Top-Left to Bottom-Right)
    for (let r = 0; r <= size - target; r++) {
      for (let c = 0; c <= size - target; c++) {
        let win = true;
        let combo = [];
        for (let k = 0; k < target; k++) {
          const idx = (r + k) * size + (c + k);
          combo.push(idx);
          if (board[idx] !== player) {
            win = false;
            break;
          }
        }
        if (win) return combo;
      }
    }

    // Check Anti-Diagonals (Top-Right to Bottom-Left)
    for (let r = 0; r <= size - target; r++) {
      for (let c = target - 1; c < size; c++) {
        let win = true;
        let combo = [];
        for (let k = 0; k < target; k++) {
          const idx = (r + k) * size + (c - k);
          combo.push(idx);
          if (board[idx] !== player) {
            win = false;
            break;
          }
        }
        if (win) return combo;
      }
    }

    return null;
  }
}

window.aiEngine = new AIEngine();
