# authentication Specification

## Purpose
TBD - created by archiving change init-api-database-config. Update Purpose after archive.
## Requirements
### Requirement: Authentication Types

The system MUST define TypeScript types for authentication and authorization.

#### Scenario: User role enum is defined

**Given** user roles exist in the system
**When** TypeScript types are defined
**Then** a UserRole enum exists with ADMIN, TREASURER, VIEWER values
**And** the enum is used throughout the codebase
**And** invalid roles are caught at compile time

#### Scenario: Auth request type is defined

**Given** authenticated requests need user information
**When** Express Request type is extended
**Then** AuthRequest interface extends Express Request
**And** AuthRequest includes user property with AuthUser type
**And** middleware attaches typed user to req.user

---

### Requirement: JWT Token Validation

The system MUST validate Supabase JWT tokens for protected endpoints.

#### Scenario: Valid token grants access

**Given** a user has authenticated with Supabase
**And** the user includes a valid JWT token in Authorization header
**When** they make a request to a protected endpoint
**Then** the token is validated successfully
**And** the user's ID is extracted from the token
**And** the request proceeds to the route handler

#### Scenario: Missing token is rejected

**Given** a request is made to a protected endpoint
**And** no Authorization header is provided
**When** the authentication middleware runs
**Then** the response status is 401
**And** the error message indicates missing authentication token

#### Scenario: Invalid token is rejected

**Given** a request includes an invalid or expired JWT token
**When** the authentication middleware validates the token
**Then** the response status is 401
**And** the error message indicates invalid token

#### Scenario: Malformed Authorization header is rejected

**Given** the Authorization header is not in "Bearer <token>" format
**When** the authentication middleware parses the header
**Then** the response status is 401
**And** the error message indicates malformed authorization header

---

### Requirement: User Role Extraction

The system MUST extract and validate user roles for authorization.

#### Scenario: User role is retrieved from profile

**Given** a valid JWT token is provided
**When** the authentication middleware processes the request
**Then** the user's profile is queried from user_profiles table
**And** the user's role is attached to the request object
**And** the role is available to downstream middleware and handlers

#### Scenario: User without profile is rejected

**Given** a valid JWT token for a user without a profile
**When** the authentication middleware queries the profile
**Then** the response status is 403
**And** the error message indicates incomplete user setup

#### Scenario: Inactive user is rejected

**Given** a valid JWT token for a user with is_active = false
**When** the authentication middleware checks the profile
**Then** the response status is 403
**And** the error message indicates account is disabled

---

### Requirement: Role-Based Authorization

The system MUST enforce role-based access control for endpoints.

#### Scenario: Admin-only endpoint authorization

**Given** an endpoint requires admin role
**And** a user with role "admin" makes a request
**When** the authorization middleware checks the role
**Then** the request proceeds to the handler
**Given** a user with role "treasurer" or "viewer" makes a request
**Then** the response status is 403
**And** the error message indicates insufficient permissions

#### Scenario: Admin or treasurer authorization

**Given** an endpoint requires admin or treasurer role
**And** a user with role "admin" or "treasurer" makes a request
**When** the authorization middleware checks the role
**Then** the request proceeds to the handler
**Given** a user with role "viewer" makes a request
**Then** the response status is 403
**And** the error message indicates insufficient permissions

#### Scenario: Authenticated user access

**Given** an endpoint requires any authenticated user
**And** a user provides a valid token with any role
**When** the authorization middleware runs
**Then** the request proceeds regardless of role

---

### Requirement: Request Context Enhancement

The system MUST attach user information to request context for use in handlers.

#### Scenario: User context is available in handlers

**Given** a user is authenticated
**When** a request reaches a route handler
**Then** req.user contains the user's ID
**And** req.user contains the user's role
**And** req.user contains the user's full_name
**And** handlers can access this information without additional queries

---

### Requirement: Public Endpoint Handling

The system MUST allow certain endpoints to be accessible without authentication.

#### Scenario: Health check is public

**Given** the /api/health endpoint
**When** a request is made without authentication
**Then** the request succeeds
**And** no authentication middleware is applied

#### Scenario: Public routes are clearly identified

**Given** route definitions exist
**When** authentication middleware is configured
**Then** public routes are explicitly excluded from authentication requirements
**And** all other routes require authentication by default

---

### Requirement: Token Refresh Support

The system MUST support token refresh for long-lived sessions.

#### Scenario: Expired token with valid refresh token

**Given** an access token has expired
**And** the client provides a valid refresh token
**When** a refresh request is made
**Then** Supabase issues a new access token
**And** the new token is returned to the client

#### Scenario: Invalid refresh token is rejected

**Given** a refresh token is invalid or expired
**When** a refresh request is made
**Then** the response status is 401
**And** the user must re-authenticate

---

### Requirement: CORS Configuration for Authentication

The system MUST properly configure CORS to allow authentication from frontend.

#### Scenario: CORS headers allow credentials

**Given** the frontend is hosted on a different origin
**When** an authenticated request is made
**Then** CORS headers include Access-Control-Allow-Credentials: true
**And** CORS headers include the configured origin
**And** preflight OPTIONS requests are handled correctly

---

### Requirement: Error Handling for Authentication Failures

The system MUST provide clear error messages for authentication failures.

#### Scenario: Clear error for expired token

**Given** a token has expired
**When** validation fails
**Then** the error message clearly states "Token expired"
**And** the response includes error code "TOKEN_EXPIRED"

#### Scenario: Clear error for invalid token signature

**Given** a token has invalid signature
**When** validation fails
**Then** the error message clearly states "Invalid token signature"
**And** the response includes error code "INVALID_TOKEN"

#### Scenario: Clear error for insufficient permissions

**Given** a user lacks required role
**When** authorization fails
**Then** the error message states "Insufficient permissions for this action"
**And** the response includes error code "FORBIDDEN"
**And** the response includes required role information

---

### Requirement: Supabase Auth Integration

The system MUST properly integrate with Supabase Auth service.

#### Scenario: Supabase client verifies tokens

**Given** a JWT token is received
**When** the authentication middleware validates it
**Then** the Supabase client's getUser() method is called
**And** the token is verified against Supabase's public key
**And** the verification includes expiration check

#### Scenario: Service role key for admin operations

**Given** server-side admin operations need to bypass RLS
**When** initializing Supabase clients
**Then** a separate client with SUPABASE_SERVICE_ROLE_KEY is created
**And** this client is only used for trusted server operations
**And** it is never exposed to client requests

---

### Requirement: Security Headers

The system MUST include security headers in all authenticated responses.

#### Scenario: Security headers are present

**Given** any authenticated request
**When** a response is sent
**Then** headers include X-Content-Type-Options: nosniff
**And** headers include X-Frame-Options: DENY
**And** headers include X-XSS-Protection: 1; mode=block
**And** headers include Strict-Transport-Security in production

---

### Requirement: Rate Limiting for Authentication

The system MUST implement rate limiting to prevent brute force attacks.

#### Scenario: Rate limit on authentication endpoints

**Given** rate limiting is configured
**When** more than MAX_REQUESTS authentication attempts occur from same IP within WINDOW
**Then** subsequent requests receive 429 status
**And** the response includes Retry-After header
**And** the error message indicates rate limit exceeded

#### Scenario: Successful requests reset counter

**Given** a user successfully authenticates
**When** the rate limit counter is checked
**Then** the counter is reset for that user/IP combination

