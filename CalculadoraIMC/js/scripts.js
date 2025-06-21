// IMC da DATA
const data = [
    {
        min: 0,
        max: 18.4,
        classification: "Menor que 18,5",
        info: "Magreza",
        obesity: "0",
    },
    {
        min: 18.5,
        max: 24.9,
        classification: "Entre 18,5 e 24,9",
        info: "Normal",
        obesity: "0",
    },
    {
        min: 25,
        max: 29.9,
        classification: "Entre 25,0 e 29,9",
        info: "Sobrepeso",
        obesity: "I",
    },
    {
        min: 30,
        max: 39.9,
        classification: "Entre 30,0 e 39,9",
        info: "Obesidade",
        obesity: "II",
    },
    {
        min: 40,
        max: 99,
        classification: "Maior que 40,0",
        info: "Obesidade grave",
        obesity: "III",
    },
];

// Seleção dos elementos
const imcTable = document.querySelector("#imc-table");

const heightInput = document.querySelector("#height");
const weightInput = document.querySelector("#weight");
const dateInput = document.querySelector("#date");
const calcBtn = document.querySelector("#calc-btn");
const clearBtn = document.querySelector("#clear-btn");

const calcContainer = document.querySelector("#calc-container");
const resultContainer = document.querySelector("#result-container");

const imcNumber = document.querySelector("#imc-number span");
const imcInfo = document.querySelector("#imc-info span");

const backBtn = document.querySelector("#back-btn");

const historyTable = document.createElement("table");
historyTable.id = "history-table";
resultContainer.appendChild(historyTable);

let imcChart;

// As Funções
function createTable(data) {
    data.forEach((item) => {
        const div = document.createElement("div");
        div.classList.add("table-data");

        const classification = document.createElement("p");
        classification.innerText = item.classification;

        const info = document.createElement("p");
        info.innerText = item.info;

        const obesity = document.createElement("p");
        obesity.innerText = item.obesity;

        div.appendChild(classification);
        div.appendChild(info);
        div.appendChild(obesity);

        imcTable.appendChild(div);
    });
}

function validDigits(text) {
    return text.replace(/[^0-9,]/g, "");
}

function calcImc(height, weight) {
    const imc = (weight / (height * height)).toFixed(1);
    return imc;
}

function cleanInputs() {
    heightInput.value = "";
    weightInput.value = "";
    imcNumber.className = "";
    imcInfo.className = "";
}

function showOrHideResults() {
    calcContainer.classList.toggle("hide");
    resultContainer.classList.toggle("hide");
}

function getCurrentUser() {
    return document.getElementById("username").value.trim();
}

function getHistory() {
    const user = getCurrentUser();
    return JSON.parse(localStorage.getItem("imcHistory_" + user) || "[]");
}

function saveHistory(entry) {
    const user = getCurrentUser();
    const history = getHistory();
    history.push(entry);
    localStorage.setItem("imcHistory_" + user, JSON.stringify(history));
}

function renderHistory() {
    const history = getHistory();
    historyTable.innerHTML = `
    <tr>
      <th>Data</th>
      <th>Peso</th>
      <th>Altura</th>
      <th>IMC</th>
      <th>Classificação</th>
    </tr>
    ${history.map(item => `
      <tr>
        <td>${formatDate(item.date)}</td>
        <td>${item.weight}</td>
        <td>${item.height}</td>
        <td>${item.imc}</td>
        <td>${item.info}</td>
      </tr>
    `).join("")}
  `;

    renderChart();
}

// Função para renderizar o gráfico
function renderChart() {
    const history = getHistory();
    const ctx = document.getElementById("imcChart").getContext("2d");
    // Aqui formata as datas para brasileiro
    const labels = history.map(item => formatDate(item.date));
    const dataPoints = history.map(item => item.imc);

    if (imcChart) imcChart.destroy();

    const options = {
        plugins: {
            legend: {
                labels: {
                    color: '#000' // A cor que defini para a legenda
                }
            }
        },
        scales: {
            x: {
                ticks: { color: '#000' }, // Cor que defini para os textos do eixo X
                grid: { color: '#ccc' }
            },
            y: {
                ticks: { color: '#000' }, // Cor que defini para os textos do eixo Y
                grid: { color: '#ccc' }
            }
        }
    };

    imcChart = new Chart(ctx, {
        type: "line",
        data: {
            labels, // Essa parte formata as datas
            datasets: [{
                label: "IMC",
                data: dataPoints,
                borderColor: "#f44236",
                backgroundColor: "rgba(128,0,0)",
                fill: true,
                tension: 0.1
            }]
        },
        options: options
    });
}

// Função para formatar a data
function formatDate(isoDate) {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
}

const formatDateForCSV = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `'${day}/${month}/${year}`;
};

// O Init
createTable(data);
renderHistory();

