let assert = chai.assert;

describe('iscrtajModul', function () {

    describe('iscrtajRaspored()', function () {
        let div=document.getElementById("ispis");

        it('treba imati 6 redova za 5 dana (+1 red satnica)', function () {
            let dani=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
            iscrtajModul.iscrtajRaspored(div, dani, 8, 21);
            let tabela=div.getElementsByTagName("tbody")[0];
            assert.equal(tabela.rows.length, 6, "Broj redova treba biti 6");
        });
        it('treba imati 26 kolona', function () {
            //brisanje prethodne tabele
            div.innerHTML="";

            let dani=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
            iscrtajModul.iscrtajRaspored(div, dani, 8, 21);
            let tabela=div.getElementsByTagName("tbody")[0];
            let brojKolona=tabela.rows[1].getElementsByTagName("td").length;
            assert.equal(brojKolona, 26, "Broj kolona treba biti 26");
        });
        it('prvi sat treba biti paran za sat<15', function () {
            //brisanje prethodne tabele
            div.innerHTML="";

            let dani=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
            iscrtajModul.iscrtajRaspored(div, dani, 4, 18);
            let tabela=div.getElementsByTagName("tbody")[0];
            let prviBroj=tabela.rows[0].getElementsByTagName("th")[0].innerHTML;
            assert.equal(parseInt(prviBroj, /\d\d:00/), 4, "Prvo prikazano vrijeme treba biti 4");
        });

        it('zadnji sat se ne treba prikazivati', function () {
            //brisanje prethodne tabele
            div.innerHTML="";

            let dani=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
            iscrtajModul.iscrtajRaspored(div, dani, 4, 19);
            let tabela=div.getElementsByTagName("tbody")[0];
            let broj=tabela.rows[0].getElementsByTagName("th")[15].innerHTML;
            assert.equal(broj, "", "Zadnje vrijeme se ne prikazuje");
        });
        it('ako je početak rasporeda jednak kraju treba biti greška', function () {
            //brisanje prethodne tabele
            div.innerHTML="";

            let dani=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
            iscrtajModul.iscrtajRaspored(div, dani, 15, 15);
            assert.equal(div.innerHTML, "Greška", "Početak ne smije biti veći ili jednak kraju");
        });
        it('ako je početak rasporeda veći od kraja treba biti greška', function () {
            //brisanje prethodne tabele
            div.innerHTML="";

            let dani=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
            iscrtajModul.iscrtajRaspored(div, dani, 18, 15);
            assert.equal(div.innerHTML, "Greška", "Početak ne smije biti veći ili jednak kraju");
        });
        it('vremena moraju biti cijeli brojevi', function () {
            //brisanje prethodne tabele
            div.innerHTML="";

            let dani=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
            iscrtajModul.iscrtajRaspored(div, dani, 12.5, 15);
            assert.equal(div.innerHTML, "Greška", "Vremena moraju biti cijeli brojevi");
        });
        it('vremena moraju biti cijeli brojevi', function () {
            //brisanje prethodne tabele
            div.innerHTML="";

            let dani=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
            iscrtajModul.iscrtajRaspored(div, dani, 12, "16");
            assert.equal(div.innerHTML, "Greška", "Vremena moraju biti cijeli brojevi");
        });
        it('ako vrijeme nije u opsegu 0-24 treba biti greška', function () {
            //brisanje prethodne tabele
            div.innerHTML="";

            let dani=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
            iscrtajModul.iscrtajRaspored(div, dani, -1, 12);
            assert.equal(div.innerHTML, "Greška", "Vrijeme treba biti u opsegu 0-24h");
        });
        it('ako vrijeme nije u opsegu 0-24 treba biti greška', function () {
            //brisanje prethodne tabele
            div.innerHTML="";

            let dani=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
            iscrtajModul.iscrtajRaspored(div, dani, 14, 25);
            assert.equal(div.innerHTML, "Greška", "Vrijeme treba biti u opsegu 0-24h");
        });
        it('0 treba proći', function () {
            //brisanje prethodne tabele
            div.innerHTML="";

            let dani=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
            iscrtajModul.iscrtajRaspored(div, dani, 0, 12);
            assert.notEqual(div.innerHTML, "Greška", "0 spada u dozvoljen opseg");
        });
        it('24 treba proći', function () {
            //brisanje prethodne tabele
            div.innerHTML="";

            let dani=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
            iscrtajModul.iscrtajRaspored(div, dani, 6, 24);
            assert.notEqual(div.innerHTML, "Greška", "24 spada u dozvoljen opseg");
        });
    });

    describe('dodajAktivnost()', function () {
        let div=document.getElementById("ispis");

        it('Test ako je proslijeđeno null umjesto rasporeda', function () {
            //brisanje prethodne tabele
            div.innerHTML="";
            let dani=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
            iscrtajModul.iscrtajRaspored(div, dani, 8, 21);

            let rezultat=iscrtajModul.dodajAktivnost(null,"WT","predavanje",9,12,"Ponedjeljak");
            assert.equal(rezultat, "Greška - raspored nije kreiran", "Treba se projaviti greška i ne treba se upisati u tabelu");
        });

        it('Test ako raspored nije kreiran', function () {
            //brisanje prethodne tabele
            div.innerHTML="";

            let rezultat=iscrtajModul.dodajAktivnost(div,"WT","predavanje",9,12,"Ponedjeljak");
            assert.equal(rezultat, "Greška - raspored nije kreiran", "Treba se projaviti greška");
        });

        it('Test ako vrijeme aktivnosti nije pola sata', function () {
            //brisanje prethodne tabele
            div.innerHTML="";
            let dani=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
            iscrtajModul.iscrtajRaspored(div, dani, 8, 21);


            let rezultat=iscrtajModul.dodajAktivnost(div,"WT","predavanje",9.7,12,"Ponedjeljak");
            assert.equal(rezultat, "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin", "Treba se projaviti greška i ne treba se upisati u tabelu");
        });

        it('Test vrijeme kraja je jednako vremenu početka', function () {
            //brisanje prethodne tabele
            div.innerHTML="";
            let dani=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
            iscrtajModul.iscrtajRaspored(div, dani, 8, 21);

            let rezultat=iscrtajModul.dodajAktivnost(div,"WT","predavanje",9,9,"Ponedjeljak");
            assert.equal(rezultat, "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin", "Treba se projaviti greška i ne treba se upisati u tabelu");
        });

//ispravni slučajevi
        it('Test dodavanja aktivnosti', function () {
            //brisanje prethodne tabele
            div.innerHTML="";

            let dani=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
            iscrtajModul.iscrtajRaspored(div, dani, 8, 21);
            iscrtajModul.dodajAktivnost(div,"PJP","predavanje",9,12,"Ponedjeljak");
            let tabela=div.getElementsByTagName("tbody")[0];
            let aktivnost=tabela.rows[1].getElementsByTagName("td")[2].innerHTML;
            assert.notEqual(aktivnost, "PJP <br> predavanje", "Aktivnost treba biti u obliku naziv, a u novom redu tip");
        });
        it('Test spana aktivnosti', function () {
            iscrtajModul.dodajAktivnost(div,"OIS","predavanje",12,15,"Ponedjeljak");
            let tabela=div.getElementsByTagName("tbody")[0];
            let aktivnost=tabela.rows[1].getElementsByTagName("td")[3];
            assert.equal(aktivnost.colSpan, 6, "Aktivnost se treba prikazati u više kolona ako traje duže od pola sata");
        });
        it('Test dodavanja aktivnosti na pola sata', function () {
            iscrtajModul.dodajAktivnost(div,"WT","vježbe",15,16.5,"Ponedjeljak");
            let tabela=div.getElementsByTagName("tbody")[0];
            let aktivnost=tabela.rows[1].getElementsByTagName("td")[4];
            assert.equal(aktivnost.colSpan, 3, "Aktivnost se treba prikazati u više kolona ako traje duže od pola sata");
        });
        it('Test ispravnog stila', function () {
            iscrtajModul.dodajAktivnost(div,"RG","vježbe",17,18.5,"Ponedjeljak");
            let tabela=div.getElementsByTagName("tbody")[0];
            let aktivnost=tabela.rows[1].getElementsByTagName("td")[6];
            let className=aktivnost.className;
            assert.equal(className, "nepar aktivnost", "Ivica treba biti isprekidana ako aktivnost završava na pola sata");
        });
        it('Test ispravnog stila 2', function () {
            iscrtajModul.dodajAktivnost(div,"RG","predavanja",9,12,"Utorak");
            let tabela=div.getElementsByTagName("tbody")[0];
            let aktivnost=tabela.rows[2].getElementsByTagName("td")[2];
            let className=aktivnost.className;
            assert.equal(className, "par aktivnost", "Ivica treba biti puna ako aktivnost završava na sat");
        });
        it('Test dodavanja aktivnosti na kraju', function () {
            iscrtajModul.dodajAktivnost(div,"OOI","predavanja",18,21,"Petak");
            let tabela=div.getElementsByTagName("tbody")[0];
            let aktivnost=tabela.rows[5].getElementsByTagName("td")[20];
            let className=aktivnost.className;
            assert.equal(className, "par aktivnost", "Ivica treba biti puna ako aktivnost završava na sat");
        });


        it('Test potpunog preklapanja aktivnosti', function () {
            let rezultat=iscrtajModul.dodajAktivnost(div,"WT","predavanje",9,12,"Ponedjeljak");
            assert.equal(rezultat, "Greška - već postoji termin u rasporedu u zadanom vremenu", "Treba se projaviti greška i ne treba se upisati u tabelu");
        });

        it('Test djelimičnog preklapanja aktivnosti', function () {
            let rezultat=iscrtajModul.dodajAktivnost(div,"WT","predavanje",8.5,10,"Ponedjeljak");
            assert.equal(rezultat, "Greška - već postoji termin u rasporedu u zadanom vremenu", "Treba se projaviti greška i ne treba se upisati u tabelu");
        });
    });

});

