const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkSwTUK6z1ASpdgoSDdKk45qWVN3VsW4v7OSgjmTt432KTwUKNi0wMqbxsr-RXBkq8I8jlI4VFiCcF/pub?gid=0&single=true&output=csv";

let latestScore = {
    matchNum: 1,
    roundNum: 1,
    teamANum: 1,
    teamAPts: 0,
    teamBNum: 2,
    teamBPts: 0
};

function parseCSV(text){
    const lines = text.split(/\r?\n/).filter(l => l.trim().length>0);
    return lines.map(line => line.split(',').map(c => c.replace(/^"|"$/g,'').trim()));
}

async function updateScore(){
    try {
        const url = SHEET_CSV_URL + "&cb=" + new Date().getTime();
        const res = await fetch(url);
        if(!res.ok) throw new Error("Fetch failed: " + res.status);
        const text = await res.text();
        const rows = parseCSV(text);
        const getC = (rowIndex) => (rows[rowIndex] && rows[rowIndex][2] !== undefined) ? rows[rowIndex][2] : "";
        latestScore = {
            matchNum: getC(1),
            roundNum: getC(2),
            teamANum: getC(3),
            teamAPts: getC(4),
            teamBNum: getC(5),
            teamBPts: getC(6)
        };
        console.log("Score updated:", latestScore);
    } catch(err){
        console.error("Error fetching/parsing CSV:", err);
    }
}

setInterval(updateScore, 2000);
updateScore();

app.get('/current-score', (req,res)=>{
    res.json(latestScore);
});

app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});