// Os Eventos
[heightInput, weightInput].forEach((el) => {
    el.addEventListener("input", (e) => {
        const updatedValue = validDigits(e.target.value);

        e.target.value = updatedValue;
    });
});

calcBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const weight = +weightInput.value.replace(",", ".");
    const height = +heightInput.value.replace(",", ".");
    const date = dateInput.value;

    if (!weight || !height || !date) return;

    const imc = calcImc(height, weight);
    let info;

    data.forEach((item) => {
        if (imc >= item.min && imc <= item.max) {
            info = item.info;
        }
    });

    if (!info) return;

    imcNumber.innerText = imc;
    imcInfo.innerText = info;

    // Aqui salva no histórico
    saveHistory({ date, weight, height, imc, info });
    renderHistory();

    switch (info) {
        case "Magreza":
            imcNumber.classList.add("low");
            imcInfo.classList.add("low");
            break;
        case "Normal":
            imcNumber.classList.add("good");
            imcInfo.classList.add("good");
            break;
        case "Sobrepeso":
            imcNumber.classList.add("low");
            imcInfo.classList.add("low");
            break;
        case "Obesidade":
            imcNumber.classList.add("medium");
            imcInfo.classList.add("medium");
            break;
        case "Obesidade grave":
            imcNumber.classList.add("high");
            imcInfo.classList.add("high");
            break;
    }

    showOrHideResults();
});

clearBtn.addEventListener("click", (e) => {
    e.preventDefault();

    cleanInputs();
});

backBtn.addEventListener("click", (e) => {
    cleanInputs();
    showOrHideResults();
    renderHistory();
});

// Aqui exporta o histórico para CSV
document.getElementById("export-csv-btn").addEventListener("click", exportHistoryToCSV);

function exportHistoryToCSV() {
    const history = getHistory();
    if (!history.length) return alert("Nenhum histórico para exportar!");

    const separator = ";";
    const header = ["Data", "Peso", "Altura", "IMC", "Classificação"].join(separator) + "\n";
    const rows = history.map(item =>
        [
            formatDateForCSV(item.date),
            item.weight,
            item.height,
            item.imc,
            item.info
        ].join(separator)
    ).join("\n");

    const csvContent = "\uFEFF" + header + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "historico_imc.csv";
    link.click();
}

// Aqui exporta o histórico para PDF
document.getElementById("export-pdf-btn").addEventListener("click", exportHistoryToPDF);

function exportHistoryToPDF() {
    const history = JSON.parse(localStorage.getItem("imcHistory_" + document.getElementById("username").value.trim()) || "[]");
    if (!history.length) return alert("Nenhum histórico para exportar!");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Histórico de IMC", 10, 10);

    // Essa é a parte do Cabeçalho
    doc.setFontSize(12);
    doc.text("Data", 10, 20);
    doc.text("Peso", 40, 20);
    doc.text("Altura", 70, 20);
    doc.text("IMC", 100, 20);
    doc.text("Classificação", 130, 20);

    // Os Dados
    let y = 30;
    history.forEach(item => {
        const [year, month, day] = item.date.split("-");
        const dataFormatada = `${day}/${month}/${year}`;
        doc.text(dataFormatada, 10, y);
        doc.text(String(item.weight), 40, y);
        doc.text(String(item.height), 70, y);
        doc.text(String(item.imc), 100, y);
        doc.text(item.info, 130, y);
        y += 10;
        if (y > 280) { 
            doc.addPage();
            y = 20;
        }
    });

    doc.save("historico_imc.pdf");
}

function getAllHistories() {
    const histories = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("imcHistory_")) {
            const user = key.replace("imcHistory_", "");
            const userHistory = JSON.parse(localStorage.getItem(key));
            userHistory.forEach(entry => {
                histories.push({ ...entry, username: user });
            });
        }
    }
    return histories;
}

function renderAllHistories() {
    const histories = getAllHistories();
    historyTable.innerHTML = `
    <tr>
      <th>Usuário</th>
      <th>Data</th>
      <th>Peso</th>
      <th>Altura</th>
      <th>IMC</th>
      <th>Classificação</th>
    </tr>
    ${histories.map(item => `
      <tr>
        <td>${item.username}</td>
        <td>${formatDate(item.date)}</td>
        <td>${item.weight}</td>
        <td>${item.height}</td>
        <td>${item.imc}</td>
        <td>${item.info}</td>
      </tr>
    `).join("")}
  `;
}

let showingAll = false;
const toggleBtn = document.getElementById("toggle-history-btn");

toggleBtn.addEventListener("click", () => {
    if (showingAll) {
        renderHistory();
        toggleBtn.textContent = "Ver Histórico Geral";
    } else {
        renderAllHistories();
        toggleBtn.textContent = "Ver Meu Histórico";
    }
    showingAll = !showingAll;
});