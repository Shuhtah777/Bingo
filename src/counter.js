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

window.addEventListener("load", () => {
  const cells = document.querySelectorAll("td");
  cells.forEach(cell => autoScaleText(cell));
});

window.addEventListener("resize", () => {
  const cells = document.querySelectorAll("td");
  cells.forEach(cell => autoScaleText(cell));
});

function checkWin(table) {
  const rows = table.querySelectorAll("tr");
  const num = rows.length;
  const bingoMessage = document.getElementById("bingo-message");
  let hasBingo = false;

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

  if (hasBingo && bingoMessage) {
    bingoMessage.style.display = "block";
  }
}

function highlightDuplicates(table) {
  const cells = table.querySelectorAll("td");
  const valueMap = new Map();

  cells.forEach(cell => {
    if (cell.textContent.length <= 50) {
      cell.classList.remove("error");
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
    }
  });
}

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
  });

  const shareButton = document.createElement("button");
  shareButton.textContent = "Поділитися";
  shareButton.id = "shareButton";
  shareButton.style.display = "none";
  document.body.appendChild(shareButton);

  shareButton.addEventListener("click", () => {
    const data = [];
    table.querySelectorAll("tr").forEach(row => {
      const rowData = [];
      row.querySelectorAll("td").forEach(cell => {
        rowData.push({
          text: cell.textContent,
          selected: cell.classList.contains("selected"),
          error: cell.classList.contains("error"),
          fontSize: cell.style.fontSize
        });
      });
      data.push(rowData);
    });

    // Кодируем данные для URL
    const encodedData = encodeURIComponent(JSON.stringify(data));
    const url = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;

    // Копируем URL в буфер обмена
    navigator.clipboard.writeText(url).then(() => {
      alert("Посилання на гру скопійовано в буфер обміну!");
    }).catch(err => {
      console.error("Помилка копіювання: ", err);
    });
  });

  function saveTableState() {
    const data = [];
    table.querySelectorAll("tr").forEach(row => {
      const rowData = [];
      row.querySelectorAll("td").forEach(cell => {
        rowData.push({
          text: cell.textContent,
          selected: cell.classList.contains("selected"),
          error: cell.classList.contains("error"),
          fontSize: cell.style.fontSize
        });
      });
      data.push(rowData);
    });
    localStorage.setItem("bingoTable", JSON.stringify(data));
  }

  function loadTableState() {
    const savedData = JSON.parse(localStorage.getItem("bingoTable"));
    if (!savedData) return;

    table.querySelectorAll("tr").forEach((row, i) => {
      row.querySelectorAll("td").forEach((cell, j) => {
        cell.textContent = savedData[i][j].text;
        cell.style.fontSize = savedData[i][j].fontSize || "20px";
        if (savedData[i][j].selected) {
          cell.classList.add("selected");
        }
        if (savedData[i][j].error) {
          cell.classList.add("error");
        }
        autoScaleText(cell);
      });
    });
    highlightDuplicates(table);
  }

  function loadTableStateFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');

    if (encodedData) {
      try {
        const data = JSON.parse(decodeURIComponent(encodedData));

        table.querySelectorAll("tr").forEach((row, i) => {
          row.querySelectorAll("td").forEach((cell, j) => {
            cell.textContent = data[i][j].text;
            cell.style.fontSize = data[i][j].fontSize || "20px";
            if (data[i][j].selected) {
              cell.classList.add("selected");
            }
            if (data[i][j].error) {
              cell.classList.add("error");
            }
            autoScaleText(cell);
          });
        });
        highlightDuplicates(table);
      } catch (error) {
        console.error("Помилка завантаження стану з URL: ", error);
      }
    }
  }

  for (let i = 0; i < num; i++) {
    const tr = document.createElement("tr");
    for (let j = 0; j < num; j++) {
      const td = document.createElement("td");
      td.textContent = i * num + j;
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
            } else {
              textarea.classList.remove("error");
            }
            autoScaleText(td);
          });

          textarea.addEventListener("blur", () => {
            const value = textarea.value;
            td.textContent = value;

            autoScaleText(td);

            if (value.length > 50) {
              td.classList.add("error");
            } else {
              td.classList.remove("error");
            }

            highlightDuplicates(table);
            isEditing = false;
            saveTableState();
          });

          textarea.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              textarea.blur();
            }
          });
        } else {
          td.classList.toggle("selected");
          checkWin(table);
          saveTableState();
        }
      });
    }
    tbody.appendChild(tr);
  }

  loadTableState();
  loadTableStateFromURL();

  window.addEventListener("load", () => {
    const cells = table.querySelectorAll("td");
    cells.forEach(cell => autoScaleText(cell));
  });

  window.addEventListener("resize", () => {
    const cells = table.querySelectorAll("td");
    cells.forEach(cell => autoScaleText(cell));
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
    bingoMessage.style.display = "none";
    saveTableState();
  });

  document.body.appendChild(editButton);
  document.body.appendChild(table);

  return table;
}