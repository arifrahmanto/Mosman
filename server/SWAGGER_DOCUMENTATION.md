# Swagger/OpenAPI Documentation

The Mosman API includes comprehensive interactive documentation using Swagger UI and OpenAPI 3.0 specification.

## Accessing the Documentation

**URL**: `http://localhost:3000/api/docs`

Simply start your server and navigate to this URL in your browser to access the interactive API documentation.

## Features

### 📖 Complete API Reference
- All endpoints documented with descriptions
- Request/response schemas
- Parameter descriptions
- HTTP status codes and error responses

### 🧪 Interactive Testing
- "Try it out" feature for every endpoint
- Test API calls directly from the browser
- See real request/response examples
- No need for external tools like Postman

### 🔐 Authentication Support
- Built-in authentication interface
- Click "Authorize" button to add your Bearer token
- Token persists across all requests
- Easy to switch between different users

### 📝 Request Examples
- Pre-filled example values for all fields
- Valid UUIDs for pocket_id and category_id
- Proper date formats
- Realistic sample data

### 📋 Schema Definitions
- Complete data models documented
- Field types, formats, and constraints
- Required vs optional fields
- Enum values for choice fields

## How to Use Swagger UI

### Step 1: Start the Server

```bash
npm run dev
```

### Step 2: Open Swagger UI

Navigate to: `http://localhost:3000/api/docs`

### Step 3: Authenticate (for protected endpoints)

1. Click the **"Authorize"** button (green lock icon at the top)
2. Enter your Bearer token in the format: `your-jwt-token-here`
3. Click **"Authorize"** then **"Close"**
4. Your token is now applied to all requests

### Step 4: Try an Endpoint

1. Click on any endpoint (e.g., `GET /v1/donations`)
2. Click **"Try it out"**
3. Fill in any parameters (or use the examples)
4. Click **"Execute"**
5. See the response below

## Getting a JWT Token

To test authenticated endpoints, you need a JWT token from Supabase:

### Option 1: Via Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Click on a user
3. Copy the JWT token from the user details

### Option 2: Via Supabase Auth API

```bash
curl -X POST 'https://your-project.supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your-password"
  }'
```

The response will include an `access_token` field.

### Option 3: Via Frontend Login

If you have a frontend, use the Supabase client:

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'your-password'
})

const token = data.session.access_token
```

## Documented Endpoints

### Health & Info
- `GET /health` - Health check
- `GET /v1` - API information

### Donations (All documented)
- `GET /v1/donations` - List donations
- `GET /v1/donations/{id}` - Get donation by ID
- `POST /v1/donations` - Create donation
- `PUT /v1/donations/{id}` - Update donation (coming soon)
- `DELETE /v1/donations/{id}` - Delete donation (coming soon)

### Expenses (Similar structure)
- All CRUD operations documented

### Pockets
- All pocket-related endpoints documented

### Categories
- Donation and expense category endpoints documented

## Extending the Documentation

To add documentation for a new endpoint, use JSDoc comments with OpenAPI annotations:

```typescript
/**
 * @openapi
 * /v1/your-endpoint:
 *   get:
 *     summary: Endpoint summary
 *     description: Detailed description
 *     tags: [YourTag]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: param1
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YourSchema'
 */
router.get('/your-endpoint', yourController.yourMethod);
```

## Swagger Configuration

The Swagger configuration is located in:
- **Config**: `src/config/swagger.ts`
- **Route Mounting**: `src/routes/index.ts`

### Key Configuration Options

```typescript
{
  openapi: '3.0.0',
  servers: [
    { url: 'http://localhost:3000/api', description: 'Development' },
    { url: 'https://api.mosman.app/api', description: 'Production' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer' }
    },
    schemas: { /* All data models */ },
    responses: { /* Reusable error responses */ },
    parameters: { /* Reusable query parameters */ }
  }
}
```

## Custom Swagger UI Options

The Swagger UI is configured with:
- Custom site title: "Mosman API Documentation"
- Hidden top bar (cleaner interface)
- Full request/response bodies shown
- Persistent authorization

## Benefits

### For Developers
- **Faster Development**: Test endpoints without writing test scripts
- **Clear Contracts**: See exactly what each endpoint expects and returns
- **Easy Debugging**: Inspect full request/response cycles
- **Up-to-Date Docs**: Documentation lives with the code

### For Frontend Developers
- **API Discovery**: Browse all available endpoints
- **Type Information**: Know exact data structures
- **Test Integration**: Verify endpoints before coding
- **Authentication Flow**: Understand how auth works

### For API Consumers
- **Self-Service**: Explore and test the API independently
- **Examples**: See working examples for every endpoint
- **Error Handling**: Understand error codes and responses

## Production Deployment

For production, you may want to:

1. **Protect the docs endpoint** (optional):
```typescript
// Only allow in development
if (env.NODE_ENV === 'development') {
  router.use('/docs', swaggerUi.serve);
  router.get('/docs', swaggerUi.setup(swaggerSpec));
}
```

2. **Generate static OpenAPI spec**:
```bash
# Save spec to file
node -e "console.log(JSON.stringify(require('./src/config/swagger').swaggerSpec, null, 2))" > openapi.json
```

3. **Use external Swagger UI** hosting for production

## Troubleshooting

### Swagger UI not loading

**Problem**: Blank page at `/api/docs`

**Solution**:
- Check server is running
- Check console for errors
- Verify `swagger-ui-express` is installed
- Check route is mounted correctly

### Endpoints not showing

**Problem**: Some endpoints missing in Swagger UI

**Solution**:
- Ensure JSDoc comments use `@openapi` tag
- Check file path in `apis` config matches route files
- Restart server to reload annotations

### Authentication not working

**Problem**: Getting 401 errors even after authorizing

**Solution**:
- Verify token format is correct (no "Bearer" prefix in authorize dialog)
- Check token hasn't expired
- Ensure user exists in user_profiles table with active status
- Verify SUPABASE_ANON_KEY is correct in .env

## Resources

- **OpenAPI Specification**: https://swagger.io/specification/
- **Swagger UI**: https://swagger.io/tools/swagger-ui/
- **swagger-jsdoc**: https://github.com/Surnet/swagger-jsdoc
- **Examples**: See `src/routes/donations.ts` for annotated examples

## Next Steps

1. ✅ Browse the documentation at `http://localhost:3000/api/docs`
2. ✅ Add your JWT token via "Authorize" button
3. ✅ Try out the health check endpoint
4. ✅ Test creating a donation
5. ✅ Explore other endpoints
