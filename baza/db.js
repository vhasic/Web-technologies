const Sequelize = require("sequelize");
const path = require('path');
const _dirname = path.resolve();
const sequelize = new Sequelize("wt2018328","root","root",{host:"127.0.0.1",dialect:"mysql",logging:false});
const db={};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

//import modela
/*db.predmet = sequelize.import(__dirname+'/modeli/predmet.js');
db.grupa = sequelize.import(__dirname+'/modeli/grupa.js');
db.aktivnost = sequelize.import(__dirname+'/modeli/aktivnost.js');
db.dan = sequelize.import(__dirname+'/modeli/dan.js');
db.tip = sequelize.import(__dirname+'/modeli/tip.js');
db.student = sequelize.import(__dirname+'/modeli/student.js');*/
db.predmet = require(_dirname + "/baza/modeli/predmet.js")(sequelize, Sequelize.DataTypes);
db.grupa = require(_dirname + "/baza/modeli/grupa.js")(sequelize, Sequelize.DataTypes);
db.aktivnost = require(_dirname + "/baza/modeli/aktivnost.js")(sequelize, Sequelize.DataTypes);
db.dan = require(_dirname + "/baza/modeli/dan.js")(sequelize, Sequelize.DataTypes);
db.tip = require(_dirname + "/baza/modeli/tip.js")(sequelize, Sequelize.DataTypes);
db.student = require(_dirname + "/baza/modeli/student.js")(sequelize, Sequelize.DataTypes);

//relacije
// Predmet 1-N Grupa
// Model1.hasMany(Model2,{as:’kolekcija’}), Model2 dobija atribut sa nazivom model1_id, a model1 dvije metode getKolekcija i setKolekcija koje predstavljaju listu model2 instanci
db.predmet.hasMany(db.grupa,{as:'grupe'});
// Aktivnost N-1 Predmet
db.predmet.hasMany(db.aktivnost,{as:'aktivnosti'});
// Aktivnost N-0 Grupa
//db.grupa.hasMany(db.aktivnost,{as:'aktivnosti'});
db.grupa.hasMany(db.aktivnost,{foreignKey:{allowNull:true}, as:'aktivnosti'});
// Aktivnost N-1 Dan
db.dan.hasMany(db.aktivnost,{as:'aktivnosti'});
// Aktivnost N-1 Tip
db.tip.hasMany(db.aktivnost,{as:'aktivnosti'});
// Student N-M Grupa
db.studentGrupa=db.student.belongsToMany(db.grupa,{as:'grupe',through:'student_grupa',foreignKey:'studentId'});
db.grupa.belongsToMany(db.student,{as:'studenti',through:'student_grupa',foreignKey:'grupaId'});

module.exports=db;

//mysql -u root -p
//use wt2018328
//select s.ime,s.index,g.naziv from students s, grupas g, student_grupa sg where s.id=sg.studentId and g.id=sg.grupaId;