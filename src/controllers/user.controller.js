import { UserService, AuthService } from "#services";

export class UserControllerClass {
  logout = async (req, res, next) => {
    try {
      await AuthService.logout(res);

      return res.status(200).json({
        success: true,
        data: { message: "Session terminated successfully." },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };

  // Step 1: Verify current password & send OTP
  initiateDeleteAccount = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { currentPassword } = req.body;

      await UserService.initiateDeleteAccount(userId, currentPassword);

      return res.status(200).json({
        success: true,
        data: { message: "Verification OTP sent to your registered email." },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };

  // Step 2: Verify OTP & execute permanent account deletion
  confirmDeleteAccount = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { otp } = req.body;

      await UserService.confirmDeleteAccount(userId, otp, res);

      return res.status(200).json({
        success: true,
        data: { message: "Account deleted successfully." },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };

  initiatePasswordChange = async (req, res, next) => {
    try {
      const result = await UserService.initiatePasswordChange(
        req.user.id,
        req.body.currentPassword,
      );
      return res.status(200).json({ success: true, data: result, error: null });
    } catch (error) {
      next(error);
    }
  };

  confirmPasswordChange = async (req, res, next) => {
    try {
      const { otp, newPassword } = req.body;
      const result = await UserService.confirmPasswordChange(
        req.user.id,
        otp,
        newPassword,
      );
      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };

  initiateEmailChange = async (req, res, next) => {
    try {
      const result = await UserService.initiateEmailChange(
        req.user.id,
        req.body.currentPassword,
      );
      return res.status(200).json({ success: true, data: result, error: null });
    } catch (error) {
      next(error);
    }
  };

  verifyExistingEmailOtp = async (req, res, next) => {
    try {
      const result = await UserService.verifyExistingEmailOtp(
        req.user.id,
        req.body.otp,
      );
      return res.status(200).json({
        success: true,
        message: "Current email verified. You may now enter your new email.",
        data: result,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };

  requestNewEmailVerification = async (req, res, next) => {
    try {
      const { emailChangeToken, newEmail } = req.body;
      const result = await UserService.requestNewEmailVerification(
        req.user.id,
        emailChangeToken,
        newEmail,
      );
      return res.status(200).json({ success: true, data: result, error: null });
    } catch (error) {
      next(error);
    }
  };

  confirmNewEmailUpdate = async (req, res, next) => {
    try {
      const { emailChangeToken, newEmail, otp } = req.body;
      const updatedUser = await UserService.confirmNewEmailUpdate(
        req.user.id,
        emailChangeToken,
        newEmail,
        otp,
      );
      return res.status(200).json({
        success: true,
        message: "Email address updated successfully.",
        data: updatedUser,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const UserController = new UserControllerClass();
