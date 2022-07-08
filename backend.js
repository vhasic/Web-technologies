const express = require('express');
const bodyParser = require('body-parser');
const fs = require("fs");
const url = require('url');
const csvToJson = require('convert-csv-to-json');

const app = express();

//vraćanje statičkih fajlova
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.listen(3000);

//http://localhost:3000/planiranjeNastavnik.html

//Sve rute sa prethodne spirale imaju prefiks /v1/
//region <prethodna spirala>
//get zahtjevi
app.get('/v1/predmeti', function (req, res) {
    let jsonNiz;
    try {
        jsonNiz=csvToJson.fieldDelimiter(',').getJsonFromCsv("predmeti.txt");
    }
    catch (e) {
        jsonNiz=[];
    }

    res.write(JSON.stringify(jsonNiz));
    return res.end();
});

app.get('/v1/aktivnosti', function (req, res) {
    let jsonNiz;
    try {
        jsonNiz = csvToJson.fieldDelimiter(',').getJsonFromCsv("aktivnosti.txt");
    }
    catch (e) {
        jsonNiz=[];
    }
    res.write(JSON.stringify(jsonNiz));
    return res.end();
});




//sinhrono pretrazivanje
function nalaziSeUFajlu(naziv)
{
    let fileContents = fs.readFileSync('predmeti.txt');
    let lines = fileContents.toString().split('\n');
    let sadrzi=false;
    for (let i = 0; i < lines.length; i++) {
        // people.push(lines[i].toString().split(','));
        if(lines[i].toString().includes(naziv)){
            sadrzi=true;
            break;
        }
    }
    return sadrzi;
}

function daLiJeFajlPrazan(file, stringPrvogReda){
    if (!fs.existsSync(file)) {
        return true;
    }
    let fileContents = fs.readFileSync(file);
    let lines = fileContents.toString().split('\n');
    return !lines[0].includes(stringPrvogReda);

}
app.post('/v1/predmet', function (req, res) {
    let tijelo = req.body;
    let novaLinija = "\n" + tijelo['naziv'];
    if(daLiJeFajlPrazan('predmeti.txt','naziv')){
        novaLinija='naziv'+novaLinija;
    }
    else if(nalaziSeUFajlu(tijelo['naziv'])) {
        res.json({message: "Naziv predmeta postoji!"});
        return res.end();
    }

    fs.appendFile('predmeti.txt', novaLinija, function (err) {
        if (err) throw err;
        res.json({message: "Uspješno dodan predmet!"});
    });
});

function daLiJeJedinaDecimalaPet(broj) {
    //ako broj ima više decimala ili ako je prva decimala različita od 5 tada je false
    return (broj * 10) % 10 == 0 || (broj * 10) % 10 == 5;
}
function imaPreklapanja(pocetak, kraj, dan){
    pocetak=parseFloat(pocetak);
    kraj=parseFloat(kraj);
    let jsonNiz = csvToJson.fieldDelimiter(',').getJsonFromCsv("aktivnosti.txt");
    let pronadjeniObjekat=jsonNiz.find(function(currentValue, index, arr){
        let start=currentValue.pocetak;
        let end=currentValue.kraj;
        start=parseInt(start);
        end=parseInt(end);
        if(dan==currentValue.dan && pocetak>=start && pocetak<end){
            return true;
        }

    })
    return pronadjeniObjekat != undefined;
}

function aktivnostIspravna(naziv, tip, pocetak, kraj, dan){
    pocetak=parseFloat(pocetak);
    kraj=parseFloat(kraj);
    //provjera da li su vrijemePocetak i vrijemeKraj brojevi
    if (isNaN(pocetak) || isNaN(kraj)) {
        return false;
    }
    if (!daLiJeJedinaDecimalaPet(pocetak) || !daLiJeJedinaDecimalaPet(kraj)) {
        return false;
    }

    //množi se sa 10 zbog mogućnosti decimale
    if (pocetak * 10 < 0 || pocetak * 10 > 240 || kraj * 10 < 0 || kraj * 10 > 240) {
        return false;
    }

    if (pocetak >= kraj) {
        return false;
    }
    if (imaPreklapanja(pocetak,kraj, dan)) {
        return false;
    }

    return true;
}

