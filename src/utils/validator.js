const Joi = require('joi');

/* we are validating the data posted by user during the registration and for this we are using joi library  */
 const registerSchema = Joi.object({
    name: Joi.string().required().trim(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    organizationName: Joi.string().required(),
    organizationEmail: Joi.string().email().required(),
 });
 
 /* we are validating the data posted by user during the login with the help of joi library */
 const loginSchema= Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
 });
 
 module.exports = {registerSchema, loginSchema};