//ovdje se nalaze pozivi funkcija

let div1=document.getElementById("div1");
let div2=document.getElementById("div2");
let dani=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
let dani2=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak"];
// let dani2=["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota", "Nedjelja"];

//testiranje ispisa greške za neispravna vremena funkcije iscrtajRaspored
iscrtajRaspored(div1,dani, -1,2);
iscrtajRaspored(div1,dani, 1,25);
iscrtajRaspored(div1,dani, 15,14);
iscrtajRaspored(div1,dani, "nešto",14);
//brisanje teksta greške
div1.innerHTML="";

//testiranje iscrtavanja rasporeda
iscrtajRaspored(div1,dani, 8,21);

// iscrtajRaspored(div2, dani2,7,20);
// iscrtajRaspored(div2,dani2,15,24);
// iscrtajRaspored(div2,dani2,16,23);

//testiranje ispisa grešaka za funkciju dodajAktivnost
dodajAktivnost(null,"WT","Predavanje",5,10,"Ponedjeljak");
dodajAktivnost(div2,"WT","predavanje",5,10,"Ponedjeljak");
dodajAktivnost(div1,"WT","predavanje",-0.5,10,"Ponedjeljak");
dodajAktivnost(div1,"WT","predavanje",1,24.5,"Ponedjeljak");
dodajAktivnost(div1,"WT","predavanje",12,8,"Ponedjeljak");


//testiranje dodavanja aktivnosti
dodajAktivnost(div1,"WT","predavanje",9,12,"Ponedjeljak");
dodajAktivnost(div1,"WT","vježbe",12,13.5,"Ponedjeljak");
dodajAktivnost(div1,"RMA","predavanje",14,17,"Ponedjeljak");
dodajAktivnost(div1,"RMA2","vježbe",12.5,14,"Utorak");
dodajAktivnost(div1,"DM","tutorijal",14,16,"Utorak");
dodajAktivnost(div1,"DM","predavanje",16,19,"Utorak");
dodajAktivnost(div1,"OI","predavanje",12,15,"Srijeda");
dodajAktivnost(div1,"PJP","vježbe",8,9,"Ponedjeljak");
dodajAktivnost(div1,"PJP","predavanja",15,18,"Srijeda");
dodajAktivnost(div1,"OOI","vježbe",18.5,19.5,"Srijeda");
dodajAktivnost(div1,"OOI","predavanja",19.5,21,"Srijeda");

//testiranje preklapanja termina
dodajAktivnost(div1,"WT","predavanje",9,9.5,"Ponedjeljak");
dodajAktivnost(div1,"WT","predavanje",8,9.5,"Ponedjeljak");
dodajAktivnost(div1,"WT","predavanje",11,13,"Ponedjeljak");


iscrtajRaspored(div2, dani2,7,20);
dodajAktivnost(div2, "OOI", "predavanja",12,15,"Utorak");
dodajAktivnost(div2, "OIS", "predavanja",15,17,"Utorak");
dodajAktivnost(div2, "OIS", "vježbe",17,18,"Utorak");
dodajAktivnost(div2, "WT", "predavanja",9,12,"Srijeda");
dodajAktivnost(div2, "RG", "vježbe",12,13.5,"Srijeda");
dodajAktivnost(div2, "OOI", "vježbe",16,17.5,"Srijeda");
dodajAktivnost(div2, "RG", "predavanja",9,12,"Četvrtak");
dodajAktivnost(div2, "VVS", "predavanja",12,15,"Četvrtak");
dodajAktivnost(div2, "OOI", "tutorijal",15,16.5,"Četvrtak");
dodajAktivnost(div2, "RG", "tutorijal",16.5,18,"Četvrtak");
