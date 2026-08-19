# MavunoOne security hardening notes

## Reference guidance

- OWASP Session Management Cheat Sheet: use secure cookie properties, strong unpredictable session identifiers, server-side session validation, and idle plus absolute timeouts. https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- OWASP Application Security Verification Standard 5.0: use a verifiable requirements baseline for authentication, access control, input validation, injection prevention, and secure configuration. https://owasp.org/www-project-application-security-verification-standard/
- NIST SP 800-63B is superseded by SP 800-63-4 as of 2025-08-01; the NIST identity guidance remains a useful reference for authentication and reauthentication policy. https://pages.nist.gov/800-63-3/sp800-63b.html

## MavunoOne policy decisions

- Session policy: 30-minute idle timeout and 8-hour absolute timeout, enforced server-side through the signed HttpOnly cookie and `/api/auth/session` verification.
- Role policy: public users cannot access Boss or Office data; Boss and staff roles are checked in middleware and server procedures.
- Input policy: allowlisted enums, numeric bounds, string length limits, email and phone normalization, and database transactions for sensitive writes.
- Secret policy: no development fallback secret or hardcoded provider credential is allowed in production.
- Monitoring policy: authentication failures, administrative changes, and technical issues must be auditable; public error responses should avoid internal detail.
- Deployment policy: validate lint/build, confirm required Render environment variables, run expired-session and unauthorized-route tests after each security deployment.
