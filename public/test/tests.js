let ajax=new XMLHttpRequest();
let assert = chai.assert;
let korijen="http://localhost:3000"


let sadrzajDatoteke="";
function ucitajSadrzajTestneDatoteke() {
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            sadrzajDatoteke=ajax.responseText;
        }
    }
    //pošto se prvo moraju dobaviti podaci iz datoteke, a onda testirati ovo mora biti sinhrono
    ajax.open("GET", "http://localhost:3000/test/testniPodaci.txt", false);
    ajax.send();
}
function getJsonObjectFromString(string) {
    string=string.replace(/\\/g,"");
    return JSON.parse(string);
}
//var csv is the CSV file with headers
function csvJSON(csv){
    let lines=csv.split("\r\n");
    let result = [];
    let headers=lines[0].split(",");
    let duzina=lines.length;
    for(let i=1;i<duzina;i++){
        let obj = {};
        lines[i]=lines[i].replace(/",/g,"\";");
        let currentline=lines[i].split(",");
        if(currentline.length>4){
            let izlaz="";
            for(let j=3;j<currentline.length;j++){
                izlaz+=currentline[j];
                if(j!=currentline.length-1) izlaz+=",";
            }
            while (currentline.length>4) currentline.pop();
            currentline[3]=izlaz;

        }
        for(let j=0;j<headers.length;j++){
            currentline[j]=currentline[j].replace(/;/g,",");
            obj[headers[j]] = currentline[j];
        }
        obj.ulaz=getJsonObjectFromString(obj.ulaz);
        obj.izlaz=getJsonObjectFromString(obj.izlaz);
        result.push(obj);
    }
    return result;
}

//testove pokrenuti na linku: http://localhost:3000/test/tests.html
//U postavci zadataka je pogrešno dat primjer sa [[ i ]], ovdje je testirano kako je traženo u drugom zadatku da se vrati samo niz, tj [ i ]
describe('Testiranje ruta', function() {
    ucitajSadrzajTestneDatoteke();
    let testniPodaci = csvJSON(sadrzajDatoteke);
    testniPodaci.forEach(function(test) {
        it(JSON.stringify(test), function(done) {
            let myPromise = new Promise(function(myResolve, myReject) {
                ajax.onload = function() {
                    if (ajax.status == 200) {
                        myResolve(ajax.response);
                    } else {
                        myReject("File not Found");
                    }
                };
                ajax.open(test.operacija, korijen+test.ruta,false);
                ajax.setRequestHeader("Content-Type", "application/json");
                if(test.ulaz==null){
                    ajax.send();
                }
                else {
                    ajax.send(JSON.stringify(test.ulaz));
                }
            });

            myPromise.then(
                function(value) {
                    let stvarno=value;
                    let ocekivano=JSON.stringify(test.izlaz);
                    try {
                        assert.equal(stvarno, ocekivano);
                        done();
                    }
                    catch (e){
                        done(e);
                    }
                },
                function(error) {console.log(error);}
            );
        });
    });
});


/*operacija,ruta,ulaz,izlaz
DELETE,/all,null,{\"message\":\"Uspješno obrisan sadržaj datoteka!\"}
GET,/predmeti,null,[]
POST,/predmet,{\"naziv\":\"RMA\"},{\"message\":\"Uspješno dodan predmet!\"}
POST,/predmet,{\"naziv\":\"WT\"},{\"message\":\"Uspješno dodan predmet!\"}
GET,/predmeti,null,[{\"naziv\":\"OOI\"},{\"naziv\":\"WT\"}]
POST,/aktivnost,{\"naziv\": \"RMA\", \"tip\": \"predavanja\", \"pocetak\": \"9\", \"kraj\": \"12\", \"dan\": \"ponedjeljak\"},{\"message\":\"Uspješno dodana aktivnost!\"}
POST,/aktivnost,{\"naziv\": \"WT\", \"tip\": \"vjezbe\", \"pocetak\": \"12\", \"kraj\": \"14\", \"dan\": \"ponedjeljak\"},{\"message\":\"Uspješno dodana aktivnost!\"}
GET,/aktivnosti,null,[{\"naziv\": \"RMA\", \"tip\": \"predavanja\", \"pocetak\": \"9\", \"kraj\": \"12\", \"dan\": \"ponedjeljak\"},{\"naziv\": \"WT\", \"tip\": \"vjezbe\", \"pocetak\": \"12\", \"kraj\": \"14\", \"dan\": \"ponedjeljak\"}]
DELETE,/predmet?naziv=WT,null,{\"message\":\"Uspješno obrisan predmet!\"}
GET,/predmeti,null,[{\"naziv\":\"OOI\"}]
DELETE,/predmet?naziv=RMA,null,{\"message\":\"Uspješno obrisan predmet!\"}
GET,/predmeti,null,[]
DELETE,/aktivnost?naziv=WT,null,{\"message\":\"Uspješno obrisana aktivnost!\"}
GET,/aktivnosti,null,[{\"naziv\": \"RMA\", \"tip\": \"predavanja\", \"pocetak\": \"9\", \"kraj\": \"12\", \"dan\": \"ponedjeljak\"}]
DELETE,/aktivnost?naziv=RMA,null,{\"message\":\"Uspješno obrisana aktivnost!\"}
GET,/aktivnosti,null,[]
DELETE,/all,null,{\"message\":\"Uspješno obrisan sadržaj datoteka!\"}*/
