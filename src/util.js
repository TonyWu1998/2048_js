import { zipWithIndexL, takeAll, range, reduce, go } from "fxjs";

export const transpose = (matrix) => {
  const head = matrix[0];
  if (!head) return [];
  const inner_length = head.length;
  return go(matrix, zipWithIndexL, takeAll, (index_rows) =>
    reduce(
      (acc, [row_idx, row]) => {
        row.forEach((val, col_idx) => (acc[col_idx][row_idx] = val));
        return acc;
      },
      range(inner_length).map(() => []),
      index_rows
    )
  );
};
