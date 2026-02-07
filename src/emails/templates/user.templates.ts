import { Layout, TemplateResult } from "../components/EmailLayout";
import { DEFAULT_EMAIL_COLORS } from "../constants/defaultColors";
import { StoreSettings } from "./interface";

export interface ForgotPasswordVars {
  email: string;
  token: string;
}

export interface WelcomeEmailVars {
  userName: string;
  userEmail: string;
  verificationUrl?: string;
  dashboardUrl: string;
}

export interface AccountVerifiedVars {
  userName: string;
  dashboardUrl: string;
}

export interface AccountSuspendedVars {
  userName: string;
  suspensionReason: string;
  suspensionDate: string;
  supportUrl: string;
}

/**
 * User Forgot Password Email Template
 * Reset link points to /reset-password
 */
export const forgotPassword = (
  { email, token }: ForgotPasswordVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const resetLink = `${
    shopSettings.shopUrl
  }/auth/reset-password?email=${encodeURIComponent(
    email,
  )}&token=${encodeURIComponent(token)}`;

  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const bodyContent = `
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Reset Your Password
    </h1>
    
    <p style="margin:0 0 16px; font-size:16px; line-height:24px; color:${c.foreground};">
      Hello,
    </p>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      We received a request to reset your password for your ${shopSettings.shopName} account. Click the button below to set a new password.
    </p>
    
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px;">
      <tr>
        <td align="center" style="border-radius:6px; background-color:${c.primary};">
          <a href="${resetLink}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>
    
    <!-- Info box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.muted}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            <strong style="display:block; margin-bottom:4px; color:${c.foreground};">Security Notice</strong>
            This link will expire in <strong>1 hour</strong> for security reasons. If you didn't request this password reset, you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>
    
    <!-- Alternative link -->
    <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
      If the button above doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin:8px 0 0; font-size:14px; line-height:20px; word-break:break-all;">
      <a href="${resetLink}" style="color:${c.primary}; text-decoration:underline;">${resetLink}</a>
    </p>
  `;

  return Layout({
    subject: "Reset Your Password",
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};

/**
 * User Password Changed Email Template
 * Confirmation email sent after successful password change
 */
export const passwordChanged = (
  _: any,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const bodyContent = `
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${
      c.foreground
    }; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Password Changed Successfully
    </h1>
    
    <p style="margin:0 0 16px; font-size:16px; line-height:24px; color:${
      c.foreground
    };">
      Hello,
    </p>

    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${
      c.foreground
    };">
      Your password for your ${
        shopSettings.shopName
      } account has been successfully changed. If you initiated this change, no further action is needed.
    </p>

    <!-- Success indicator -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${
      c.accent
    }; border:1px solid ${c.border};">
      <tr>
        <td style="padding:20px 24px; text-align:center;">
          <div style="display:inline-block; width:48px; height:48px; border-radius:50%; background-color:${
            c.primary
          }; margin-bottom:12px;">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <path d="M20 24.5L22.5 27L28 21.5" stroke="${
                c.primaryForeground
              }" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p style="margin:0; font-size:16px; font-weight:600; line-height:24px; color:${
            c.foreground
          };">
            Your password has been updated
          </p>
          <p style="margin:8px 0 0; font-size:14px; line-height:20px; color:${
            c.mutedForeground
          };">
            ${new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </td>
      </tr>
    </table>

    <!-- Security alert -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${
      c.muted
    }; border-left:4px solid ${c.primary};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; font-size:14px; line-height:20px; color:${
            c.foreground
          };">
            <strong style="display:block; margin-bottom:4px;">Didn't make this change?</strong>
            <span style="color:${
              c.mutedForeground
            };">If you did NOT change your password, please </span>
            <a href="${shopSettings.shopUrl}/contact" style="color:${
              c.primary
            }; text-decoration:none; font-weight:600;">contact support immediately</a>
            <span style="color:${
              c.mutedForeground
            };"> to secure your account.</span>
          </p>
        </td>
      </tr>
    </table>
    
    <!-- Best practices tip -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; border-radius:6px; background-color:${
      c.accent
    }; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; line-height:20px; color:${
            c.foreground
          };">
            Security Tips
          </p>
          <ul style="margin:0; padding-left:20px; font-size:13px; line-height:20px; color:${
            c.mutedForeground
          };">
            <li style="margin-bottom:4px;">Use a strong, unique password for your account</li>
            <li style="margin-bottom:4px;">Never share your password with anyone</li>
            <li>Enable two-factor authentication for extra security</li>
          </ul>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: "Your Password Has Been Changed",
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};

/**
 * Welcome Email Template (User)
 * Sent when a new user creates an account
 */
export const welcomeEmail = (
  vars: WelcomeEmailVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const bodyContent = `
    <!-- Welcome badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:8px 16px; background-color:#8B5CF6; border-radius:20px;">
          <span style="font-size:13px; font-weight:600; line-height:16px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">👋 Welcome</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Welcome to ${shopSettings.shopName}!
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      Hi <strong>${vars.userName}</strong>, we're thrilled to have you with us! Your account has been created successfully.
    </p>
    
    <!-- Account Info Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 12px; font-size:14px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Account Details</p>
          <p style="margin:0 0 4px; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            <strong style="color:${c.foreground};">Email:</strong> ${vars.userEmail}
          </p>
        </td>
      </tr>
    </table>
    
    ${
      vars.verificationUrl
        ? `
    <!-- Verification CTA -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.accent}; border:2px solid ${c.primary};">
      <tr>
        <td style="padding:24px; text-align:center;">
          <p style="margin:0 0 16px; font-size:16px; font-weight:600; line-height:24px; color:${c.foreground};">
            Verify Your Email Address
          </p>
          <p style="margin:0 0 20px; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            Please verify your email to unlock all features and start shopping.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
            <tr>
              <td align="center" style="border-radius:6px; background-color:${c.primary};">
                <a href="${vars.verificationUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                  Verify Email
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `
        : ""
    }
    
    <!-- Get Started -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.muted}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 12px; font-size:16px; font-weight:600; line-height:24px; color:${c.foreground};">
            Get Started
          </p>
          <ul style="margin:0; padding-left:20px; font-size:14px; line-height:24px; color:${c.mutedForeground};">
            <li>Browse our extensive product catalog</li>
            <li>Add your favorite items to your wishlist</li>
            <li>Enjoy secure checkout and fast shipping</li>
            <li>Track your orders in real-time</li>
          </ul>
        </td>
      </tr>
    </table>
    
    <!-- Dashboard CTA -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td align="center" style="border-radius:6px; background-color:transparent; border:2px solid ${c.border};">
          <a href="${vars.dashboardUrl}" target="_blank" style="display:inline-block; padding:12px 30px; font-size:16px; font-weight:600; line-height:20px; color:${c.foreground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            Go to Dashboard
          </a>
        </td>
      </tr>
    </table>
    
    <!-- Support -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; border-radius:6px; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            Need help getting started? Our support team is here to assist you at <a href="${shopSettings.shopUrl}/contact" style="color:${c.primary}; text-decoration:none; font-weight:600;">support</a>.
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `Welcome to ${shopSettings.shopName}!`,
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};

/**
 * Account Verified Email Template (User)
 * Sent when user successfully verifies their email
 */
export const accountVerified = (
  vars: AccountVerifiedVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const bodyContent = `
    <!-- Verified badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:8px 16px; background-color:#10B981; border-radius:20px;">
          <span style="font-size:13px; font-weight:600; line-height:16px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">✓ Verified</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Email Verified Successfully!
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      Hi <strong>${vars.userName}</strong>, your email has been verified! You now have full access to all features.
    </p>
    
    <!-- Success Checkmark -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 24px; width:80px; height:80px;">
      <tr>
        <td style="background-color:${c.primary}20; border-radius:50%; text-align:center; vertical-align:middle;">
          <span style="font-size:48px; line-height:80px;">✓</span>
        </td>
      </tr>
    </table>
    
    <!-- What's Next -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 12px; font-size:16px; font-weight:600; line-height:24px; color:${c.foreground};">
            What's Next?
          </p>
          <ul style="margin:0; padding-left:20px; font-size:14px; line-height:24px; color:${c.mutedForeground};">
            <li>Complete your profile for a personalized experience</li>
            <li>Start shopping and discover amazing products</li>
            <li>Get exclusive offers and early access to sales</li>
            <li>Track your orders and manage your wishlist</li>
          </ul>
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;">
      <tr>
        <td align="center" style="border-radius:6px; background-color:${c.primary};">
          <a href="${vars.dashboardUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            Start Shopping
          </a>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: "Email Verified Successfully!",
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};

/**
 * Account Suspended Email Template (User)
 * Sent when user account is suspended
 */
export const accountSuspended = (
  vars: AccountSuspendedVars,
  shopSettings: StoreSettings,
): TemplateResult => {
  const c = shopSettings.designColors || DEFAULT_EMAIL_COLORS;

  const bodyContent = `
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Account Suspended
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      Hi <strong>${vars.userName}</strong>, your account has been suspended as of ${vars.suspensionDate}.
    </p>
    
    <!-- Reason Box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.muted}; border-left:4px solid #EF4444;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; line-height:20px; color:${c.foreground};">
            Suspension Reason:
          </p>
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            ${vars.suspensionReason}
          </p>
        </td>
      </tr>
    </table>
    
    <!-- What This Means -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 12px; font-size:16px; font-weight:600; line-height:24px; color:${c.foreground};">
            What This Means
          </p>
          <ul style="margin:0; padding-left:20px; font-size:14px; line-height:24px; color:${c.mutedForeground};">
            <li>You cannot access your account or place orders</li>
            <li>Existing orders may be canceled or put on hold</li>
            <li>Your account data is preserved during suspension</li>
          </ul>
        </td>
      </tr>
    </table>
    
    <!-- Appeal Info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; border-radius:6px; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 12px; font-size:16px; font-weight:600; line-height:24px; color:${c.foreground};">
            Need to Appeal?
          </p>
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            If you believe this suspension was made in error or would like to discuss it, please contact our support team immediately. We're here to help resolve any issues.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0 0;">
            <tr>
              <td align="left" style="border-radius:6px; background-color:${c.primary};">
                <a href="${vars.supportUrl}" target="_blank" style="display:inline-block; padding:12px 24px; font-size:14px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                  Contact Support
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: "Account Suspended - Action Required",
    children: bodyContent,
    logoUrl: shopSettings.logoUrl,
    shopName: shopSettings.shopName,
    shopUrl: shopSettings.shopUrl,
    designColors: c,
  });
};
