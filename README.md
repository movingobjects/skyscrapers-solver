# Skyscrapers Puzzle Solver

Work-in-progress (terribly inefficient, and may not solve tricky puzzles at all).

## Usage
`$ yarn start`

## Example JSON

For a puzzle that looks like this:

| |3|3|2|1|4|2|4| |
|---|---|---|---|---|---|---|---|---|
|4|.|.|.|.|.|.|4|2|
|3|.|.|.|1|.|.|.|2|
|1|.|2|.|.|.|.|.|4|
|3|.|.|.|.|.|.|.|3|
|2|5|.|.|.|3|.|.|4|
|2|2|.|.|.|.|4|.|2|
|2|.|.|4|.|.|.|.|1|
| |2|2|2|3|3|4|1| |

The `puzzle.json` file should look like this:

```json
{
  "lines": [
    "......4",
    "...1...",
    ".2.....",
    ".......",
    "5...3..",
    "2....4.",
    "..4...."
  ],
  "clues": {
    "top": "3321424",
    "rgt": "2243421",
    "btm": "2223341",
    "lft": "4313222"
  }
}
```