app.post('/v1/aktivnost', function (req, res) {
    let tijelo = req.body;
    let novaLinija = "\n" + tijelo['naziv'] + "," + tijelo['tip'] + "," + tijelo['pocetak'] + "," + tijelo['kraj'] + "," + tijelo['dan'];
    if(daLiJeFajlPrazan('aktivnosti.txt','naziv,tip,pocetak,kraj,dan')){
        novaLinija='naziv,tip,pocetak,kraj,dan'+novaLinija;
    }
    else if(!aktivnostIspravna(tijelo['naziv'],tijelo['tip'],tijelo['pocetak'],tijelo['kraj'],tijelo['dan'])){
        res.json({message: "Aktivnost nije validna!"});
        return res.end();
    }

    fs.appendFile('aktivnosti.txt', novaLinija, function (err) {
        if (err) throw err;
        res.json({message: "Uspješno dodana aktivnost!"});
    });
});

//U postavci zadatka je navedeena putanja sa / na kraju
app.get('/v1/predmet/:naziv/aktivnost/', function (req, res) {
    let predmet=req.url.toString().split('/')[2];
    let jsonNiz;
    try {
        jsonNiz = csvToJson.fieldDelimiter(',').getJsonFromCsv("aktivnosti.txt");
    }
    catch (e) {
        jsonNiz=[];
    }
    let result=jsonNiz.filter(function(currentValue, index){
        return currentValue.naziv===predmet;
    });
    res.write(JSON.stringify(result));
    return res.end();
});

//brisanje
app.delete('/v1/aktivnost/:naziv', function (req, res) {
    let naziv=req.url.toString().split('/')[2];
    if(!fs.existsSync('aktivnosti.txt')) {
        res.json({message: "Greška - aktivnost nije obrisana!"});
        return res.end();
    }
    let data = fs.readFileSync('aktivnosti.txt', 'utf-8');
    let pattern="\n"+naziv + ".*";
    let regExp = new RegExp(pattern,"g");
    let newValue = data.replace(regExp, '');
    if(newValue.includes(naziv)) {
        res.json({message: "Greška - aktivnost nije obrisana!"});
        return res.end();
    }
    fs.writeFileSync('aktivnosti.txt', newValue, 'utf-8');

    res.json({message: "Uspješno obrisana aktivnost!"});
});

app.delete('/v1/predmet/:naziv', function (req, res) {
    let naziv=req.url.toString().split('/')[2];
    if(!fs.existsSync('predmeti.txt')){
        res.json({message: "Greška - predmet nije obrisan!"});
        return res.end();
    }
    let data = fs.readFileSync('predmeti.txt', 'utf-8');
    let pattern="\n"+naziv;
    let regExp = new RegExp(pattern,"g");
    let newValue = data.replace(regExp, '');
    if(newValue.includes(naziv)) {
        res.json({message: "Greška - predmet nije obrisan!"});
        return res.end();
    }
    fs.writeFileSync('predmeti.txt', newValue, 'utf-8');

    res.json({message: "Uspješno obrisan predmet!"});
});

app.delete('/v1/all', function (req, res) {
    try {
        if(fs.existsSync('aktivnosti.txt')){
            fs.unlinkSync('aktivnosti.txt');
        }
        if(fs.existsSync('predmeti.txt')){
            fs.unlinkSync('predmeti.txt');
        }
    } catch(err) {
        res.json({message: "Greška - sadržaj datoteka nije moguće obrisati!"});
        return res.end();
    }

    res.json({message: "Uspješno obrisan sadržaj datoteka!"});
});
// endregion

//sa spirale 4
const db = require('./baza/db.js')
db.sequelize.sync().then(function(){
    console.log("Gotova sinhronizacija!");
});

