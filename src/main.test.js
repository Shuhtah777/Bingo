import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { generateTable } from "./counter.js";
//import { updateStarCells } from "./logic.js";
import "./style.css";

let table;

beforeEach(() => {
  table = generateTable(7);
  document.body.appendChild(table);
});

afterEach(() => {
  table.remove();
  const buttons = document.querySelectorAll("button");
  buttons.forEach(button => button.remove());
});

describe("generateTable", () => {
  it("повинна створювати таблицю 7x7", () => {
    const rows = table.querySelectorAll("tr");
    expect(rows.length).toBe(7); // 7 рядків
    rows.forEach(row => {
      expect(row.querySelectorAll("td").length).toBe(7); // 7 клітинок у кожному рядку
    });
  });

  
});
