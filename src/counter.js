// counter.js

import {  updateFavicon, createFavicon, updateStarCells, highlightDuplicates } from './logic.js';

// Функция для автоматического масштабирования текста
function autoScaleText(cell) {
  const maxWidth = cell.clientWidth - 4;
  const maxHeight = cell.clientHeight - 4;
  let fontSize = 30;
  const minFontSize = 10;

  const tempDiv = document.createElement("div");
  tempDiv.style.visibility = "hidden";
  tempDiv.style.position = "absolute";
  tempDiv.style.whiteSpace = "normal";
  tempDiv.style.overflowWrap = "break-word";
  tempDiv.style.width = `${maxWidth}px`;
  tempDiv.style.fontSize = `${fontSize}px`;
  tempDiv.textContent = cell.textContent;
  document.body.appendChild(tempDiv);

  while ((tempDiv.offsetHeight > maxHeight || tempDiv.offsetWidth > maxWidth) && fontSize > minFontSize) {
    fontSize -= 1;
    tempDiv.style.fontSize = `${fontSize}px`;
  }

  cell.style.fontSize = `${fontSize}px`;
  document.body.removeChild(tempDiv);
}

export function checkWin(table) {
  const rows = table.querySelectorAll("tr");
  const num = rows.length;
  let hasBingo = false;
  let hasErrors = false;

  const errorCells = table.querySelectorAll(".error");
  if (errorCells.length > 0) {
    hasErrors = true;
  }

  function checkLine(cells) {
    return Array.from(cells).every(cell => cell.classList.contains("selected"));
  }

  for (let i = 0; i < num; i++) {
    const rowCells = rows[i].querySelectorAll("td");
    const colCells = Array.from(rows).map(row => row.querySelectorAll("td")[i]);

    if (checkLine(rowCells) || checkLine(colCells)) {
      hasBingo = true;
      break;
    }
  }

  const diag1 = Array.from(rows).map((row, i) => row.querySelectorAll("td")[i]);
  const diag2 = Array.from(rows).map((row, i) => row.querySelectorAll("td")[num - 1 - i]);

  if (checkLine(diag1) || checkLine(diag2)) {
    hasBingo = true;
  }

  return { hasBingo, hasErrors };
}


// Початкова фавіконка (жовта)
createFavicon("yellow");

