// logic.js

// Функция для проверки выигрышной комбинации
export function checkWin(table) {
  const rows = table.querySelectorAll('tr');
  const num = rows.length;
  let hasBingo = false;
  let hasErrors = false;

  // Перевіряємо, чи є помилки (наприклад, дублікати)
  const errorCells = table.querySelectorAll('.error');
  if (errorCells.length > 0) {
    hasErrors = true;
  }

  function checkLine(cells) {
    return Array.from(cells).every(cell => cell.classList.contains('selected'));
  }

  for (let i = 0; i < num; i++) {
    const rowCells = rows[i].querySelectorAll('td');
    const colCells = Array.from(rows).map(row => row.querySelectorAll('td')[i]);

    if (checkLine(rowCells) || checkLine(colCells)) {
      hasBingo = true;
      break;
    }
  }

  const diag1 = Array.from(rows).map((row, i) => row.querySelectorAll('td')[i]);
  const diag2 = Array.from(rows).map((row, i) => row.querySelectorAll('td')[num - 1 - i]);

  if (checkLine(diag1) || checkLine(diag2)) {
    hasBingo = true;
  }

  return { hasBingo, hasErrors };
}
  
  // Функция для обновления фавіконки
  export function updateFavicon(state) {
    let color;
    switch (state) {
      case "inProgress":
        color = "yellow"; // Жовтий - бінго в процесі
        break;
      case "completed":
        color = "green"; // Зелений - бінго завершено
        break;
      case "error":
        color = "red"; // Червоний - бінго має помилки
        break;
      default:
        color = "yellow"; // За замовчуванням - жовтий
    }
    createFavicon(color);
  }
  
  // Функция для создания фавіконки
  export function createFavicon(color) {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
  
    // Рисуем квадрат заданного цвета
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 32, 32);
  
    // Создаем ссылку на фавиконку
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = canvas.toDataURL("image/png");
  
    // Удаляем старую фавиконку, если она есть
    const oldLink = document.querySelector("link[rel='icon']");
    if (oldLink) {
      document.head.removeChild(oldLink);
    }
  
    document.head.appendChild(link);
  }
  
  // Функция для обновления состояния ячеек с "*"
  export function updateStarCells(table) {
    const cells = table.querySelectorAll("td");
    cells.forEach(cell => {
      if (cell.textContent.trim() === "*") {
        cell.classList.add("selected"); // Робимо клітинку обраною
      }
    });
  }
  
  // Функция для выделения дубликатов
  export function highlightDuplicates(table) {
    const cells = table.querySelectorAll("td");
    const valueMap = new Map();   
  
    cells.forEach(cell => {
      if (cell.textContent.length <= 50) {
        cell.classList.remove("error");
        updateFavicon("error")
      }
  
      const value = cell.textContent;
      if (valueMap.has(value)) {
        valueMap.get(value).push(cell);
      } else {
        valueMap.set(value, [cell]);
      }
    });
  
    valueMap.forEach(cellsArray => {
      if (cellsArray.length > 1) {
        cellsArray.forEach(cell => cell.classList.add("error"));
        updateFavicon("error")
      }
    });
  }