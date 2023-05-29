import { $setCss, $remove, $appendTo, $el } from "fxdom";
import {
  hi,
  delay,
  isNil,
  mapC,
  difference,
  last,
  sortBy,
  identity,
  flat,
  when,
  reverse,
  find,
  range,
  flatL,
  each,
  chunk,
  zipWithIndexL,
  map,
  filter,
  go,
  not
} from "fxjs";
import * as Block from "./block";
import { block_size } from "../config";
import { transpose } from "../util";
const { log } = console;

const board_state = {
  w: null,
  h: null,
  coords: []
};

export const createBoard = (w, h) => {
  board_state.w = w;
  board_state.h = h;

  board_state.coords = go(Array(w * h).fill(false), chunk(w));

  const board$ = $el(`
    <div
      class="board"
      style="width: ${w * block_size}px;
        height: ${h * block_size}px;"
    >
      
    </div>`);

  board_state.el = board$;

  return board$;
};

// export const getBoardIdx = (idx) => {
//   const [row, col] = convertIdxToPos(idx);
//   return board_state.coords[row][col];
// };

export const getRandomIdx = () => {
  const flatted = board_state.coords.flat();
  const empty_len = flatted.filter(not).length - 1;
  const rand = Math.round(Math.random() * empty_len);
  let i = 0;
  const idx = flatted.findIndex((filled) => {
    if (filled) return false;
    const result = i == rand;
    i++;
    return result;
  });

  return idx == -1 ? null : idx;
};

export const convertIdxToPos = (idx) => [
  Math.floor(idx / board_state.w),
  idx % board_state.w
];

export const setIdx = (idx, data) => setPos(convertIdxToPos(idx), data);

export const setPos = ([r, c], block$, no_anim) => {
  block$
    ? $appendTo(board_state.el, block$)
    : $remove(board_state.coords[r][c]);
  board_state.coords[r][c] = block$;
  if (block$) Block.move(c, r, block$, { no_anim });
};

export const updateCoords = async (coords) => {
  board_state.coords = coords;
};

export const findIndexStep = (f, start, step, xs) => {
  for (let i = start + step; i < xs.length; i += step) {
    if (f(xs[i])) return i;
  }
  return undefined;
};

export const findNextBlock = (cur_idx, coordsWithIdx) =>
  findIndexStep(([, cord]) => cord, cur_idx, board_state.w, coordsWithIdx);

export const moveBlocks = async (direction) => {
  const coordsWithIdx = go(
    board_state.coords.flat(),
    zipWithIndexL,
    chunk(board_state.w),
    when(() => ["right", "left"].includes(direction), transpose),
    when(() => ["down", "right"].includes(direction), reverse),
    flat
  );

  const animations = [];

  for (let i = 0; i < coordsWithIdx.length; i++) {
    const [origin_idx, block$] = coordsWithIdx[i];
    const target_pos = convertIdxToPos(origin_idx).reverse();

    const next_block_idx = findNextBlock(i, coordsWithIdx);

    if (!next_block_idx) continue;

    const [next_origin_idx, next_block$] = coordsWithIdx[next_block_idx];

    // current empty
    if (!block$) {
      const next2_block_idx = findNextBlock(next_block_idx, coordsWithIdx);
      const next2_block$ = coordsWithIdx[next2_block_idx]?.[1];

      if (!next2_block_idx || !Block.compareVal(next2_block$, next_block$)) {
        log("그냥 옮기기");
        log(`Idx ${next_origin_idx} to ${origin_idx}`);
        // 그냥 옮기기
        coordsWithIdx[i] = [origin_idx, next_block$];
        coordsWithIdx[next_block_idx] = [next_origin_idx, false];
        animations.push(Block.move(...target_pos, next_block$));
      } else {
        const [next2_origin_idx, next2_block$] = coordsWithIdx[next2_block_idx];
        // 합쳐서 옮기기
        log("합쳐서 옮기기");
        log(`Idx ${next_origin_idx} and ${next2_block_idx} to ${origin_idx}`);
        coordsWithIdx[i] = [
          origin_idx,
          Block.update(next_block$.dataset.value * 2, next_block$)
        ];
        coordsWithIdx[next_block_idx] = [next_origin_idx, false];
        coordsWithIdx[next2_block_idx] = [next2_origin_idx, false];

        animations.push(
          Block.move(...target_pos, next_block$),
          Block.move(...target_pos, next2_block$, {
            onComplete: () => $remove(next2_block$)
          })
        );
      }

      continue;
    }

    if (!Block.compareVal(next_block$, block$)) continue;

    coordsWithIdx[next_block_idx] = [next_origin_idx, false];
    coordsWithIdx[i] = [
      origin_idx,
      Block.update(block$.dataset.value * 2, block$)
    ];

    animations.push(
      Block.move(...target_pos, next_block$, {
        onComplete: () => $remove(next_block$)
      })
    );
  }

  await go(
    coordsWithIdx,
    sortBy(([idx]) => idx),
    map(last),
    chunk(board_state.w),
    updateCoords
  );

  const rand_idx = getRandomIdx();
  if (isNil(rand_idx)) return true;
  const pos = convertIdxToPos(rand_idx);

  const new_rand_block$ = Block.createBlock(2);
  await Promise.all(animations).then(() => {
    setPos(pos, new_rand_block$, true);
  });

  console.log("move end");
};

export const getHighVal = () => {
  return go(
    board_state.coords,
    flatL,
    map((cord) => {
      return !cord ? 0 : cord.dataset.value;
    }),
    Math.max
  );
};