export function generateTable(num) {
  const table = document.createElement("table");
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  const editButton = document.createElement("button");
  editButton.textContent = "Режим выбора";
  let editMode = false;
  let isEditing = false;

  editButton.addEventListener("click", () => {
    editMode = !editMode;
    editButton.textContent = editMode ? "Режим редактирования" : "Режим выбора";
    const bingoMessage = document.getElementById("bingo-message");
    if (editMode) {
      shareButton.style.display = "block";
    } else {
      shareButton.style.display = "none";
    }
    if (editMode) {
      table.querySelectorAll("td").forEach(td => td.classList.remove("selected"));
      if (bingoMessage) bingoMessage.style.display = "none";
    }
  
    updateStarCells(table); // Оновлюємо стан клітинок з "*" після зміни режиму
  });

  const shareButton = document.createElement("button");
  shareButton.textContent = "Поділитися";
  shareButton.id = "shareButton";
  shareButton.style.display = "none";
  document.body.appendChild(shareButton);

  shareButton.addEventListener("click", () => {
    const selectedCells = [];
    const cellTexts = [];
  
    table.querySelectorAll("td").forEach((cell, index) => {
      if (cell.classList.contains("selected")) {
        selectedCells.push(index);
      }
      cellTexts.push(cell.textContent);
    });
  
    // Кодируем данные в Base64
    const state = { selected: selectedCells, texts: cellTexts };
    const encodedState = btoa(JSON.stringify(state));
  
    // Обновляем hash в URL
    window.location.hash = encodedState;
  
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert("Посилання на гру скопійовано в буфер обміну!");
    }).catch(err => {
      console.error("Помилка копіювання: ", err);
    });
  });
  
  function loadTableStateFromURL(table) {
    if (!table) {
      console.error("Table is undefined. Cannot load state.");
      return;
    }
  
    const encodedData = window.location.hash.substring(1); // Убираем #
  
    if (encodedData) {
      try {
        console.log("Encoded data from URL:", encodedData);
  
        // Декодируем данные
        const state = JSON.parse(atob(encodedData));
        console.log("Parsed state:", state);
  
        // Восстанавливаем состояние
        table.querySelectorAll("td").forEach((cell, index) => {
          const cellData = state.texts[index];
          if (cellData !== undefined) {
            cell.textContent = cellData;
            if (state.selected.includes(index)) {
              cell.classList.add("selected");
            }
          }
        });
  
        console.log("Table state successfully restored from URL.");
      } catch (error) {
        console.error("Ошибка загрузки состояния из URL: ", error);
        alert("Помилка: Невірний формат даних у посиланні.");
      }
    } else {
      console.log("No data in URL. Creating a new table.");
    }
  }

  let counter = 0;
  for (let i = 0; i < num; i++) {
    const tr = document.createElement("tr");
    for (let j = 0; j < num; j++) {
      const td = document.createElement("td");
      td.textContent = counter++;
      tr.appendChild(td);
      autoScaleText(td);

      td.addEventListener("click", () => {
        if (editMode) {
          isEditing = true;
          const textarea = document.createElement("textarea");
          textarea.value = td.textContent;
          td.textContent = "";
          td.appendChild(textarea);
          textarea.focus();
     
          textarea.addEventListener("input", () => {
            if (textarea.value.length > 50) {
              textarea.classList.add("error");
              updateFavicon('error');
            } else {
              textarea.classList.remove("error");
              updateFavicon('inProgress');
            }
            autoScaleText(td);
          });
      
          textarea.addEventListener("blur", () => {
            const value = textarea.value;
            td.textContent = value;
      
            autoScaleText(td);
      
            if (value.length > 50) {
              td.classList.add("error");
              updateFavicon('error');
            } else {
              td.classList.remove("error");
              updateFavicon('inProgress');
            }
      
            // Перевіряємо, чи вміст клітинки дорівнює "*"
            if (td.textContent.trim() === "*") {
              td.classList.add("selected");
            }
            
            highlightDuplicates(table);
            isEditing = false;
          });
      
          textarea.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              textarea.blur();
            }
          });
        } else {
          // Обробляємо клітинку з "*" у режимі вибору
          if (td.textContent.trim() === "*") {
            td.classList.add("selected"); // Якщо вміст "*", клітинка завжди обрана
          } else {
            td.classList.toggle("selected"); // Інакше перемикаємо стан
          }
          const { hasBingo, hasErrors } = checkWin(table); // Перевіряємо перемогу
          if (hasBingo) {
            const bingoMessage = document.getElementById("bingo-message");
            if (bingoMessage) {
              bingoMessage.style.display = "block";
              updateFavicon("completed"); // Зелений - бінго завершено
            }
          } else if (hasErrors) {
            updateFavicon("error"); // Червоний - бінго має помилки
          } else {
            updateFavicon("inProgress"); // Жовтий - бінго в процесі
          }
        }
      });
    }
    tbody.appendChild(tr);
  }

  loadTableStateFromURL(table);

  window.addEventListener("load", () => {
    const cells = table.querySelectorAll("td");
    cells.forEach(cell => autoScaleText(cell));
    updateStarCells(table); // Оновлюємо стан клітинок з "*"
  });

  window.addEventListener("resize", () => {
    const cells = table.querySelectorAll("td");
    cells.forEach(cell => autoScaleText(cell));
    updateStarCells(table); // Оновлюємо стан клітинок з "*"
  });

  window.addEventListener("beforeunload", (event) => {
    if (isEditing) {
      event.preventDefault();
      event.stopPropagation();
      return (event.returnValue = "У вас есть несохраненные изменения. Вы уверены, что хотите покинуть страницу?");
    }
  });

  let bingoMessage = document.getElementById("bingo-message");
  if (!bingoMessage) {
    bingoMessage = document.createElement("div");
    bingoMessage.id = "bingo-message";
    bingoMessage.textContent = "BINGO!";
    bingoMessage.style.display = "none";
    bingoMessage.style.fontSize = "24px";
    bingoMessage.style.fontWeight = "bold";
    bingoMessage.style.color = "green";
    document.body.appendChild(bingoMessage);
  } else {
    bingoMessage.style.display = "none";
  }

  let resetButton = document.getElementById("reset-button");
  if (!resetButton) {
    resetButton = document.createElement("button");
    resetButton.id = "reset-button";
    resetButton.textContent = "Начать заново";
    document.body.appendChild(resetButton);
  }

  resetButton.addEventListener("click", () => {
    table.querySelectorAll("td").forEach(td => {
      td.classList.remove("selected");
      autoScaleText(td);
    });
    updateStarCells(table); // Оновлюємо стан клітинок з "*"
    const bingoMessage = document.getElementById("bingo-message");
    if (bingoMessage) bingoMessage.style.display = "none";
    updateFavicon("inProgress");
  });

  document.body.appendChild(editButton);
  document.body.appendChild(table);

  return table;
}