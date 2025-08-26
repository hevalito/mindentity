/**
 * Letter patterns for string/letter mode
 * Ported from the original mindentitiyscript.mjs
 */

/**
 * Grid size for letter patterns
 */
export const LETTER_GRID_SIZE = 8;

/**
 * Letter pattern data using emoji representation
 * 🟩 = true (filled), 🟥 = false (empty)
 */
const LETTER_PATTERNS: Record<string, string> = {
  A: `
  🟥  🟥  🟩  🟩  🟩  🟩  🟥  🟥
  🟥  🟥  🟩  🟩  🟩  🟩  🟥  🟥
  🟥  🟩  🟩  🟥  🟥  🟩  🟩  🟥
  🟥  🟩  🟩  🟥  🟥  🟩  🟩  🟥
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  `,
  B: `
  🟩  🟩  🟩  🟩  🟩  🟩  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟩  🟥  🟥
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟥  🟥  🟩  🟩  🟩  🟩  🟥  🟥
  `,
  C: `
  🟥  🟥  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟥  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟥  🟥  🟥
  🟩  🟩  🟥  🟥  🟥  🟥  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟥  🟥  🟩  🟩  🟩  🟩  🟩  🟩
  `,
  D: `
  🟩  🟩  🟩  🟩  🟩  🟩  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟩  🟥  🟥
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟥  🟥
  `,
  E: `
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟩  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟩  🟥  🟥
  🟩  🟩  🟥  🟥  🟥  🟥  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  `,
  F: `
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟥  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟥  🟥  🟥
  🟩  🟩  🟥  🟥  🟥  🟥  🟥  🟥
  🟩  🟩  🟥  🟥  🟥  🟥  🟥  🟥
  🟩  🟩  🟥  🟥  🟥  🟥  🟥  🟥
  `,
  G: `
  🟥  🟥  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟥  🟥
  🟩  🟩  🟥  🟥  🟥  🟥  🟥  🟥
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟥  🟥  🟩  🟩  🟩  🟩  🟩  🟩
  `,
  H: `
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  `,
  I: `
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟥  🟥  🟥  🟩  🟩  🟥  🟥  🟥
  🟥  🟥  🟥  🟩  🟩  🟥  🟥  🟥
  🟥  🟥  🟥  🟩  🟩  🟥  🟥  🟥
  🟥  🟥  🟥  🟩  🟩  🟥  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  `,
  J: `
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟥  🟥  🟥  🟩  🟩  🟥  🟥  🟥
  🟥  🟥  🟥  🟩  🟩  🟥  🟥  🟥
  🟥  🟥  🟥  🟩  🟩  🟥  🟥  🟥
  🟥  🟥  🟥  🟩  🟩  🟥  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟥  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟥  🟥  🟥
  `,
  K: `
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟩  🟩  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟩  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟩  🟥  🟥
  🟩  🟩  🟥  🟥  🟩  🟩  🟥  🟥
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  `,
  L: `
  🟩  🟩  🟥  🟥  🟥  🟥  🟥  🟥
  🟩  🟩  🟥  🟥  🟥  🟥  🟥  🟥
  🟩  🟩  🟥  🟥  🟥  🟥  🟥  🟥
  🟩  🟩  🟥  🟥  🟥  🟥  🟥  🟥
  🟩  🟩  🟥  🟥  🟥  🟥  🟥  🟥
  🟩  🟩  🟥  🟥  🟥  🟥  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  `,
  M: `
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟩  🟥  🟥  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟥  🟩  🟩  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  `,
  N: `
  🟩  🟩  🟩  🟩  🟥  🟥  🟩  🟩
  🟩  🟩  🟩  🟩  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟩  🟩  🟥  🟩  🟩
  🟩  🟩  🟥  🟩  🟩  🟥  🟩  🟩
  🟩  🟩  🟥  🟩  🟩  🟥  🟩  🟩
  🟩  🟩  🟥  🟩  🟩  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟩  🟩  🟩  🟩
  🟩  🟩  🟥  🟥  🟩  🟩  🟩  🟩
  `,
  O: `
  🟥  🟥  🟩  🟩  🟩  🟩  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟥  🟥  🟩  🟩  🟩  🟩  🟥  🟥
  `,
  P: `
  🟩  🟩  🟩  🟩  🟩  🟩  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟥  🟥
  🟩  🟩  🟥  🟥  🟥  🟥  🟥  🟥
  `,
  Q: `
  🟥  🟥  🟩  🟩  🟩  🟩  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟩  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟥
  🟥  🟥  🟩  🟩  🟩  🟩  🟥  🟩
  `,
  R: `
  🟥  🟥  🟩  🟩  🟩  🟩  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟥  🟥
  🟩  🟩  🟥  🟥  🟩  🟩  🟩  🟥
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  `,
  S: `
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟥  🟥  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  `,
  T: `
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟥  🟥  🟥  🟩  🟩  🟥  🟥  🟥
  🟥  🟥  🟥  🟩  🟩  🟥  🟥  🟥
  🟥  🟥  🟥  🟩  🟩  🟥  🟥  🟥
  🟥  🟥  🟥  🟩  🟩  🟥  🟥  🟥
  🟥  🟥  🟥  🟩  🟩  🟥  🟥  🟥
  🟥  🟥  🟥  🟩  🟩  🟥  🟥  🟥
  `,
  U: `
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟥  🟩  🟩  🟩  🟩  🟩  🟩  🟥
  🟥  🟩  🟩  🟩  🟩  🟩  🟩  🟥
  `,
  V: `
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟥  🟩  🟩  🟥  🟥  🟩  🟩  🟥
  🟥  🟩  🟩  🟥  🟥  🟩  🟩  🟥
  🟥  🟥  🟩  🟩  🟩  🟩  🟥  🟥
  🟥  🟥  🟩  🟩  🟩  🟩  🟥  🟥
  🟥  🟥  🟥  🟩  🟩  🟥  🟥  🟥
  🟥  🟥  🟥  🟩  🟩  🟥  🟥  🟥
  `,
  W: `
  🟩  🟩  🟥  🟩  🟩  🟥  🟩  🟩
  🟩  🟩  🟥  🟩  🟩  🟥  🟩  🟩
  🟩  🟩  🟥  🟩  🟩  🟥  🟩  🟩
  🟩  🟩  🟥  🟩  🟩  🟥  🟩  🟩
  🟩  🟩  🟥  🟩  🟩  🟥  🟩  🟩
  🟩  🟩  🟥  🟩  🟩  🟥  🟩  🟩
  🟥  🟩  🟩  🟥  🟥  🟩  🟩  🟥
  🟥  🟩  🟩  🟥  🟥  🟩  🟩  🟥
  `,
  X: `
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟥  🟥  🟩  🟩  🟩  🟩  🟥  🟥
  🟥  🟥  🟩  🟩  🟩  🟩  🟥  🟥
  🟥  🟥  🟩  🟩  🟩  🟩  🟥  🟥
  🟥  🟥  🟩  🟩  🟩  🟩  🟥  🟥
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  `,
  Y: `
  🟩  🟩  🟥  🟥  🟥  🟥  🟩  🟩
  🟥  🟩  🟥  🟥  🟥  🟥  🟩  🟥
  🟥  🟩  🟩  🟥  🟥  🟩  🟩  🟥
  🟥  🟥  🟩  🟩  🟩  🟩  🟥  🟥
  🟥  🟥  🟥  🟩  🟩  🟥  🟥  🟥
  🟥  🟥  🟥  🟩  🟩  🟥  🟥  🟥
  🟥  🟥  🟥  🟩  🟩  🟥  🟥  🟥
  🟥  🟥  🟥  🟩  🟩  🟥  🟥  🟥
  `,
  Z: `
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟥  🟥  🟥  🟥  🟥  🟥  🟩  🟩
  🟥  🟥  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟥  🟥
  🟩  🟩  🟥  🟥  🟥  🟥  🟥  🟥
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  🟩  🟩  🟩  🟩  🟩  🟩  🟩  🟩
  `,
};