/*      //pošto se ne može kliknuti na ok alerta kroz javascript, tada korisnik mora kliknuti, i ako ne klikne u roku od 2 sekunde dolazi do timeouta korišteno je setTimeout
        //ovako će se izvršiti kod u pozdaini, bez da se čeka na potvrdu alerta, ali će se svaka greška na kraju trebati potvrditi
        it('Test ako je proslijeđeno null umjesto rasporeda', function () {
            //brisanje prethodne tabele
            div.innerHTML="";
            let dani=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
            iscrtajModul.iscrtajRaspored(div, dani, 8, 21);
            setTimeout(function () {
                iscrtajModul.dodajAktivnost(null,"WT","predavanje",9,12,"Ponedjeljak");
            }, 10);
            let tabela=div.getElementsByTagName("tbody")[0];
            let aktivnost=tabela.rows[1].getElementsByTagName("td")[2].innerHTML;
            assert.equal(aktivnost, "", "Treba se projaviti greška i ne treba se upisati u tabelu");
        });

        it('Test ako raspored nije kreiran', function () {
            //brisanje prethodne tabele
            div.innerHTML="";

            setTimeout(function () {
                iscrtajModul.dodajAktivnost(div,"WT","predavanje",9,12,"Ponedjeljak");
            }, 10);
            let tabela=div.getElementsByTagName("tbody")[0];
            assert.equal(tabela, undefined, "Treba se projaviti greška");
        });

        it('Test ako vrijeme aktivnosti nije pola sata', function () {
            //brisanje prethodne tabele
            div.innerHTML="";
            let dani=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
            iscrtajModul.iscrtajRaspored(div, dani, 8, 21);

            setTimeout(function () {
                iscrtajModul.dodajAktivnost(div,"WT","predavanje",9.7,12,"Ponedjeljak");
            }, 10);
            let tabela=div.getElementsByTagName("tbody")[0];
            let aktivnost=tabela.rows[1].getElementsByTagName("td")[2].innerHTML;
            assert.equal(aktivnost, "", "Treba se projaviti greška i ne treba se upisati u tabelu");
        });

        it('Test vrijeme kraja je jednako vremenu početka', function () {
            //brisanje prethodne tabele
            div.innerHTML="";
            let dani=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
            iscrtajModul.iscrtajRaspored(div, dani, 8, 21);

            setTimeout(function () {
                iscrtajModul.dodajAktivnost(div,"WT","predavanje",9,9,"Ponedjeljak");
            }, 10);
            let tabela=div.getElementsByTagName("tbody")[0];
            let aktivnost=tabela.rows[1].getElementsByTagName("td")[2].innerHTML;
            assert.equal(aktivnost, "", "Treba se projaviti greška i ne treba se upisati u tabelu");
        });*/