const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const NotFoundError = require('../errors/not-found-err');
const SameEmailError = require('../errors/same-email-err');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) throw new NotFoundError('Нет пользователя с таким id');
      res.send({ data: user });
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    })
      .then((user) => {
        const sendUser = JSON.parse(JSON.stringify(user));
        delete sendUser.password;
        res.send({ data: sendUser });
      }))
    .catch((err) => {
      if (err.code === 11000) next(new SameEmailError('Пользователь с таким email уже зарегистрирован'));
      next(err);
      return true;
    });
};

module.exports.updateUser = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((me) => {
      if (!me) throw new NotFoundError('Нет пользователя с таким id');
      const { name = me.name, about = me.about } = req.body;
      return User.findByIdAndUpdate(
        userId,
        { name, about },
        {
          new: true,
          runValidators: true,
          upsert: true,
        },
      )
        .then((user) => res.send({ data: user }));
    })
    .catch(next);
};

module.exports.updateUserAvatar = (req, res, next) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    userId,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (!user) throw new NotFoundError('Нет пользователя с таким id');
      return res.send({ data: user });
    })
    .catch(next);
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // создадим токен
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });

      /* запись token в куку
      res
        .cookie('jwt', token, {
          maxAge: 604800000,
          httpOnly: true,
        })
        .end();
      */

      res.send({ token });
    })
    .catch((err) => {
      // ошибка аутентификации
      res
        .status(401)
        .send({ message: err.message });
    });
};
