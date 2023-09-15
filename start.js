const { readFileSync } = require('fs');
const { times, cloneDeep } = require('lodash');
const path = require('path');

const EMPTY_CHAR = '.';

const data = JSON.parse(readFileSync(path.resolve('puzzle.json')));
const size = data.lines[0]?.length;

const parseLine = (line) => (
  line
    .split('')
    .map((char) => (
      (char === EMPTY_CHAR)
        ? times(size, (i) => (i + 1))
        : [Number(char)]
    ))
);
const parseClues = (clues) => (
  clues
    .split('')
    .map((char) => (
      (char === EMPTY_CHAR)
        ? null
        : Number(char)
    ))
);

const removeDupes = (grid) => {

  const nextGrid = cloneDeep(grid);

  const getLineDupes = (line) => {
    const solved = line
      .filter((opts) => opts.length === 1)
      .map((opts) => opts[0]);

    return line.map((opts) => (
      (opts.length === 1)
        ? []
        : opts.filter((num) => solved.includes(num))
    ));
  }
  const getRowDupes = (index) => (
    getLineDupes(grid[index])
  );
  const getColDupes = (index) => (
    getLineDupes(times(size, (i) => grid[i][index]))
  );

  times(size, (i) => {
    const rowDupes = getRowDupes(i);
    const colDupes = getColDupes(i);

    times(size, (j) => {
      nextGrid[i][j] = nextGrid[i][j].filter((num) => (
        !rowDupes[j].includes(num)
      ));
      nextGrid[j][i] = nextGrid[j][i].filter((num) => (
        !colDupes[j].includes(num)
      ))
    });

  })

  return nextGrid;

}

const pruneByClues = (grid, gridClues) => {
  let nextGrid = cloneDeep(grid);

  const pruneLinesByClues = (lines, lineClues) => {
    let nextLines = cloneDeep(lines);

    const pruneLineByClue = (line, clue) => {
      let nextLine = cloneDeep(line);

      const cartesian = (...a) => (
        a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())))
      );

      const hasUniqElems = (a) => {
        return a.length === new Set(a).size;
      }

      const matchesClue = (cells) => {
        if (!clue) return true;

        let lastVisible = -1;
        let count = 0;

        cells.forEach((cell) => {
          if (cell > lastVisible) {
            count++;
            lastVisible = cell;
          }
        })

        return count === clue;
      }

      const possibleLines = cartesian(...nextLine)
        .filter((lineOpts) => hasUniqElems(lineOpts))
        .filter((lineOpts) => matchesClue(lineOpts));

      if (possibleLines?.length > 1000) {
        return nextLine;
      }

      nextLine = nextLine.map((cellOpts, i) => (
        cellOpts.filter((num) => (
          possibleLines.some((possibleLine) => (
            possibleLine[i] === num
          ))
        ))
      ));

      return nextLine;
    }

    return nextLines.map((l, i) => (
      pruneLineByClue(l, lineClues[i])
    ));

  }

  const rotateGridCCW = (grid) => {
    let nextGrid = cloneDeep(grid);
    times(size, (row) => {
      times(size, (col) => {
        nextGrid[row][col] = grid[col][grid.length - 1 - row]
      })
    })
    return nextGrid;
  }

  nextGrid = pruneLinesByClues(
    nextGrid,
    gridClues.l
  );
  nextGrid = pruneLinesByClues(
    rotateGridCCW(nextGrid),
    gridClues.t
  );
  nextGrid = pruneLinesByClues(
    rotateGridCCW(nextGrid),
    gridClues.r
  );
  nextGrid = pruneLinesByClues(
    rotateGridCCW(nextGrid),
    gridClues.b
  );

  return rotateGridCCW(nextGrid);

}

const logGrid = (grid) => {
  console.log(
    grid
      .map((line) => (
        line
          .map((opts) => (
            (opts?.length === 1)
              ? opts[0]
              : '.'
          ))
          .join(' ')
      ))
      .join('\n'),
      '\n'
  );
}

const isGridSolved = (grid) => (
  grid.every((line) => (
    line.every((cell) => cell.length === 1)
  ))
);

const percSolved = (grid) => {
  const solvedCount = grid.reduce((sum, line) => (
    sum + line.reduce((lineSum, cell) => (
      lineSum + ((cell?.length === 1) ? 1 : 0)
    ), 0)
  ), 0);
  return solvedCount / (size * size);
}

let grid = data.lines.map(parseLine);
const clues = {
  t: parseClues(data.clues.t),
  r: parseClues(data.clues.r),
  b: parseClues(data.clues.b),
  l: parseClues(data.clues.l)
}

while (!isGridSolved(grid)) {
  console.log(`${Math.round(percSolved(grid) * 100)}% solved...`);
  grid = removeDupes(grid);
  grid = pruneByClues(grid, clues);
}

console.log('');
logGrid(grid);
console.log('');
