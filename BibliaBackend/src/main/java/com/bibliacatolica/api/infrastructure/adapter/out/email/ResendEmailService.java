package com.bibliacatolica.api.infrastructure.adapter.out.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Servicio de email usando la API REST de Resend.
 * Documentación: https://resend.com/docs/api-reference/emails/send-email
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResendEmailService {

    @Value("${resend.api-key}")
    private String apiKey;

    @Value("${resend.from-email}")
    private String fromEmail;

    @Value("${resend.from-name}")
    private String fromName;

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    private final RestTemplate restTemplate;

    /**
     * Envía el email de recuperación de contraseña con el código de 6 dígitos.
     */
    public void sendPasswordResetEmail(String toEmail, String userName, String code) {
        String subject = "Your CatholicVerse password reset code";
        String html = buildPasswordResetHtml(userName, code);
        sendEmail(toEmail, subject, html);
    }

    /**
     * Envía el email de bienvenida al registrarse.
     */
    public void sendWelcomeEmail(String toEmail, String userName) {
        String subject = "Welcome to CatholicVerse ✝";
        String html = buildWelcomeHtml(userName);
        sendEmail(toEmail, subject, html);
    }

    private void sendEmail(String to, String subject, String html) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = Map.of(
                    "from", fromName + " <" + fromEmail + ">",
                    "to", new String[] { to },
                    "subject", subject,
                    "html", html);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            restTemplate.postForObject(RESEND_API_URL, request, Map.class);

            log.info("📧 Email enviado correctamente a: {}", to);
        } catch (Exception e) {
            log.error("❌ Error enviando email a {}: {}", to, e.getMessage());
            // No relanzamos la excepción para no bloquear el flujo principal
        }
    }

    // ===== HTML TEMPLATES =====

    private String buildPasswordResetHtml(String userName, String code) {
        String name = (userName != null && !userName.isBlank()) ? userName : "there";
        return """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8"/>
                  <style>
                    body { font-family: Georgia, serif; background: #faf9f6; color: #1f2937; margin: 0; padding: 0; }
                    .container { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
                    .header { background: #1a160d; padding: 32px; text-align: center; }
                    .header img { width: 56px; border-radius: 12px; }
                    .header h1 { color: #d4af37; font-size: 22px; margin: 12px 0 0; letter-spacing: 1px; }
                    .body { padding: 40px 40px 32px; }
                    .body p { font-size: 16px; line-height: 1.7; color: #374151; margin-bottom: 20px; }
                    .code-box { background: #f4f1ea; border: 2px solid #d4af37; border-radius: 12px; text-align: center; padding: 24px; margin: 28px 0; }
                    .code { font-size: 42px; font-weight: bold; letter-spacing: 12px; color: #1a160d; font-family: 'Courier New', monospace; }
                    .note { font-size: 13px; color: #9ca3af; text-align: center; }
                    .footer { background: #f4f1ea; padding: 24px; text-align: center; font-size: 12px; color: #9ca3af; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>CatholicVerse</h1>
                    </div>
                    <div class="body">
                      <p>Hi %s,</p>
                      <p>We received a request to reset your password. Use the code below in the app to continue:</p>
                      <div class="code-box">
                        <div class="code">%s</div>
                      </div>
                      <p class="note">This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
                    </div>
                    <div class="footer">
                      © 2025 CatholicVerse · <a href="https://getcatholicverse.com" style="color:#d4af37;">getcatholicverse.com</a>
                    </div>
                  </div>
                </body>
                </html>
                """
                .formatted(name, code);
    }

    private String buildWelcomeHtml(String userName) {
        String name = (userName != null && !userName.isBlank()) ? userName : "there";
        return """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8"/>
                  <style>
                    body { font-family: Georgia, serif; background: #faf9f6; color: #1f2937; margin: 0; padding: 0; }
                    .container { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
                    .header { background: #1a160d; padding: 40px 32px; text-align: center; }
                    .header h1 { color: #d4af37; font-size: 26px; margin: 0; letter-spacing: 1px; }
                    .header p { color: rgba(255,255,255,0.5); font-size: 14px; margin: 8px 0 0; }
                    .body { padding: 40px; }
                    .body p { font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 16px; }
                    .highlight { color: #d4af37; font-weight: bold; }
                    .cta { display: block; background: #d4af37; color: #1a160d; text-align: center; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-size: 16px; font-weight: bold; margin: 32px auto; width: fit-content; }
                    .footer { background: #f4f1ea; padding: 24px; text-align: center; font-size: 12px; color: #9ca3af; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>✝ CatholicVerse</h1>
                      <p>Your Catholic Bible, always at hand.</p>
                    </div>
                    <div class="body">
                      <p>Hi %s,</p>
                      <p>Welcome to <span class="highlight">CatholicVerse</span>. We're glad you're here.</p>
                      <p>Your <span class="highlight">7-day free trial</span> has started. Enjoy full access to daily readings, the complete Catholic Bible, and all premium features — no commitment required.</p>
                      <p>Open the app anytime to begin your reading.</p>
                      <p style="margin-top: 32px; color: #9ca3af; font-size: 14px;">God bless,<br/>The CatholicVerse Team</p>
                    </div>
                    <div class="footer">
                      © 2025 CatholicVerse · <a href="https://getcatholicverse.com" style="color:#d4af37;">getcatholicverse.com</a>
                      · <a href="https://getcatholicverse.com/privacy.html" style="color:#9ca3af;">Privacy</a>
                    </div>
                  </div>
                </body>
                </html>
                """
                .formatted(name);
    }
}