//testiranje
/*db.sequelize.sync({force:true}).then(function(){
    inicializacija().then(function(){
        console.log("Gotovo kreiranje tabela i ubacivanje pocetnih podataka!");
    });
});
function inicializacija(){
    let knjigeListaPromisea=[];

    let predmetiListaPromisea=[];
    let grupeListaPromisea=[];
    return new Promise(function(resolve,reject){
        db.dan.create({naziv:'Ponedjeljak'});
        db.dan.create({naziv:'Utorak'});
        db.dan.create({naziv:'Srijeda'});
        db.dan.create({naziv:'Četvrtak'});
        db.dan.create({naziv:'Petak'});

        db.tip.create({naziv:'Predavanja'});
        db.tip.create({naziv:'Vjezbe'});

        grupeListaPromisea.push(db.grupa.create({naziv:'RMAgrupa1'}));
        grupeListaPromisea.push(db.grupa.create({naziv:'WTgrupa1'}));
        grupeListaPromisea.push(db.grupa.create({naziv:'WTgrupa2'}));

       /!* predmetiListaPromisea.push(db.predmet.create({naziv:'RMA'}));
        predmetiListaPromisea.push(db.predmet.create({naziv:'WT'}));*!/

        Promise.all(grupeListaPromisea).then(function(grupe){
            let grupa1=grupe.filter(function(a){return a.naziv==='RMAgrupa1'})[0];
            let grupa2=grupe.filter(function(a){return a.naziv==='WTgrupa1'})[0];
            let grupa3=grupe.filter(function(a){return a.naziv==='WTgrupa2'})[0];
            /!*let predmet1=predmeti.filter(function(a){return a.naziv==='RMA'})[0];
            let predmet2=predmeti.filter(function(a){return a.naziv==='WT'})[0];*!/

            predmetiListaPromisea.push(db.predmet.create({naziv:'RMA'}).then(function(predmet){
                predmet.setGrupe([grupa1]);
                return new Promise(function(resolve,reject){resolve(predmet);});
            }));
            predmetiListaPromisea.push(db.predmet.create({naziv:'WT'}).then(function(predmet){
                predmet.setGrupe([grupa2,grupa3]);
                return new Promise(function(resolve,reject){resolve(predmet);});
            }));


            Promise.all(predmetiListaPromisea).then(function(predmeti){
                db.student.create({ime:'Neko Nekić',index:12345}).then(function(student){
                    student.setGrupe([grupa2]);
                    grupa2.setStudenti([student]);
                }).catch(function(err){console.log("Greska "+err);});;
                db.student.create({ime:'Četvrti Neko',index:18009}).then(function(student){
                    student.setGrupe([grupa1]);
                    grupa1.setStudenti([student]);
                }).catch(function(err){console.log("Greska "+err);});;

               }).catch(function(err){console.log("Greska "+err);});
        }).catch(function(err){console.log("Greska "+err);});
    });
}*/

//kraj testiranja

//POST->Create (dodavanje instance u bazu), GET->Read (dobavljanje svih instanci iz baze),
//PUT->Update (ažuriranje instance u bazi), DELETE->Delete (brisanje instance u bazi)

//Predmet
app.post('/v2/predmet', function (req, res) {
    let tijelo = req.body;
    let naziv = tijelo['naziv'];
    db.predmet.create({naziv:naziv}).then(function (predmet) {
        res.json({message: "Uspješno dodan predmet!"});
        res.end();
    }).catch(function(err){
        res.json({message: "Greska"+err});
        res.end();
    });
});

app.get('/v2/predmet', function (req, res) {
    db.predmet.findAll().then(function (predmeti) {
        // res.write(JSON.stringify(dajRezultatIzModela(predmeti)));
        res.write(JSON.stringify(predmeti));
        res.end();
    }).catch(function(err){
        res.json({message: "Greska"+err});
        res.end();
    });
});

app.put('/v2/predmet/:id', function (req, res) {
    let id=req.url.toString().split('/')[3];
    let tijelo = req.body;
    let naziv = tijelo['naziv'];
    db.predmet.update(
        { naziv: naziv },
        { where: { id: id } }
    ).then(function (predmet) {
        res.json({message: "Uspješno ažuriran predmet!"});
        res.end();
    }).catch(function(err){
        res.json({message: "Greska "+err});
        res.end();
    });
});

app.delete('/v2/predmet/:id', function (req, res) {
    let id=req.url.toString().split('/')[3];
    db.predmet.destroy({where: {id:id}}).then(function (predmet) {
        res.json({message: "Uspješno obrisan predmet!"});
        res.end();
    }).catch(function(err){
        res.json({message: "Greska"+err});
        res.end();
    });
});

