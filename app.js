require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const validator = require('validator');
const { celebrate, Joi, errors } = require('celebrate');
const NotFoundError = require('./errors/not-found-err');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(bodyParser.json());
app.use((err, req, res, next) => {
  if (err) {
    res.status(400).send({ message: 'bad JSON' });
  } else {
    next();
  }
});

app.use(bodyParser.urlencoded({ extended: true }));

//  обработчик несуществующего пут
const errorNotFound = (req, res, next) => {
  next(new NotFoundError('Запрашиваемый ресурс не найден'));
};

//  импортируем роуты
const routesUsers = require('./routes/users.js');
const routesCards = require('./routes/cards.js');

//  импортируем контроллеры
const { login, createUser } = require('./controllers/users.js');

// импортируем мидлвары
const auth = require('./middlewares/auth');
const errCatcher = require('./middlewares/err-catcher');

// валидаторы запросов
const loginValid = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().token().min(8)
      .max(100),
  }),
});

const userValid = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
    avatar: Joi.string().required().custom((value, helper) => {
      if (!validator.isURL(value)) {
        return helper.message('поле avatar должно быть корректной ссылкой');
      }
      return value;
    }),
    email: Joi.string().required().email(),
    password: Joi.string().required().token().min(8)
      .max(100),
  }),
});

app.use(requestLogger);

app.use('/users', auth, routesUsers);
app.use('/cards', auth, routesCards);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signin', loginValid, login);
app.post('/signup', userValid, createUser);

app.use(errorLogger);

app.use(errorNotFound);
app.use(errors()); // обработчик ошибок celebrate
app.use(errCatcher);

app.listen(PORT);
