const storageKey = "pestel-canvas-notes";
const grid = document.querySelector("#pestel-grid");
const factorCount = document.querySelector("#factor-count");
const saveStatus = document.querySelector("#save-status");
const clearButton = document.querySelector("#clear-button");
const reportButton = document.querySelector("#report-button");

function getNotes() {
    try {
        return JSON.parse(localStorage.getItem(storageKey)) || {};
    } catch {
        return {};
    }
}

function saveNotes() {
    const notes = {};
    document.querySelectorAll(".factor-column").forEach((column) => {
        notes[column.dataset.factor] = [...column.querySelectorAll("textarea")].map((textarea) => textarea.value);
    });
    localStorage.setItem(storageKey, JSON.stringify(notes));
    saveStatus.textContent = "Salvo agora";
    updateCount();
}

function createNote(column, value = "") {
    const note = document.createElement("div");
    note.className = "note";
    note.innerHTML = `
    <textarea rows="3" placeholder="Descreva um fator relevante..." aria-label="Fator ${column.dataset.factor}"></textarea>
    <button class="delete-note" type="button" title="Remover fator" aria-label="Remover fator">&times;</button>
  `;
    const textarea = note.querySelector("textarea");
    textarea.value = value;
    textarea.addEventListener("input", saveNotes);
    note.querySelector(".delete-note").addEventListener("click", () => {
        note.remove();
        saveNotes();
    });
    column.querySelector(".notes-list").append(note);
    textarea.focus();
    updateCount();
}

function updateCount() {
    const total = document.querySelectorAll(".note").length;
    factorCount.textContent = `${total} ${total === 1 ? "fator registrado" : "fatores registrados"}`;
}

function restoreNotes() {
    const notes = getNotes();
    document.querySelectorAll(".factor-column").forEach((column) => {
        (notes[column.dataset.factor] || []).forEach((value) => createNote(column, value));
    });
    updateCount();
    if (document.querySelector(".note")) saveStatus.textContent = "Notas restauradas";
}

grid.addEventListener("click", (event) => {
    const button = event.target.closest(".add-note");
    if (button) createNote(button.closest(".factor-column"));
});

clearButton.addEventListener("click", () => {
    if (!document.querySelector(".note")) return;
    if (window.confirm("Remover todos os fatores do canvas?")) {
        document.querySelectorAll(".notes-list").forEach((list) => { list.innerHTML = ""; });
        saveNotes();
        saveStatus.textContent = "Canvas limpo";
    }
});

reportButton.addEventListener("click", () => {
    saveNotes();
    document.body.classList.add("print-mode");
    saveStatus.textContent = "Preparando relatório";
    window.setTimeout(() => {
        window.print();
        document.body.classList.remove("print-mode");
        saveStatus.textContent = "Relatório pronto para baixar";
    }, 80);
});

restoreNotes();