//Grupa
app.post('/v2/grupa', function (req, res) {
    let tijelo = req.body;
    let naziv = tijelo['naziv'];
    let predmetId=tijelo['predmet'];
    db.grupa.create({naziv:naziv, predmetId:predmetId}).then(function (grupa) {
        res.json({message: "Uspješno dodana grupa!"});
        res.end();
    }).catch(function(err){
        res.json({message: "Greska"+err});
        res.end();
    });
});


app.get('/v2/grupa', function (req, res) {
    db.grupa.findAll().then(function (grupe) {
        // res.write(JSON.stringify(dajRezultatIzModela(grupe)));
        res.write(JSON.stringify(grupe));
        res.end();
    }).catch(function(err){
        res.json({message: "Greska"+err});
        res.end();
    });
});

app.put('/v2/grupa/:id', function (req, res) {
    let id=req.url.toString().split('/')[3];
    let tijelo = req.body;
    let naziv = tijelo['naziv'];
    // let predmetId=tijelo['predmetId'];
    let predmetId=tijelo['predmet'];
    db.grupa.update(
        { naziv: naziv, predmetId:predmetId},
        { where: { id: id } }
    ).then(function (grupa) {
        res.json({message: "Uspješno ažurirana grupa!"});
        res.end();
    }).catch(function(err){
        res.json({message: "Greska "+err});
        res.end();
    });
});

app.delete('/v2/grupa/:id', function (req, res) {
    let id=req.url.toString().split('/')[3];
    db.grupa.destroy({where: {id:id}}).then(function (grupa) {
        res.json({message: "Uspješno obrisana grupa!"});
        res.end();
    }).catch(function(err){
        res.json({message: "Greska"+err});
        res.end();
    });
});

//ova funkcija radi, ali je problem asinhronost
/*function imaPreklapanjaV2(pocetak, kraj, danId) {
    pocetak=parseFloat(pocetak);
    kraj=parseFloat(kraj);
    db.aktivnost.findAll().then(function (aktivnosti) {
        let pronadjeniObjekat=aktivnosti.find(function(currentValue, index, arr){
            let start=currentValue.pocetak;
            let end=currentValue.kraj;
            start=parseFloat(start);
            end=parseFloat(end);
            if(danId==currentValue.dan && pocetak>=start && pocetak<end){
                return true;
            }
        })
        return pronadjeniObjekat != undefined;
    }).catch(function(err){
        console.log(err);
    });
}*/
function aktivnostIspravnaV2(pocetak, kraj, danId){
    pocetak=parseFloat(pocetak);
    kraj=parseFloat(kraj);
    //provjera da li su vrijemePocetak i vrijemeKraj brojevi
    if (isNaN(pocetak) || isNaN(kraj)) {
        return false;
    }
    if (!daLiJeJedinaDecimalaPet(pocetak) || !daLiJeJedinaDecimalaPet(kraj)) {
        return false;
    }

    //množi se sa 10 zbog mogućnosti decimale
    if (pocetak * 10 < 0 || pocetak * 10 > 240 || kraj * 10 < 0 || kraj * 10 > 240) {
        return false;
    }

    if (pocetak >= kraj) {
        return false;
    }
/*    if (imaPreklapanjaV2(pocetak,kraj, danId)) {
        return false;
    }*/
    return true;
}

//Aktivnost
app.post('/v2/aktivnost', function (req, res) {
    let tijelo = req.body;
    let naziv = tijelo['naziv'];
    let pocetak = tijelo['pocetak'];
    let kraj = tijelo['kraj'];
    let predmetId = tijelo['predmet'];
    let grupaId = tijelo['grupa'];
    let danId = tijelo['dan'];
    let tipId = tijelo['tip'];
    if(!aktivnostIspravnaV2(pocetak, kraj, danId)){
        res.json({message: "Aktivnost neispravna!"});
        res.end();
    }
    else{
        db.aktivnost.create({naziv:naziv,pocetak:pocetak,kraj:kraj, predmetId:predmetId, grupaId:grupaId, danId:danId, tipId:tipId}).then(function (aktivnost) {
            res.json({message: "Uspješno dodana aktivnost!"});
            res.end();
        }).catch(function(err){
            res.json({message: "Greska"+err});
            res.end();
        });
    }
});

