let ajax = new XMLHttpRequest();
let textArea, grupeSelect, buttonSubmit;
let grupe;


window.onload = function () {
    textArea = document.getElementById("textarea");
    grupeSelect = document.getElementById("grupe");
    buttonSubmit = document.getElementById("dodajStudente");

    dodajGrupeNaFormu();

    buttonSubmit.addEventListener('click', function () {
        let grupa=grupeSelect.value;
        let studentiZaDodavanje=textArea.value;
        dodajStudente(studentiZaDodavanje,grupa);
    });
}

function dodajGrupeNaFormu() {
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            grupe = JSON.parse(ajax.responseText);
            for (let i=0;i<grupe.length;i++) {
                let option = document.createElement("option");
                option.text = grupe[i].naziv;
                grupeSelect.add(option);
            }
        }
    }
    ajax.open("GET", "http://localhost:3000/v2/grupa", true);
    ajax.send();
}
function csvJSON(csv){
    let lines=csv.split("\n");
    let result = [];
    let headers=["ime","index"];
    let duzina=lines.length;
    for(let i=0;i<duzina;i++){
        let obj = {};
        let currentline=lines[i].split(",");
        for(let j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }
        result.push(obj);
    }
    return result;
}

function dodajStudente(studentiZaDodavanje, grupa) {
    let jsonNiz=csvJSON(studentiZaDodavanje);
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
          let result=JSON.parse(ajax.responseText);
          let ispis="";
          for (let i=0;i<result.length;i++){
              ispis+=result[i].message+"\n";
          }
          textArea.value=ispis;
        }
    }
    ajax.open("POST", "http://localhost:3000/v2/studenti", true);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.send(JSON.stringify({studenti:jsonNiz, grupa:grupa}));
}