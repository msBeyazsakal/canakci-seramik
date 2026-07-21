# Security Audit Report - canakci-seramik

## Summary of Findings

| Vulnerability Type | Severity | Description |
| :--- | :--- | :--- |
| **Broken Access Control (IDOR)** | **High** | Several API routes lack proper ownership checks, allowing an authenticated user to access or modify resources belonging to others if they know the ID. |
| **Insecure File Upload (Potential Path Traversal/Type Bypass)** | **Medium** | While file extensions and sizes are checked, the uploaded files are stored in a predictable directory using `Date.now()` and `Math/random()`, which could lead to resource exhaustion or overwriting if not carefully managed. The validation also relies solely on extension rather than inspecting file content (magic bytes). |
| **Sensitive Data Exposure** | **Low** | Error logs (`console.error`) in API routes may leak internal system details (e.g., database error messages) to the client in some environments. |

---

## Detailed Findings

### 1. Broken Access Control / Insecure Direct Object Reference (IDOR)
* **Description:** Multiple API routes for updating or deleting resources (such as `orders`, `products`, and `users`) check if the requester is an `ADMIN` but do not verify if the action is appropriate for a specific user's scope. For example, in `src/app/api/orders/[id]/route.ts`, any user with the `ADMIN` role can update or delete *any* order by simply providing its ID. While this might be intended for a global admin, it lacks granular permission checks (e.g., an admin of one site should not necessarily manage orders of another if the system scales).
* **More Critical:** In routes where a user might expect to only see their *own* data (like `profile` or `orders` in a user-specific context), there is a risk that if the role check is bypassed or misconfigured, one user could access another's information.
* **Potential Impact:** Unauthorized modification or deletion of critical business data (orders, products, users).
* **Suggested Fix:** Implement fine-grained authorization checks. For resources owned by users (like orders), ensure the `auth()` session `user.id` matches the `userId` associated with the resource being accessed/modified.

### 2. Insecure File Upload (Validation Weakness)
* **Location:** `src/app/api/upload/route.ts` and `src/lib/security.ts`
* **Description:** The `validateFile` function in `src/lib/security.ts` only checks the file extension (`.jpg`, `.png`, etc.). It does not verify the actual content of the file (MIME type or Magic Bytes). An attacker could rename a malicious script to `malicious.png` and bypass this check. Additionally, while it uses `Date.now()` for filenames, the storage is in `public/uploads/receipts`.
* **Potential Impact:** Execution of arbitrary code if the server-side environment or a downstream process (like an image processor) is vulnerable to processing malformed images; potential for storage exhaustion.
* **Suggested Fix:** 
    1.  Use a library to validate the actual file content by inspecting magic bytes (the `MAGIC_BYTES` object in `security.ts` is defined but **not actually used** in the validation logic).
    2.  Ensure that the uploaded files are served with strict `Content-Type` and `Content-Disposition: attachment` headers to prevent XSS via SVG or other formats.

### 3. Sensitive Data Exposure (Error Handling)
* **Location:** Various API routes (e.g., `src/app/api/users/route.ts`, `src/app/api/orders/[id]/route.ts`)
* **Description:** The application uses `console.error(error)` and returns generic error messages to the client, which is good. However, in some catch blocks, if a developer were to return `error.message` directly to the client (though not explicitly seen in all routes yet), it could leak database schema details or internal logic.
* **Potential Impact:** Information leakage that aids an attacker in footprinting the system architecture.
* **Suggested Fix:** Always use custom, sanitized error messages for API responses and keep detailed error logs strictly on the server-side (e.g., using a logging service like Sentry).

---

## Positive Findings (Strengths)
* **SQL Injection Protection:** The project uses **Prisma ORM**, which uses parameterized queries by default. I found no instances of `prisma.$queryRaw` being used with unsanitized user input, significantly reducing the risk of SQL injection.
* **Authentication Implementation:** The use of `NextAuth.js` with `CredentialsProvider` and `bcrypt-ts` for password hashing is a secure industry standard.
* **Rate Limiting:** There is evidence of rate limiting being implemented in the authentication flow (`src/lib/auth.ts`), which helps protect against brute-force attacks.
* **XSS Protection:** The `escapeHtml` and `sanitizeText` functions in `src/lib/security.ts` provide a good baseline for preventing Cross-Site Scripting when rendering user-provided text.

## Final Recommendation
The most urgent area for improvement is **Authorization**. Ensure that every API route that modifies data performs an ownership check (e.g., `where: { id, userId: session.user.id }`) in addition to the role-based access control.
