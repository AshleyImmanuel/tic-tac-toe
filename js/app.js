/**
 * Tic-Tac-Toe App Controller
 * Manages game state, UI rendering, keyboard shortcuts, turn logic, and event handlers.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const boardGrid = document.getElementById('board-grid');
  const winLineSvg = document.getElementById('win-line-svg');
  const turnBadge = document.getElementById('turn-badge');
  const turnText = document.getElementById('turn-text');
  const timerDisplay = document.getElementById('timer-display');
  
  const scoreXEl = document.getElementById('score-x');
  const scoreOEl = document.getElementById('score-o');
  const scoreTiesEl = document.getElementById('score-ties');
  const labelOEl = document.getElementById('label-o');

  const modePvpBtn = document.getElementById('mode-pvp');
  const modePveBtn = document.getElementById('mode-pve');
  const diffWrapper = document.getElementById('difficulty-wrapper');
  const diffEasyBtn = document.getElementById('diff-easy');
  const diffMediumBtn = document.getElementById('diff-medium');
  const diffImpossibleBtn = document.getElementById('diff-impossible');

  const grid3Btn = document.getElementById('grid-3');
  const grid4Btn = document.getElementById('grid-4');
  const grid5Btn = document.getElementById('grid-5');

  const undoBtn = document.getElementById('undo-btn');
  const resetBtn = document.getElementById('reset-btn');
  const soundToggleBtn = document.getElementById('sound-toggle');
  const historyBtn = document.getElementById('history-btn');
  
  const historyModal = document.getElementById('history-modal');
  const closeHistoryBtn = document.getElementById('close-history');
  const historyList = document.getElementById('history-list');
  const clearHistoryBtn = document.getElementById('clear-history');

  // Load Saved State
  let state = window.storageManager.loadState();
  let board = [];
  let moveHistory = []; // For Undo functionality
  let currentPlayer = 'X';
  let isGameActive = true;
  let timerInterval = null;
  let timerSeconds = 0;

  // Initialize Sound Settings
  window.soundEngine.setMuted(state.soundMuted);
  updateSoundIcon();

  // Initialize UI Selections
  updateConfigUI();

  // Setup Board
  initGame();

  // Event Listeners for Game Config
  modePvpBtn.addEventListener('click', () => setMode('pvp'));
  modePveBtn.addEventListener('click', () => setMode('pve'));

  diffEasyBtn.addEventListener('click', () => setDifficulty('easy'));
  diffMediumBtn.addEventListener('click', () => setDifficulty('medium'));
  diffImpossibleBtn.addEventListener('click', () => setDifficulty('impossible'));

  grid3Btn.addEventListener('click', () => setGridSize(3));
  grid4Btn.addEventListener('click', () => setGridSize(4));
  grid5Btn.addEventListener('click', () => setGridSize(5));

  undoBtn.addEventListener('click', handleUndo);
  resetBtn.addEventListener('click', () => {
    window.soundEngine.playClick();
    initGame();
  });

  soundToggleBtn.addEventListener('click', () => {
    state.soundMuted = !state.soundMuted;
    window.soundEngine.setMuted(state.soundMuted);
    window.storageManager.saveState(state);
    updateSoundIcon();
    window.soundEngine.playClick();
  });

  historyBtn.addEventListener('click', () => {
    window.soundEngine.playClick();
    renderHistoryModal();
    historyModal.classList.add('open');
  });

  closeHistoryBtn.addEventListener('click', () => {
    window.soundEngine.playClick();
    historyModal.classList.remove('open');
  });

  historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) {
      historyModal.classList.remove('open');
    }
  });

  clearHistoryBtn.addEventListener('click', () => {
    window.soundEngine.playClick();
    window.storageManager.clearHistory();
    state.history = [];
    renderHistoryModal();
  });

  // Keyboard navigation
  document.addEventListener('keydown', handleKeyboardNav);

  function initGame() {
    isGameActive = true;
    currentPlayer = 'X';
    moveHistory = [];
    winLineSvg.innerHTML = '';
    
    const totalCells = state.gridSize * state.gridSize;
    board = Array(totalCells).fill(null);

    // Update scoreboard labels (AI or Player 2)
    labelOEl.textContent = state.gameMode === 'pve' ? 'AI (O)' : 'Player O';
    updateScoresUI();
    updateTurnBanner();
    buildBoardDOM();
    updateUndoButtonState();
    startTimer();
  }

  function buildBoardDOM() {
    boardGrid.innerHTML = '';
    boardGrid.className = `tic-tac-grid grid-${state.gridSize}x${state.gridSize}`;

    for (let i = 0; i < board.length; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = i;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('tabindex', '0');
      cell.setAttribute('aria-label', `Cell ${i + 1}`);

      cell.addEventListener('click', () => handleCellClick(i));
      cell.addEventListener('mouseenter', () => {
        if (isGameActive && board[i] === null) {
          window.soundEngine.playHover();
        }
      });

      boardGrid.appendChild(cell);
    }
  }

  function handleCellClick(index) {
    if (!isGameActive || board[index] !== null) return;
    if (state.gameMode === 'pve' && currentPlayer === 'O') return; // AI is thinking

    makeMove(index, currentPlayer);

    // Check if PvE mode and game is still active
    if (isGameActive && state.gameMode === 'pve' && currentPlayer === 'O') {
      triggerAIMove();
    }
  }

  function makeMove(index, player) {
    board[index] = player;
    moveHistory.push({ index, player });

    const cell = boardGrid.children[index];
    cell.classList.add('occupied');
    cell.innerHTML = getSymbolSVG(player);

    if (player === 'X') {
      window.soundEngine.playPlaceX();
    } else {
      window.soundEngine.playPlaceO();
    }

    // Check Win or Draw
    const winTarget = state.gridSize === 3 ? 3 : 4;
    const winningCombo = window.aiEngine.getWinningCombination(board, state.gridSize, winTarget, player);

    if (winningCombo) {
      handleWin(player, winningCombo);
    } else if (board.every(cell => cell !== null)) {
      handleDraw();
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      updateTurnBanner();
      updateUndoButtonState();
      resetTimer();
    }
  }

  function triggerAIMove() {
    // Show subtle thinking indicator
    turnText.textContent = 'AI thinking...';
    
    setTimeout(() => {
      if (!isGameActive) return;
      const aiMove = window.aiEngine.getBestMove(board, state.gridSize, state.difficulty, 'O');
      if (aiMove !== -1) {
        makeMove(aiMove, 'O');
      }
    }, 350);
  }

  function handleWin(winner, winningCombo) {
    isGameActive = false;
    stopTimer();

    // Highlight winning cells
    winningCombo.forEach(idx => {
      if (boardGrid.children[idx]) {
        boardGrid.children[idx].classList.add('win-highlight');
      }
    });

    // Draw SVG winning line
    drawWinningLineSVG(winningCombo);

    // Sound and particle celebration
    window.soundEngine.playWin();
    window.particleEngine.triggerVictoryConfetti(winner);

    // Update Stats
    if (winner === 'X') {
      state.scores.x++;
      state.streak++;
    } else {
      state.scores.o++;
      state.streak = 0;
    }

    const winnerName = winner === 'X' ? 'Player X' : (state.gameMode === 'pve' ? 'AI' : 'Player O');
    turnText.textContent = `${winnerName} Wins!`;
    turnBadge.className = `turn-badge is-${winner.toLowerCase()}`;
    turnBadge.innerHTML = getSmallSymbolSVG(winner);

    // Save to match history
    saveMatchResult(winnerName, `${winner} Victory`);

    updateScoresUI();
    window.storageManager.saveState(state);
    updateUndoButtonState();
  }

  function handleDraw() {
    isGameActive = false;
    stopTimer();

    window.soundEngine.playDraw();

    state.scores.ties++;
    state.streak = 0;

    turnText.textContent = "It's a Draw!";
    turnBadge.className = 'turn-badge';
    turnBadge.innerHTML = getDrawSymbolSVG();

    saveMatchResult('Draw', 'Tie Game');

    updateScoresUI();
    window.storageManager.saveState(state);
    updateUndoButtonState();
  }

  function handleUndo() {
    if (moveHistory.length === 0) return;

    window.soundEngine.playClick();
    winLineSvg.innerHTML = '';
    isGameActive = true;

    if (state.gameMode === 'pve') {
      // Undo both AI move and Player move if AI played last
      let lastMove = moveHistory.pop();
      if (lastMove) clearCellUI(lastMove.index);

      if (lastMove && lastMove.player === 'O' && moveHistory.length > 0) {
        let playerMove = moveHistory.pop();
        if (playerMove) clearCellUI(playerMove.index);
      }
      currentPlayer = 'X';
    } else {
      // PvP mode undo single move
      let lastMove = moveHistory.pop();
      if (lastMove) {
        clearCellUI(lastMove.index);
        currentPlayer = lastMove.player;
      }
    }

    updateTurnBanner();
    updateUndoButtonState();
    startTimer();
  }

  function clearCellUI(index) {
    board[index] = null;
    const cell = boardGrid.children[index];
    if (cell) {
      cell.className = 'cell';
      cell.innerHTML = '';
    }
  }

  function drawWinningLineSVG(winningCombo) {
    if (winningCombo.length < 2) return;

    const firstCell = boardGrid.children[winningCombo[0]];
    const lastCell = boardGrid.children[winningCombo[winningCombo.length - 1]];
    const gridRect = boardGrid.getBoundingClientRect();

    const rect1 = firstCell.getBoundingClientRect();
    const rect2 = lastCell.getBoundingClientRect();

    const x1 = (rect1.left + rect1.width / 2) - gridRect.left;
    const y1 = (rect1.top + rect1.height / 2) - gridRect.top;
    const x2 = (rect2.left + rect2.width / 2) - gridRect.left;
    const y2 = (rect2.top + rect2.height / 2) - gridRect.top;

    const svgNS = "http://www.w3.org/2000/svg";
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('class', 'win-line-path');

    winLineSvg.appendChild(line);
  }

  function updateTurnBanner() {
    const name = currentPlayer === 'X' ? 'Player X' : (state.gameMode === 'pve' ? 'AI' : 'Player O');
    turnText.textContent = `${name}'s Turn`;
    turnBadge.className = `turn-badge is-${currentPlayer.toLowerCase()}`;
    turnBadge.innerHTML = getSmallSymbolSVG(currentPlayer);
  }

  function updateUndoButtonState() {
    undoBtn.disabled = moveHistory.length === 0 || !isGameActive;
  }

  function setMode(mode) {
    if (state.gameMode === mode) return;
    window.soundEngine.playClick();
    state.gameMode = mode;
    updateConfigUI();
    window.storageManager.saveState(state);
    initGame();
  }

  function setDifficulty(diff) {
    if (state.difficulty === diff) return;
    window.soundEngine.playClick();
    state.difficulty = diff;
    updateConfigUI();
    window.storageManager.saveState(state);
    if (state.gameMode === 'pve') initGame();
  }

  function setGridSize(size) {
    if (state.gridSize === size) return;
    window.soundEngine.playClick();
    state.gridSize = size;
    updateConfigUI();
    window.storageManager.saveState(state);
    initGame();
  }

  function updateConfigUI() {
    modePvpBtn.classList.toggle('active', state.gameMode === 'pvp');
    modePveBtn.classList.toggle('active', state.gameMode === 'pve');

    if (state.gameMode === 'pve') {
      diffWrapper.classList.remove('hidden');
      diffEasyBtn.classList.toggle('active', state.difficulty === 'easy');
      diffMediumBtn.classList.toggle('active', state.difficulty === 'medium');
      diffImpossibleBtn.classList.toggle('active', state.difficulty === 'impossible');
    } else {
      diffWrapper.classList.add('hidden');
    }

    grid3Btn.classList.toggle('active', state.gridSize === 3);
    grid4Btn.classList.toggle('active', state.gridSize === 4);
    grid5Btn.classList.toggle('active', state.gridSize === 5);
  }

  function updateScoresUI() {
    scoreXEl.textContent = state.scores.x;
    scoreOEl.textContent = state.scores.o;
    scoreTiesEl.textContent = state.scores.ties;
  }

  function updateSoundIcon() {
    soundToggleBtn.innerHTML = state.soundMuted ? getSoundOffSVG() : getSoundOnSVG();
    soundToggleBtn.setAttribute('data-tooltip', state.soundMuted ? 'Unmute Sound' : 'Mute Sound');
  }

  // Timer logic
  function startTimer() {
    stopTimer();
    timerSeconds = 0;
    updateTimerUI();
    timerInterval = setInterval(() => {
      if (isGameActive) {
        timerSeconds++;
        updateTimerUI();
      }
    }, 1000);
  }

  function resetTimer() {
    timerSeconds = 0;
    updateTimerUI();
  }

  function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
  }

  function updateTimerUI() {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    timerDisplay.innerHTML = `${getTimerSVG()} ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function saveMatchResult(winner, detail) {
    const record = {
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: state.gameMode === 'pve' ? `Vs AI (${state.difficulty})` : 'PvP',
      grid: `${state.gridSize}x${state.gridSize}`,
      winner: winner,
      detail: detail
    };
    state.history.unshift(record);
    if (state.history.length > 20) state.history.pop();
    window.storageManager.saveState(state);
  }

  function renderHistoryModal() {
    if (!state.history || state.history.length === 0) {
      historyList.innerHTML = `
        <div class="empty-history">
          ${getTrophySVG()}
          <p>No played matches yet in this session.</p>
        </div>
      `;
      return;
    }

    historyList.innerHTML = state.history.map(item => {
      let winnerClass = item.winner.includes('Player X') ? 'winner-x' : (item.winner.includes('Draw') ? 'winner-draw' : 'winner-o');
      return `
        <div class="history-item">
          <div class="history-winner ${winnerClass}">
            ${getTrophySVG()}
            <span>${item.winner}</span>
          </div>
          <div class="history-meta">
            ${item.mode} • ${item.grid} • ${item.date}
          </div>
        </div>
      `;
    }).join('');
  }

  function handleKeyboardNav(e) {
    if (!isGameActive) return;
    const activeEl = document.activeElement;
    if (!activeEl || !activeEl.classList.contains('cell')) return;

    const currentIndex = parseInt(activeEl.dataset.index, 10);
    const size = state.gridSize;
    let targetIndex = currentIndex;

    if (e.key === 'ArrowRight') {
      targetIndex = (currentIndex + 1) % (size * size);
    } else if (e.key === 'ArrowLeft') {
      targetIndex = (currentIndex - 1 + size * size) % (size * size);
    } else if (e.key === 'ArrowDown') {
      targetIndex = (currentIndex + size) % (size * size);
    } else if (e.key === 'ArrowUp') {
      targetIndex = (currentIndex - size + size * size) % (size * size);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCellClick(currentIndex);
      return;
    } else {
      return;
    }

    e.preventDefault();
    if (boardGrid.children[targetIndex]) {
      boardGrid.children[targetIndex].focus();
    }
  }

  // SVG Helper Libraries (STRICT NO EMOJIS)
  function getSymbolSVG(type) {
    if (type === 'X') {
      return `
        <div class="cell-symbol symbol-x">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round">
            <line x1="20" y1="20" x2="80" y2="80" />
            <line x1="80" y1="20" x2="20" y2="80" />
          </svg>
        </div>
      `;
    } else {
      return `
        <div class="cell-symbol symbol-o">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="12">
            <circle cx="50" cy="50" r="32" />
          </svg>
        </div>
      `;
    }
  }

  function getSmallSymbolSVG(type) {
    if (type === 'X') {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    } else {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="8"/></svg>`;
    }
  }

  function getDrawSymbolSVG() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5v14"/></svg>`;
  }

  function getSoundOnSVG() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
  }

  function getSoundOffSVG() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M23 9l-6 6M17 9l6 6"/></svg>`;
  }

  function getTimerSVG() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
  }

  function getTrophySVG() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`;
  }
});
