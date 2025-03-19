import { describe, it, expect } from 'vitest';
import { checkWin, updateFavicon, createFavicon, updateStarCells, highlightDuplicates } from './logic.js';
import { generateTable } from "./counter.js";
import "./style.css";

// Мокируем DOM-элементы для тестирования


describe('checkWin', () => {
  function createMockTable(matrix) {
    const table = document.createElement('table');
    matrix.forEach(rowData => {
      const row = document.createElement('tr');
      rowData.forEach(cellData => {
        const cell = document.createElement('td');
        if (cellData.selected) cell.classList.add('selected');
        if (cellData.error) cell.classList.add('error');
        cell.textContent = cellData.value || '';
        row.appendChild(cell);
      });
      table.appendChild(row);
    });
    return table;
  }

  it('должна возвращать true, если есть выигрышная строка', () => {
    const table = createMockTable([
      [{ selected: true }, { selected: true }, { selected: true }],
      [{}, {}, {}],
      [{}, {}, {}]
    ]);
    const result = checkWin(table);
    expect(result.hasBingo).toBe(true);
    expect(result.hasErrors).toBe(false);
  });

  it('должна возвращать true, если есть выигрышная колонка', () => {
    const table = createMockTable([
      [{ selected: true }, {}, {}],
      [{ selected: true }, {}, {}],
      [{ selected: true }, {}, {}]
    ]);
    const result = checkWin(table);
    expect(result.hasBingo).toBe(true);
    expect(result.hasErrors).toBe(false);
  });

  it('должна возвращать true, если есть выигрышная диагональ', () => {
    const table = createMockTable([
      [{ selected: true }, {}, {}],
      [{}, { selected: true }, {}],
      [{}, {}, { selected: true }]
    ]);
    const result = checkWin(table);
    expect(result.hasBingo).toBe(true);
    expect(result.hasErrors).toBe(false);
  });

  it('должна возвращать true, если есть обратная диагональ', () => {
    const table = createMockTable([
      [{}, {}, { selected: true }],
      [{}, { selected: true }, {}],
      [{ selected: true }, {}, {}]
    ]);
    const result = checkWin(table);
    expect(result.hasBingo).toBe(true);
    expect(result.hasErrors).toBe(false);
  });

  it('должна возвращать true для ошибок (hasErrors), если есть ячейки с классом "error"', () => {
    const table = createMockTable([
      [{ error: true }, {}, {}],
      [{}, {}, {}],
      [{}, {}, {}]
    ]);
    const result = checkWin(table);
    expect(result.hasBingo).toBe(false);
    expect(result.hasErrors).toBe(true);
  });

  it('должна возвращать false, если нет выигрыша и ошибок', () => {
    const table = createMockTable([
      [{}, {}, {}],
      [{}, {}, {}],
      [{}, {}, {}]
    ]);
    const result = checkWin(table);
    expect(result.hasBingo).toBe(false);
    expect(result.hasErrors).toBe(false);
  });
});


describe('updateFavicon', () => {
  it('должна создавать фавіконку с правильным цветом', () => {
    updateFavicon('completed');
    const link = document.querySelector('link[rel="icon"]');
    expect(link).not.toBeNull();
    expect(link.href).toContain('data:image/png'); // Проверяем, что это data URL
  });
});

describe('createFavicon', () => {
  it('должна создавать фавіконку с заданным цветом', () => {
    createFavicon('red');
    const link = document.querySelector('link[rel="icon"]');
    expect(link).not.toBeNull();
    expect(link.href).toContain('data:image/png');
  });
});

describe("updateStarCells", () => {
  it("повинна автоматично виділяти клітинку з '*'", () => {
    const table = generateTable(7); // Створюємо таблицю 7x7
    const cell = table.querySelector("td");
    cell.textContent = "*"; // Змінюємо текст клітинки на '*'

    updateStarCells(table);

    expect(cell.classList.contains("selected")).toBe(true); // Клітинка виділена
  });
});

describe('highlightDuplicates', () => {
  it('должна добавлять класс error к дубликатам', () => {
    const table = document.querySelector('table');
    const cells = table.querySelectorAll('td');
    cells[0].textContent = 'duplicate';
    cells[1].textContent = 'duplicate';
    highlightDuplicates(table);
    expect(cells[0].classList.contains('error')).toBe(true);
    expect(cells[1].classList.contains('error')).toBe(true);
    cells[0].textContent = '0';
    cells[1].textContent = '1';
    cells[0].classList.remove('error');
    cells[0].classList.remove('selected');
    cells[1].classList.remove('error');

  });
});