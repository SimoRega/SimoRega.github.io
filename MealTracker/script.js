// INCOLLA QUI L'URL DELLA TUA WEB APP GOOGLE APPS SCRIPT
const SCRIPT_URL = '[https://script.google.com/macros/s/AKfycbymxPkPvMWVHIYqGKUxjxAbXeP3mC7DXs8NCVIL9JGnhM4ehhqxaWRmLSdgklSNQwp5zQ/exec](https://script.google.com/macros/s/AKfycbymxPkPvMWVHIYqGKUxjxAbXeP3mC7DXs8NCVIL9JGnhM4ehhqxaWRmLSdgklSNQwp5zQ/exec)';
let macroChart = null; // Variabile per il grafico

// Evento al click del pulsante
document.getElementById('submitBtn').addEventListener('click', async () => {
    const mealInput = document.getElementById('mealInput');
    const status = document.getElementById('statusMessage');
    const meal = mealInput.value.trim();

    if (!meal) return;

    // Stato di caricamento
    status.textContent = '🧠 L\'IA sta analizzando il pasto...';
    status.className = 'loading';
    mealInput.value = '';

    try {
        // Invio dati ad Apps Script
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            // Usiamo text/plain per evitare i blocchi di sicurezza CORS del browser
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ meal: meal })
        });

        const result = await response.json();
        
        if (result.success) {
            status.textContent = '✅ Pasto salvato con successo!';
            status.className = 'success';
            loadData(); // Ricarichiamo i dati per aggiornare il grafico
        } else {
            status.textContent = '❌ Errore: ' + result.error;
            status.className = 'error';
        }
    } catch (error) {
        status.textContent = '❌ Errore di connessione.';
        status.className = 'error';
    }
});

// Funzione per caricare i dati dal foglio
async function loadData() {
    try {
        const response = await fetch(SCRIPT_URL);
        const result = await response.json();
        
        if (result.success) {
            processChartData(result.data);
        }
    } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
    }
}

// Funzione per filtrare i dati di oggi e aggiornare la UI
function processChartData(data) {
    // Otteniamo la data di oggi in formato DD/MM/YYYY (lo stesso usato da Apps Script)
    const today = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    let totalCals = 0, carbs = 0, protein = 0, fat = 0;

    data.forEach(row => {
        // La data nel foglio è "DD/MM/YYYY HH:mm", prendiamo solo la parte prima dello spazio
        const rowDate = String(row[0]).split(' ')[0]; 
        
        if (rowDate === today) {
            totalCals += Number(row[2]) || 0; // Calorie
            carbs += Number(row[3]) || 0;     // Carboidrati
            protein += Number(row[4]) || 0;   // Proteine
            fat += Number(row[5]) || 0;       // Grassi
        }
    });

    // Aggiorniamo le calorie totali a schermo
    document.getElementById('totalCalories').textContent = totalCals;
    
    // Disegniamo/Aggiorniamo il grafico
    updateChart(carbs, protein, fat);
}

// Funzione per disegnare il grafico con Chart.js
function updateChart(carbs, protein, fat) {
    const ctx = document.getElementById('macroChart').getContext('2d');
    
    // Se c'è già un grafico, lo distruggiamo prima di ricrearlo
    if (macroChart) {
        macroChart.destroy();
    }

    macroChart = new Chart(ctx, {
        type: 'doughnut', // Grafico a ciambella
        data: {
            labels: ['Carboidrati (g)', 'Proteine (g)', 'Grassi (g)'],
            datasets: [{
                data: [carbs, protein, fat],
                backgroundColor: ['#3498db', '#e74c3c', '#f1c40f'], // Blu, Rosso, Giallo
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Carica i dati appena apri la pagina
loadData();
