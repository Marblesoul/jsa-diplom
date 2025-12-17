/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {
  const row = Math.floor(index / boardSize);
  const col = index % boardSize;
  const lastRow = boardSize - 1;
  const lastCol = boardSize - 1;

  // Check corners first
  if (row === 0 && col === 0) {
    return 'top-left';
  }
  if (row === 0 && col === lastCol) {
    return 'top-right';
  }
  if (row === lastRow && col === 0) {
    return 'bottom-left';
  }
  if (row === lastRow && col === lastCol) {
    return 'bottom-right';
  }

  // Check edges
  if (row === 0) {
    return 'top';
  }
  if (row === lastRow) {
    return 'bottom';
  }
  if (col === 0) {
    return 'left';
  }
  if (col === lastCol) {
    return 'right';
  }

  // Center cells
  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

/**
 * Генерирует массив доступных позиций для указанных столбцов на доске
 * @param {number} boardSize - размер доски (8 для доски 8x8)
 * @param {number[]} columns - массив номеров столбцов (0-based, например [0, 1] для столбцов 1-2)
 * @returns {number[]} массив индексов доступных позиций
 *
 * @example
 * ```js
 * // Returns: [0, 1, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 56, 57]
 * getPositionsForColumns(8, [0, 1]);
 * ```
 */
export function getPositionsForColumns(boardSize, columns) {
  const positions = [];
  for (let row = 0; row < boardSize; row += 1) {
    for (let col = 0; col < columns.length; col += 1) {
      positions.push(row * boardSize + columns[col]);
    }
  }
  return positions;
}

/**
 * Выбирает случайные уникальные позиции из массива доступных позиций
 * @param {number[]} availablePositions - массив доступных позиций
 * @param {number} count - количество позиций для выбора
 * @returns {number[]} массив выбранных позиций
 *
 * @example
 * ```js
 * selectRandomPositions([0, 1, 8, 9], 2); // [1, 8] (случайные)
 * ```
 */
export function selectRandomPositions(availablePositions, count) {
  if (count > availablePositions.length) {
    throw new Error('Cannot select more positions than available');
  }

  const positions = [...availablePositions];
  const selected = [];

  for (let i = 0; i < count; i += 1) {
    const randomIndex = Math.floor(Math.random() * positions.length);
    selected.push(positions[randomIndex]);
    positions.splice(randomIndex, 1);
  }

  return selected;
}
