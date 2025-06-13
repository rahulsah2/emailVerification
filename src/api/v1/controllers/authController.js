const { STATUS_CODES } = require('../../../constants/statusCodes');
const authService = require('../../../services/authService');
const { errorResponse, successResponse } = require('../../../utils/response');

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password, organizationName, organizationEmail } = req.body;
      const verificationToken = await authService.register({
        name,
        email,
        password,
        organizationName,
        organizationEmail,
        baseUrl: `${req.protocol}://${req.get('host')}`,
      });
      return successResponse(
        res,
        STATUS_CODES.OK,
        'Verification email sent. Please check your inbox.',
        { verificationToken }
      );
    } catch (err) {
      return errorResponse(res, err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR, err.message);
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const { token } = req.params;
      await authService.verifyEmail(token);
      return successResponse(res, STATUS_CODES.OK, 'Email verified. You can now log in.');
    } catch (err) {
      return errorResponse(res, err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR, err.message);
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const { token, user } = await authService.login({ email, password });
      return successResponse(res, STATUS_CODES.OK, 'Login successful', { token, user });
    } catch (err) {
      return errorResponse(res, err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR, err.message);
    }
  },
};

module.exports = authController;