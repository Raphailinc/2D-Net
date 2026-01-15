const COLORS = {
  U: "color-U",
  D: "color-D",
  L: "color-L",
  R: "color-R",
  F: "color-F",
  B: "color-B"
};

const MOVES = [
  "U", "U'", "U2",
  "D", "D'", "D2",
  "L", "L'", "L2",
  "R", "R'", "R2",
  "F", "F'", "F2",
  "B", "B'", "B2"
];

let state = createSolvedCube();
let scrambleSeq = [];

function createSolvedCube() {
  return {
    U: Array(9).fill("U"),
    D: Array(9).fill("D"),
    L: Array(9).fill("L"),
    R: Array(9).fill("R"),
    F: Array(9).fill("F"),
    B: Array(9).fill("B")
  };
}

function rotateFace(face) {
  const [a, b, c, d, e, f, g, h, i] = face;
  return [g, d, a, h, e, b, i, f, c];
}

function cycleGroups(groups) {
  const values = groups.map(({ face, idx }) => idx.map((i) => state[face][i]));
  for (let g = 0; g < groups.length; g++) {
    const from = values[(g + groups.length - 1) % groups.length];
    const { face, idx } = groups[g];
    idx.forEach((pos, i) => {
      state[face][pos] = from[i];
    });
  }
}

function applyMove(move) {
  const face = move[0];
  const modifier = move.slice(1);
  let turns = 1;
  if (modifier === "2") turns = 2;
  if (modifier === "'") turns = 3;

  for (let t = 0; t < turns; t++) {
    switch (face) {
      case "U":
        state.U = rotateFace(state.U);
        cycleGroups([
          { face: "F", idx: [0, 1, 2] },
          { face: "R", idx: [0, 1, 2] },
          { face: "B", idx: [0, 1, 2] },
          { face: "L", idx: [0, 1, 2] }
        ]);
        break;
      case "D":
        state.D = rotateFace(state.D);
        cycleGroups([
          { face: "F", idx: [6, 7, 8] },
          { face: "L", idx: [6, 7, 8] },
          { face: "B", idx: [6, 7, 8] },
          { face: "R", idx: [6, 7, 8] }
        ]);
        break;
      case "F":
        state.F = rotateFace(state.F);
        cycleGroups([
          { face: "U", idx: [6, 7, 8] },
          { face: "R", idx: [0, 3, 6] },
          { face: "D", idx: [2, 1, 0] },
          { face: "L", idx: [8, 5, 2] }
        ]);
        break;
      case "B":
        state.B = rotateFace(state.B);
        cycleGroups([
          { face: "U", idx: [0, 1, 2] },
          { face: "L", idx: [0, 3, 6] },
          { face: "D", idx: [8, 7, 6] },
          { face: "R", idx: [8, 5, 2] }
        ]);
        break;
      case "R":
        state.R = rotateFace(state.R);
        cycleGroups([
          { face: "U", idx: [2, 5, 8] },
          { face: "F", idx: [2, 5, 8] },
          { face: "D", idx: [2, 5, 8] },
          { face: "B", idx: [6, 3, 0] }
        ]);
        break;
      case "L":
        state.L = rotateFace(state.L);
        cycleGroups([
          { face: "U", idx: [0, 3, 6] },
          { face: "B", idx: [8, 5, 2] },
          { face: "D", idx: [0, 3, 6] },
          { face: "F", idx: [0, 3, 6] }
        ]);
        break;
    }
  }
}

function applySequence(seq) {
  seq
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach(applyMove);
  render();
}

function randomMove() {
  return MOVES[Math.floor(Math.random() * MOVES.length)];
}

function scramble() {
  scrambleSeq = Array.from({ length: 25 }, randomMove);
  applySequence(scrambleSeq.join(" "));
  document.getElementById("scramble-seq").textContent = scrambleSeq.join(" ");
}

function resetCube() {
  state = createSolvedCube();
  scrambleSeq = [];
  document.getElementById("scramble-seq").textContent = "–";
  render();
}

function createFaceElement(name) {
  const face = document.createElement("div");
  face.className = "face";
  face.dataset.face = name;
  for (let i = 0; i < 9; i++) {
    const tile = document.createElement("div");
    tile.className = `tile ${COLORS[state[name][i]]}`;
    face.appendChild(tile);
  }
  return face;
}

function render() {
  const cubeEl = document.getElementById("cube");
  cubeEl.innerHTML = "";

  const spacer = document.createElement("div");
  spacer.className = "face blank";

  // Layout:    [ ] [U] [ ]
  //            [L] [F] [R] [B]
  //            [ ] [D] [ ]
  const layout = [
    [null, "U", null],
    ["L", "F", "R", "B"],
    [null, "D", null]
  ];

  layout.forEach((row) => {
    row.forEach((cell) => {
      cubeEl.appendChild(cell ? createFaceElement(cell) : spacer.cloneNode());
    });
  });
}

function renderMoves() {
  const container = document.getElementById("moves");
  MOVES.forEach((move) => {
    const btn = document.createElement("button");
    btn.textContent = move;
    btn.addEventListener("click", () => {
      applyMove(move);
      render();
    });
    container.appendChild(btn);
  });
}

document.getElementById("scramble").addEventListener("click", scramble);
document.getElementById("reset").addEventListener("click", resetCube);
document.getElementById("apply-sequence").addEventListener("click", () => {
  const seq = document.getElementById("sequence").value;
  applySequence(seq);
});

renderMoves();
render();
