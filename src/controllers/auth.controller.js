import { AuthService } from "#services";

export class AuthControllerClass {
  initiateSignup = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const result = await AuthService.initiateSignup({ email, password });

      return res.status(202).json({
        success: true,
        data: result,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };

  verifySignup = async (req, res, next) => {
    try {
      const { email, otp } = req.body;

      const newUser = await AuthService.verifySignup(email, otp);

      return res.status(201).json({
        success: true,
        data: {
          message: "Account successfully provisioned.",
          userId: newUser._id,
          email: newUser.email,
        },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };

  initiateLogin = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const result = await AuthService.initiateLogin(email, password);

      return res.status(200).json({
        success: true,
        data: result,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };

  verifyLogin = async (req, res, next) => {
    try {
      const { userId, otp } = req.body;

      const { user, tokenName } = await AuthService.verifyLogin(
        userId,
        otp,
        res,
      );

      return res.status(200).json({
        success: true,
        data: {
          message: "Authentication successful.",
          profile: {
            id: user._id,
            email: user.email,
          },
          sessionCookieName: tokenName,
        },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };

  initiatePasswordReset = async (req, res, next) => {
    try {
      const { email } = req.body;
      const result = await AuthService.initiatePasswordReset(email);

      return res.status(200).json({
        success: true,
        data: result,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };

  completePasswordReset = async (req, res, next) => {
    try {
      const { userId, otp, newPassword } = req.body;
      const result = await AuthService.completePasswordReset(
        userId,
        otp,
        newPassword,
      );

      return res.status(200).json({
        success: true,
        data: result,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const AuthController = new AuthControllerClass();