app.get('/v2/aktivnost', function (req, res) {
    db.aktivnost.findAll().then(function (aktivnosti) {
        res.write(JSON.stringify(aktivnosti));
        res.end();
    }).catch(function(err){
        res.json({message: "Greska"+err});
        res.end();
    });
});

app.put('/v2/aktivnost/:id', function (req, res) {
    let id=req.url.toString().split('/')[3];
    let tijelo = req.body;
    let naziv = tijelo['naziv'];
    let pocetak = tijelo['pocetak'];
    let kraj = tijelo['kraj'];
    let predmetId = tijelo['predmet'];
    let grupaId = tijelo['grupa'];
    let danId = tijelo['dan'];
    let tipId = tijelo['tip'];
        db.aktivnost.update(
            {
                naziv: naziv,
                pocetak: pocetak,
                kraj: kraj,
                predmetId: predmetId,
                grupaId: grupaId,
                danId: danId,
                tipId: tipId
            },
            {where: {id: id}}
        ).then(function (aktivnost) {
            res.json({message: "Uspješno ažurirana aktivnost!"});
            res.end();
        }).catch(function (err) {
            res.json({message: "Greska " + err});
            res.end();
        });
});

app.delete('/v2/aktivnost/:id', function (req, res) {
    let id=req.url.toString().split('/')[3];
    db.aktivnost.destroy({where: {id:id}}).then(function (aktivnost) {
        res.json({message: "Uspješno obrisana aktivnost!"});
        res.end();
    }).catch(function(err){
        res.json({message: "Greska"+err});
        res.end();
    });
});

//Dan
app.post('/v2/dan', function (req, res) {
    let tijelo = req.body;
    let naziv = tijelo['naziv'];
    db.dan.create({naziv:naziv}).then(function (dan) {
        res.json({message: "Uspješno dodan dan!"});
        res.end();
    }).catch(function(err){
        res.json({message: "Greska"+err});
        res.end();
    });
});

app.get('/v2/dan', function (req, res) {
    db.dan.findAll().then(function (dani) {
        res.write(JSON.stringify(dani));
        res.end();
    }).catch(function(err){
        res.json({message: "Greska"+err});
        res.end();
    });
});

app.put('/v2/dan/:id', function (req, res) {
    let id=req.url.toString().split('/')[3];
    let tijelo = req.body;
    let naziv = tijelo['naziv'];
    db.dan.update(
        { naziv: naziv },
        { where: { id: id } }
    ).then(function (dan) {
        res.json({message: "Uspješno ažuriran dan!"});
        res.end();
    }).catch(function(err){
        res.json({message: "Greska "+err});
        res.end();
    });
});

app.delete('/v2/dan/:id', function (req, res) {
    let id=req.url.toString().split('/')[3];
    db.dan.destroy({where: {id:id}}).then(function (dan) {
        res.json({message: "Uspješno obrisan dan!"});
        res.end();
    }).catch(function(err){
        res.json({message: "Greska"+err});
        res.end();
    });
});

//Tip
app.post('/v2/tip', function (req, res) {
    let tijelo = req.body;
    let naziv = tijelo['naziv'];
    db.tip.create({naziv:naziv}).then(function (tip) {
        res.json({message: "Uspješno dodan tip!"});
        res.end();
    }).catch(function(err){
        res.json({message: "Greska"+err});
        res.end();
    });
});

app.get('/v2/tip', function (req, res) {
    db.tip.findAll().then(function (tipovi) {
        res.write(JSON.stringify(tipovi));
        res.end();
    }).catch(function(err){
        res.json({message: "Greska"+err});
        res.end();
    });
});

app.put('/v2/tip/:id', function (req, res) {
    let id=req.url.toString().split('/')[3];
    let tijelo = req.body;
    let naziv = tijelo['naziv'];
    db.tip.update(
        { naziv: naziv },
        { where: { id: id } }
    ).then(function (tip) {
        res.json({message: "Uspješno ažuriran tip!"});
        res.end();
    }).catch(function(err){
        res.json({message: "Greska "+err});
        res.end();
    });
});

app.delete('/v2/tip/:id', function (req, res) {
    let id=req.url.toString().split('/')[3];
    db.tip.destroy({where: {id:id}}).then(function (tip) {
        res.json({message: "Uspješno obrisan tip!"});
        res.end();
    }).catch(function(err){
        res.json({message: "Greska"+err});
        res.end();
    });
});

