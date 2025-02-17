function checkWin(table) {
  const rows = table.querySelectorAll("tr");
  const num = rows.length;
  const bingoMessage = document.getElementById("bingo-message");
  let hasBingo = false;

  for (let i = 0; i < num; i++) {
    let win = true;
    const cells = rows[i].querySelectorAll("td");
    for (let j = 0; j < num; j++) {
      if (!cells[j].classList.contains("selected")) {
        win = false;
        break;
      }
    }
    if (win) {
      hasBingo = true;
    }
  }

  for (let i = 0; i < num; i++) {
    let win = true;
    for (let j = 0; j < num; j++) {
      const cell = rows[j].querySelectorAll("td")[i];
      if (!cell.classList.contains("selected")) {     
        win = false;
        break;
      }
    }
    if (win) {
      hasBingo = true;
    }
  }

  let diag1Win = true;
  let diag2Win = true;

  for (let i = 0; i < num; i++) {
    if (!rows[i].querySelectorAll("td")[i].classList.contains("selected")) {
      diag1Win = false;
    }
    if (!rows[i].querySelectorAll("td")[num - 1 - i].classList.contains("selected")) {
      diag2Win = false;
    }
  }

  if (diag1Win || diag2Win) {
    hasBingo = true;
  }

  if (hasBingo) {
    bingoMessage.style.display = "block";
  }
}

function highlightDuplicates(table) {
  const cells = table.querySelectorAll("td");
  const valueMap = new Map();

  cells.forEach(cell => {
    cell.style.backgroundColor = "";
    const value = cell.textContent;
    if (valueMap.has(value)) {
      valueMap.get(value).push(cell);
    } else {
      valueMap.set(value, [cell]);
    }
  });

  valueMap.forEach(cellsArray => {
    if (cellsArray.length > 1) {
      cellsArray.forEach(cell => cell.style.backgroundColor = "red");
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
    if (editMode) {
      table.querySelectorAll("td").forEach(td => td.classList.remove("selected"));
    }
  });
  
  function saveTableState() {
    const data = [];
    table.querySelectorAll("tr").forEach(row => {
      const rowData = [];
      row.querySelectorAll("td").forEach(cell => {
        rowData.push({ text: cell.textContent, selected: cell.classList.contains("selected") });
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
        if (savedData[i][j].selected) {
          cell.classList.add("selected");
        }
      });
    });
  }
  
  for (let i = 0; i < num; i++) {
    const tr = document.createElement("tr");
    for (let j = 0; j < num; j++) {
      const td = document.createElement("td");
      td.textContent = i * num + j;
      tr.appendChild(td);

      td.addEventListener("click", () => {
        if (editMode) {
          isEditing = true;
          const textarea = document.createElement("textarea");
          textarea.value = td.textContent;
          td.textContent = "";
          td.appendChild(textarea);
          textarea.focus();
          
          textarea.addEventListener("blur", () => {
            td.textContent = textarea.value;
            highlightDuplicates(table);
            isEditing = false;
            saveTableState();
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
  
  window.addEventListener("beforeunload", (event) => {
    if (isEditing) {
      event.preventDefault();
      event.stopPropagation();
      return (event.returnValue = "У вас есть несохраненные изменения. Вы уверены, что хотите покинуть страницу?");
    }
  });

  const bingoMessage = document.createElement("div");
  bingoMessage.id = "bingo-message";
  bingoMessage.textContent = "BINGO!";
  bingoMessage.style.display = "none";
  bingoMessage.style.fontSize = "24px";
  bingoMessage.style.fontWeight = "bold";
  bingoMessage.style.color = "green";
  document.body.appendChild(bingoMessage);

  const resetButton = document.createElement("button");
  resetButton.textContent = "Начать заново";
  resetButton.addEventListener("click", () => {
    table.querySelectorAll("td").forEach(td => td.classList.remove("selected"));
    bingoMessage.style.display = "none";
    saveTableState();
  });
  document.body.appendChild(resetButton);

  document.body.appendChild(editButton);
  document.body.appendChild(table);

  return table;
}
