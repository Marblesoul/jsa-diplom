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
