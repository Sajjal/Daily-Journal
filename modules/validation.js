const Joi = require("@hapi/joi");

//Registration Validation
const registrationValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(6).max(30).required(),
    email: Joi.string().min(6).max(100).required().email(),
    password: Joi.string().min(6).max(1000).required(),
    verifyPassword: Joi.string().required().valid(Joi.ref("password")).label("Password Does not Match!!"),
  });
  return schema.validate(data, { abortEarly: false });
};

//Login Validation
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(100).required().email(),
    password: Joi.string().min(6).max(1000).required(),
  });
  return schema.validate(data, { abortEarly: false });
};

module.exports = { registrationValidation, loginValidation };