/**
 * Available letter keys
 */
export const AVAILABLE_LETTERS = Object.keys(LETTER_PATTERNS);

/**
 * Parse letter pattern from emoji string to boolean grid
 */
function parseLetterPattern(pattern: string): boolean[][] {
  const lines = pattern
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length !== LETTER_GRID_SIZE) {
    console.error(`Pattern has ${lines.length} rows, expected ${LETTER_GRID_SIZE}`);
    return [];
  }

  const grid: boolean[][] = [];
  
  for (let row = 0; row < lines.length; row++) {
    const line = lines[row];
    const cells = line.split(/\s+/).filter(cell => cell.length > 0);
    
    if (cells.length !== LETTER_GRID_SIZE) {
      console.error(`Row ${row} has ${cells.length} cells, expected ${LETTER_GRID_SIZE}`);
      return [];
    }

    const gridRow: boolean[] = [];
    for (let col = 0; col < cells.length; col++) {
      const cell = cells[col];
      gridRow[col] = cell === '🟥'; // 🟥 = true (filled), 🟩 = false (empty)
    }
    grid[row] = gridRow;
  }

  // Transpose the grid to match the original script's column-major format
  const transposed: boolean[][] = [];
  for (let col = 0; col < LETTER_GRID_SIZE; col++) {
    transposed[col] = [];
    for (let row = 0; row < LETTER_GRID_SIZE; row++) {
      transposed[col][row] = grid[row][col];
    }
  }

  return transposed;
}

/**
 * Get letter pattern as boolean grid
 */
export function getLetterPattern(letter: string): boolean[][] {
  const upperLetter = letter.toUpperCase();
  
  if (!AVAILABLE_LETTERS.includes(upperLetter)) {
    console.error(`Letter pattern not found for: ${letter}`);
    return [];
  }

  const pattern = LETTER_PATTERNS[upperLetter];
  return parseLetterPattern(pattern);
}

/**
 * Check if a letter pattern is available
 */
export function hasLetterPattern(letter: string): boolean {
  return AVAILABLE_LETTERS.includes(letter.toUpperCase());
}

/**
 * Get all available letters
 */
export function getAvailableLetters(): string[] {
  return [...AVAILABLE_LETTERS];
}

/**
 * Validate that all letter patterns are correctly formatted
 */
export function validateLetterPatterns(): boolean {
  for (const [letter, pattern] of Object.entries(LETTER_PATTERNS)) {
    const grid = parseLetterPattern(pattern);
    if (grid.length === 0) {
      console.error(`Invalid pattern for letter ${letter}`);
      return false;
    }
    if (grid.length !== LETTER_GRID_SIZE || grid.some(row => row.length !== LETTER_GRID_SIZE)) {
      console.error(`Letter ${letter} pattern is not ${LETTER_GRID_SIZE}x${LETTER_GRID_SIZE}`);
      return false;
    }
  }
  return true;
}

/**
 * Parse letter grid for string/letter modes
 * Returns a boolean grid where true means the cell should be excluded
 */
export function parseLetterGrid(input: string): boolean[][] {
  if (!input || input.length === 0) {
    return [];
  }

  // For single letter mode
  if (input.length === 1) {
    return getLetterPattern(input);
  }

  // For string mode, use the first letter
  // In the original script, string mode uses the string as a seed
  // but still displays the first letter's pattern
  const firstLetter = input[0];
  return getLetterPattern(firstLetter);
}
