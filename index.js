/*jshint esversion: 6 */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./database/database');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const Sequelize = require("sequelize");
const NodeCache = require('node-cache');

// Controllers
//const tasksController = require('./Controllers/tasks/TasksController.js');
//const dataController = require('./Controllers/date/DataController.js');

// banco de dados
const { UserModel, AgentModel } = require('./database/DB.js');

// Autenticação
passport.use(new LocalStrategy({
    usernameField: 'login', // nome do campo de email no formulário de login
    passwordField: 'password' // nome do campo de senha no formulário de login
}, (email, password, done) => {
    // Verifica se o email do usuário existe no banco de dados
    UserModel.findOne({ where: { Login: email }})
    .then(user => {
        if (!user) {
            return done(null, false, { message: 'Email ou senha incorretos.' });
        }
        // Verifica se a senha fornecida está correta
        bcrypt.compare(password, user.Password, (err, result) => {
        if (err) {
            return done(err);
        }
        if (!result) {
            return done(null, false, { message: 'Email ou senha incorretos.' });
        }
          return done(null, user);
        });
    })
    .catch(err => done(err));
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});
  
passport.deserializeUser((id, done) => {
    UserModel.findByPk(id)
      .then(user => {
        done(null, user);
      })
      .catch(err => done(err));
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
}

// Conexão com o banco de dados
connection.authenticate()
.then(() => {
    console.log("Conexão realizada com sucesso");
})
.catch((error) => {
    console.log("Erro ao se conectar com o banco de dados: " + error);
});

// Configuração do express
app.set('view engine', 'ejs');
app.set('views', './view');
app.use(express.static('public'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuração da sessão
app.use(session({ secret: 'seu-segredo', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
const userCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// post
app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', failureFlash: true  }));

app.post('/register', (req, res) => {
    const name = req.body.name;
    const login = req.body.email;
    const password = req.body.password;
    const address = req.body.address;
    const cpf = req.body.cpf;
    const rg = req.body.rg;
    const crm = req.body.crm;
    const esp = req.body.specialization;
    const BornDate = req.body.bornDate;

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
            UserModel.create({
                Name: name,
                Login: login,
                Password: hash,
                Salt: salt,
                Address: address,
                CPF: cpf,
                RG: rg,
                CRM: crm,
                Esp: esp,
                BornDate: BornDate
            }).then(user => {
                req.login(user, (err) => {
                    if (err) {
                        console.log(err);
                        return res.render('register');
                    }
                    return res.redirect('/');
                });
            })
            .catch(err => {
                console.log(err);
                return res.render('register');
            });
        });
    });
}); 

app.post('/agendamento', (req, res) => {

    AgentModel.create({
        medic: req.body.medic,
        patient: req.body.patient,
        room: req.body.room,
        date: req.body.date,
    }).then(agent => {
        res.redirect('/');
    })
    .catch(err => {
        console.log(err);
        return res.render('agendamento');
    });
});

// get

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/', ensureAuthenticated, (req, res) => {
    connection.query(`SELECT * FROM agents where medic = ${req.user.id} or patient = ${req.user.id};`).then(agents => {
        UserModel.findAll({raw: true}).then(users => {
            agents[0].forEach(agent => {
                agent.medic = users.find(user => user.id == agent.medic).Name;
                agent.patient = users.find(user => user.id == agent.patient).Name;
            });
            res.render('home', {agents: agents[0]});
        });

    });
});

app.get('/profile', ensureAuthenticated, (req, res) => {
    UserModel.findOne({where : {id: req.user.id}}).then(user => {
        res.render('profile', {user: user});
    });
});

app.get('/agendamento', ensureAuthenticated, async (req, res) => {
    const results = await UserModel.findAll({
        raw: true,
        attributes: ['id', 'Name'],
    });

    res.render('agendamento', { results });
});

app.listen( 80 , () => {
    console.log('Server is running on http://localhost');
});