//Student
app.post('/v2/student', function (req, res) {
    let tijelo = req.body;
    let ime = tijelo['ime'];
    let index = tijelo['index'];
    db.student.create({ime:ime,index:index}).then(function (student) {
        res.json({message: "Uspješno dodan student!"});
        res.end();
    }).catch(function(err){
        res.json({message: "Greska"+err});
        res.end();
    });
});

app.get('/v2/student', function (req, res) {
    db.student.findAll().then(function (studenti) {
        res.write(JSON.stringify(studenti));
        res.end();
    }).catch(function(err){
        res.json({message: "Greska"+err});
        res.end();
    });
});

app.put('/v2/student/:id', function (req, res) {
    let id=req.url.toString().split('/')[3];
    let tijelo = req.body;
    let ime = tijelo['ime'];
    let index = tijelo['index'];
    db.student.update(
        { ime: ime, index:index },
        { where: { id: id } }
    ).then(function (student) {
        res.json({message: "Uspješno ažuriran student!"});
        res.end();
    }).catch(function(err){
        res.json({message: "Greska "+err});
        res.end();
    });
});

app.delete('/v2/student/:id', function (req, res) {
    let id=req.url.toString().split('/')[3];
    db.student.destroy({where: {id:id}}).then(function (student) {
        res.json({message: "Uspješno obrisan student!"});
        res.end();
    }).catch(function(err){
        res.json({message: "Greska"+err});
        res.end();
    });
});

//ovo poziva ajax iz drugog zadatka, jer je traženo da server sve odradi, a da se iz ajaxa samo pošalju podaci
//dodavanje niza studenata uz vraćanje poruke ako neki postoji
app.post('/v2/studenti', function (req, res) {
    let tijelo = req.body;
    let studenti=tijelo['studenti'];
    let grupa=tijelo['grupa'];
    let result=[];
    let studentiListaPromisea=[];
    db.student.findAll().then(function (studentiIzBaze) {
        db.grupa.findOne({where:{naziv:grupa}}).then(function (grupaIzBaze) {
            for(let i=0;i<studenti.length;i++){
                //nađi da li postoji student sa istim imenom i indexom u bazi
                let studentPostoji=studentiIzBaze.find(function (student) {
                    return studenti[i].ime == student.ime && studenti[i].index == student.index;

                });
                //nađi da li postoji student samo sa istim indexom indexom u bazi
                let studentSaIstimIndexom=studentiIzBaze.find(function (student) {
                    return studenti[i].index == student.index;

                });
                //ako ne postoji student u bazi ni sa istim imenom i indexom ni sa istim samo indexom onda ga dodaj u bazu
                if(studentPostoji===undefined && studentSaIstimIndexom===undefined){
                    studentiListaPromisea.push(db.student.create({ime:studenti[i].ime,index:studenti[i].index}).then(function (student) {
                        student.setGrupe([grupaIzBaze]);
                        return new Promise(function(resolve,reject){resolve(student);});
                    }));
                }
                //ako je pronadjen student sa istim imenom i indexom ali je zadana druga grupa tada se on azurira sa novom grupom
                else if(studentPostoji!==undefined){
                    studentPostoji.getGrupe().then(function (grupe) {
                        if(grupe[0].naziv!==grupa){
                            studentPostoji.setGrupe([grupaIzBaze]);
                        }
                    }).catch(function(err){
                        console.log(err);
                    });
                }
                //ako postoji sa istim indexom onda ga ne dodaj nego samo vrati poruku za tog studenta
                else if(studentSaIstimIndexom!==undefined){
                    result.push({message:"Student "+studenti[i].ime+ " nije kreiran jer postoji student "
                            +studentSaIstimIndexom.ime+" sa istim indexom "+studenti[i].index});
                }
            }
            //ako su svi dodani vrati prazan niz inače vrati niz sa porukama
            Promise.all(studentiListaPromisea).then(function (dodaniStudenti) {
                if(dodaniStudenti.length<studenti.length){
                    res.json(result);
                }
                else {
                    res.json([]);
                }
                res.end();
            })
        });
    }).catch(function(err){
        res.json({message: "Greska"+err});
        res.end();
    });
});
//http://localhost:3000/planiranjeNastavnik.html