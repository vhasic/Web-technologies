var iscrtajModul = (function () {
    var odrediVremena = function (satPocetak, satKraj) {
        let nizSatova = [];
        for (let i = 0; i <= 12; i = i + 2) {
            if (i >= satPocetak) nizSatova.push(i);
        }
        //ovdje nije <= jer se zadnji sat ne prikazuje
        for (let i = 15; i < satKraj; i = i + 2) {
            if (i >= satPocetak) nizSatova.push(i);
        }
        return nizSatova;
    }

    var iscrtajRaspored = function (div, dani, satPocetak, satKraj) {
        if (!Number.isInteger(satPocetak) || !Number.isInteger(satKraj)) {
            div.innerHTML = "Greška";
            return;
        }
        if (parseInt(satPocetak) >= parseInt(satKraj)) {
            div.innerHTML = "Greška";
            return;
        }
        if (satPocetak < 0 || satPocetak > 24 || satKraj < 0 || satKraj > 24) {
            div.innerHTML = "Greška";
            return;
        }

        let tabela = document.createElement("table");
        tabela.classList.add("rapored");

        //broj redova je broj dana+1 (sati na vrhu)
        let brojRedova = dani.length + 1;
        //*2 zbog pola sata, +1 zbog prve kolone za dane
        let brojKolona = (satKraj - satPocetak) * 2 + 1;

        let satiZaPrikaz = odrediVremena(satPocetak, satKraj);
        let sat = satPocetak;

        for (let i = 0; i < brojRedova; i++) {
            let tr = tabela.insertRow(i);
            for (let j = 0; j < brojKolona; j++) {
                if (i == 0) {
                    if (j % 2 == 0) {
                        let th = document.createElement("th");
                        if (satiZaPrikaz.includes(sat)) th.appendChild(document.createTextNode(sat < 10 ? "0" + sat + ":00" : sat + ":00"));
                        sat++;
                        th.classList.add("vrijeme");
                        if (j == 0) {
                            th.classList.add("prviBroj");
                        }
                        th.colSpan = 2;
                        tr.appendChild(th);
                    }
                } else if (j == 0) {
                    let th = document.createElement("th");
                    th.appendChild(document.createTextNode(dani[i - 1]));
                    th.classList.add("dan");
                    tr.appendChild(th);
                } else {
                    let td = tr.insertCell(j);
                    td.appendChild(document.createTextNode(""))
                    if (j % 2 == 0) td.classList.add("par");
                    else td.classList.add("nepar");
                }
            }
        }

        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = "raspored.css";
        document.head.appendChild(link);

        div.appendChild(tabela);
    }


    var daLiJeJedinaDecimalaPet = function (broj) {
        //ako broj ima više decimala ili ako je prva decimala različita od 5 tada je false
        return (broj * 100) % 10 == 0 || (broj * 10) % 10 == 5;
    }

//provjerava sve aktivnosti između dva vremena, ako ima poklapanja vraća true
    var imaPoklapanja = function (raspored, indexReda, indexKolone, span) {
        for (let i = 0; i < span; i++) {
            let celija = raspored.getElementsByTagName("tbody")[0].getElementsByTagName("tr")[indexReda].getElementsByTagName("td")[indexKolone + i];
            if (celija.innerHTML !== "") {
                return true;
            }
        }
        return false;
    }

    var dajIndexReda = function (raspored, dan) {
        let tabela = raspored.getElementsByTagName("tbody")[0];
        let brojRedova = tabela.rows.length;
        for (let i = 1; i < brojRedova; i++) {
            let test = tabela.getElementsByTagName("tr")[i].getElementsByTagName("th")[0].innerHTML;
            if (test == dan) return i;
        }
    }

    var dajPocetakRasporeda = function (raspored) {
        let tabela = raspored.getElementsByTagName("tbody")[0];
        let prviSat = tabela.rows[0].getElementsByTagName("th")[0].innerHTML;
        let prviSatNijePrikazan = false;
        if (prviSat == "") {
            prviSat = tabela.rows[0].getElementsByTagName("th")[1].innerHTML;
            prviSatNijePrikazan = true;
        }
        //dobavljanje sata iz vremena oblika hh:00
        let satPocetkaRasporeda = parseInt(prviSat, /\d\d:00/);
        //ako prvi sat nije prikazan znači da raspored počinje drugim satom, kojeg po postavci nije trebalo prikazati u tom opsegu, pa se ovim dobije stvarni početak rasporeda
        if (prviSatNijePrikazan) satPocetkaRasporeda--;
        return satPocetkaRasporeda;
    }

    var dajIndexKolone = function (raspored, vrijemePocetak, indexReda) {
        let tabela = raspored.getElementsByTagName("tbody")[0];
        let satPocetkaRasporeda = dajPocetakRasporeda(raspored);
        let indexKoloneBezSpana = (vrijemePocetak - satPocetkaRasporeda) * 2;
        let indexKoloneSaSpanom = 0;
        let brojac = 0;
        for (let i = 0; i < indexKoloneBezSpana; i++) {
            brojac += tabela.rows[indexReda].getElementsByTagName("td")[i].colSpan;
            indexKoloneSaSpanom++;
            if (brojac >= indexKoloneBezSpana) break;
        }
        return indexKoloneSaSpanom;
    }

    var dodajAktivnost = function (raspored, naziv, tip, vrijemePocetak, vrijemeKraj, dan) {
        //Pošto se alerti ne mogu testirati, rečeno je na c2 da se greška vrati iz funkcije umjesto da se prikaže alert
        if (raspored == null || raspored.innerHTML == "") {
            // alert("Greška - raspored nije kreiran");
            // return;
            return "Greška - raspored nije kreiran";
        }
        //provjera da li su vrijemePocetak i vrijemeKraj brojevi
        if (isNaN(vrijemePocetak) || isNaN(vrijemeKraj)) {
            // alert("Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin")
            // return;
            return "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin";
        }

        if (!daLiJeJedinaDecimalaPet(vrijemePocetak) || !daLiJeJedinaDecimalaPet(vrijemeKraj)) {
            // alert("Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin")
            // return;
            return "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin";
        }

        //množi se sa 10 zbog mogućnosti decimale
        if (vrijemePocetak * 10 < 0 || vrijemePocetak * 10 > 240 || vrijemeKraj * 10 < 0 || vrijemeKraj * 10 > 240) {
            // alert("Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin")
            // return;
            return "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin";
        }

        if (vrijemePocetak >= vrijemeKraj) {
            // alert("Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin")
            // return;
            return "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin";
        }
        let span = (vrijemeKraj - vrijemePocetak) * 2;
        let indexReda = dajIndexReda(raspored, dan);
        let indexKolone = dajIndexKolone(raspored, vrijemePocetak, indexReda);

        if (imaPoklapanja(raspored, indexReda, indexKolone, span)) {
            // alert("Greška - već postoji termin u rasporedu u zadanom vremenu");
            // return;
            return "Greška - već postoji termin u rasporedu u zadanom vremenu";
        }

        //brisanje viška ćelija
        let red = raspored.getElementsByTagName("tbody")[0].getElementsByTagName("tr")[indexReda];
        //-1 zbog toga što računa i trenutnu ćeliju
        for (let i = 0; i < span - 1; i++) {
            red.deleteCell(indexKolone + 1);
        }

        //dodavanje aktivnosti
        let celija = raspored.getElementsByTagName("tbody")[0].getElementsByTagName("tr")[indexReda].getElementsByTagName("td")[indexKolone];
        celija.innerHTML = naziv + "<br>" + tip;
        celija.colSpan = span;
        //dodavanje ispravne klase zbog bordera
        //briše sve dosad klase
        celija.className = "";
        let indexKoloneBezSpana = (vrijemePocetak - dajPocetakRasporeda(raspored)) * 2;
        //index kolone ne broji prvu kolonu koja u sebi ima dane
        if ((indexKoloneBezSpana + span - 1) % 2 == 0) celija.classList.add("nepar");
        else celija.classList.add("par");
        celija.classList.add("aktivnost");
    }
    return {
        iscrtajRaspored: iscrtajRaspored,
        dodajAktivnost: dodajAktivnost
    }
}());