let ajax = new XMLHttpRequest();
let predmet, nazivAktivnosti, tip, vrijemePocetak, vrijemeKraj, dan, poruka, buttonSubmit, grupeSelect;
let predmeti, aktivnosti, dani, tipovi, grupe ;


//Pošto se sada treba raditi sa bazom, iz baze se dobavljaju predmeti, dani, tipovi i grupe, koji se prikazuju na formi


window.onload = function () {
    predmet = document.getElementById("predmet");
    nazivAktivnosti = document.getElementById("nazivAktivnosti");
    tip = document.getElementById("tip");
    vrijemePocetak = document.getElementById("vrijemePocetka");
    vrijemeKraj = document.getElementById("vrijemeKraja");
    dan = document.getElementById("dan");
    poruka = document.getElementById("prikazPoruke");
    buttonSubmit = document.getElementById("dodajAktivnost");
    grupeSelect = document.getElementById("grupe");

    getPredmete();

    buttonSubmit.addEventListener('click', function () {
        let indexTipa=tip.selectedIndex;
        let indexDana=dan.selectedIndex;
        let indexPredmeta=predmet.selectedIndex;
        let indexGrupe=grupeSelect.selectedIndex;
        postAktivnost(nazivAktivnosti.value ,predmeti[indexPredmeta] , tipovi[indexTipa], vrijemePocetak.value, vrijemeKraj.value, dani[indexDana], grupe[indexGrupe]);
    });
}

function getPredmete() {
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            predmeti = JSON.parse(ajax.responseText);
            for (let i=0;i<predmeti.length;i++) {
                let option = document.createElement("option");
                option.text = predmeti[i].naziv;
                predmet.add(option);
            }
            getAktivnosti();
        }
    }
    ajax.open("GET", "http://localhost:3000/v2/predmet", true);
    ajax.send();
}

function getAktivnosti() {
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            aktivnosti = JSON.parse(ajax.responseText);
            dodajGrupeNaFormu();
        }
    }
    ajax.open("GET", "http://localhost:3000/v2/aktivnost", true);
    ajax.send();
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
            dodajTipoveNaFormu();
        }
    }
    ajax.open("GET", "http://localhost:3000/v2/grupa", true);
    ajax.send();
}

function dodajTipoveNaFormu() {
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            tipovi = JSON.parse(ajax.responseText);
            for (let i=0;i<tipovi.length;i++) {
                let option = document.createElement("option");
                option.text = tipovi[i].naziv;
                tip.add(option);
            }
            dodajDaneNaFormu();
        }
    }
    ajax.open("GET", "http://localhost:3000/v2/tip", true);
    ajax.send();
}
function dodajDaneNaFormu() {
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            dani = JSON.parse(ajax.responseText);
            for (let i=0;i<dani.length;i++) {
                let option = document.createElement("option");
                option.text = dani[i].naziv;
                dan.add(option);
            }
        }
    }
    ajax.open("GET", "http://localhost:3000/v2/dan", true);
    ajax.send();
}

function pretvoriVrijemeUDecimalniFormat(vrijeme) {
    let hh=vrijeme.substring(0,2);
    let mm=vrijeme.substring(3,5);
    let sati = parseInt(hh);
    let minute = parseInt(mm);
    sati=sati+minute/60;
    return sati;
}
function postAktivnost(nazivAktivnosti ,predmet , tip, vrijemePocetak, vrijemeKraj, dan, grupa) {
        vrijemePocetak=pretvoriVrijemeUDecimalniFormat(vrijemePocetak);
        vrijemeKraj=pretvoriVrijemeUDecimalniFormat(vrijemeKraj);
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                let jsonRez = JSON.parse(ajax.responseText);

                if (jsonRez.message !== "Aktivnost nije validna!") {
                    aktivnosti.push({id:aktivnosti[aktivnosti.length-1].id+1,naziv: nazivAktivnosti, pocetak: vrijemePocetak, kraj: vrijemeKraj, grupa:grupa.id, dan: dan.id, tip:tip.id, predmet:predmet.id});
                }
                alert(jsonRez.message);
            }

        }
        ajax.open("POST", "http://localhost:3000/v2/aktivnost", true);
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.send(JSON.stringify({naziv: nazivAktivnosti, pocetak: vrijemePocetak, kraj: vrijemeKraj, grupa:grupa.id, dan: dan.id, tip:tip.id, predmet:predmet.id}));
}

