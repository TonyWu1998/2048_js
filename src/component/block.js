import anime from "animejs";
import { $remove, $addClass, $setHTML, $setAttr, $setCss, $el } from "fxdom";
import { block_size } from "../config";
import { identity } from "fxjs";

const block_state = new WeakMap();

const block_colors = [
  "#fff3e0",
  "#ffe0b2",
  "#ffcc80",
  "#ffb74d",
  "#ffa726",
  "#ff9800",
  "#fb8c00",
  "#f57c00",
  "#ef6c00",
  "#e65100",
  "#e64a19",
  "#d84315",
  "#bf360c"
];

export const getColor = (n) => block_colors[Math.log2(n) - 1];

export const createBlock = (n) => {
  const el$ = $el(`<div
  class="block" data-value="${n}" data-size="${block_size}"
  style="width: ${block_size}px; height: ${block_size}px; font-size: ${
    block_size / 3
  }px "
>
<div class="background" style="background-color: ${getColor(n)};">
${n}
</div>
</div>`);

  block_state.set(el$, { n });

  return el$;
};

export const getRandomNumber = () => {
  return 2;
};

export const mergeBlock = (b1, b2) => {};

export const hideBlock = (block_data, target) => {};

export const getBlockData = (block$) => block_state.get(block$);

export const move = async (
  w,
  h,
  block$,
  { no_anim, onComplete = identity, scaleIn } = {}
) => {
  return anime({
    targets: block$,
    left: `${w * block_size}px`,
    top: `${h * block_size}px`,
    duration: no_anim ? 0 : 300,
    easing: "linear",
    complete: () => onComplete(block$)
  }).finished;
};

export const update = (n, block$) => {
  $setAttr({ "data-value": n }, block$);
  $setHTML(
    `<div class="background" style="background-color: ${getColor(n)};">
  ${n}
  </div>`,
    block$
  );
  return block$;
};

export const compareVal = (b1$, b2$) =>
  !b1$ || !b2$ ? false : b1$.dataset.value == b2$.dataset.value;
