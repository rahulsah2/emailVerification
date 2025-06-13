const AppError = require('../../../utils/appError');

const validate = (schema) => async(req, res, next)=>{
  try{
    await schema.validateAsync(req.body,{abortEarly: false});
    next();
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

module.exports = { validate };