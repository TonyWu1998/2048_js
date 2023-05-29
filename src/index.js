import {
  identity,
  delay,
  mapL,
  hi,
  go,
  map,
  filter,
  range,
  blockUntil
} from "fxjs";
import { $off, $on, $el, $appendTo, $setHTML, $qs } from "fxdom";
import "./styles.css";
import * as Block from "./component/block";
import * as Board from "./component/board";
import { arrowKeys } from "./constant";
import { parseArrow } from "./event";
import * as Config from "./config";

const app$ = $qs("#app");

const init2048 = () => {
  const board$ = Board.createBoard(4, 4);

  $appendTo(app$, board$);

  const pos = go(Board.getRandomIdx(), Board.convertIdxToPos);

  const block$ = Block.createBlock(2);

  Board.setPos(pos, block$, true);

  // keyboard event
  const keydownEvent = [
    "keydown",
    blockUntil(async (e) => {
      const is_arrow = arrowKeys.includes(e.key);
      if (!is_arrow) return;
      console.log("\n\narrow", e.key);

      const fail = await Board.moveBlocks(parseArrow(e.key));

      // bug catcher
      if (board$.children.length > 9)
        console.log("----------- problem ---------------");

      if (fail) return console.log("end - fail");

      const higheset_val = Board.getHighVal();

      if (Config.end_value == higheset_val) {
        console.log("end!!");
        $off(...keydownEvent)(document.body);
      }
    }, identity)
  ];

  $on(...keydownEvent)(document.body);
};

init2048();
