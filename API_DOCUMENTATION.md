# API Endpoints Documentation

## Authentication Endpoints (/user)
- `POST /user/register` - Register new user
- `POST /user/login` - Login user
- `POST /user/logout` - Logout user  
- `GET /user/me` - Get current user profile (requires auth)

## Exercise Endpoints (/exercises)
- `GET /exercises` - Get all exercises (requires auth)
- `GET /exercises/:id` - Get specific exercise (requires auth)
- `POST /exercises` - Create new exercise (requires auth)
- `PUT /exercises/:id` - Update exercise (requires auth)
- `DELETE /exercises/:id` - Delete exercise (requires auth)

## Workout Template Endpoints (/templates)
- `GET /templates` - Get all workout templates (requires auth)
- `GET /templates/:id` - Get specific template (requires auth)
- `GET /templates/:id/exercises` - Get exercises for template (requires auth)
- `POST /templates` - Create new workout template (requires auth)
- `PUT /templates/:id` - Update workout template (requires auth)
- `DELETE /templates/:id` - Delete workout template (requires auth)
- `POST /templates/:id/exercises` - Add exercise to template (requires auth)
- `DELETE /templates/:id/exercises/:exerciseId` - Remove exercise from template (requires auth)

## Workout Session Endpoints (/workouts)
- `POST /workouts` - Create new workout session (requires auth)
- `GET /workouts` - Get user's workout sessions (requires auth)
- `GET /workouts/:id` - Get specific workout session (requires auth)
- `GET /workouts/:id/sets` - Get workout session with all sets (requires auth)
- `DELETE /workouts/:id` - Delete workout session (requires auth)

## Set Logging Endpoints (/sets)
- `POST /sets/:sessionId/sets` - Add set to workout session (requires auth)
- `GET /sets/:sessionId/sets` - Get all sets for workout session (requires auth)
- `PUT /sets/:setId` - Update set (requires auth)
- `DELETE /sets/:setId` - Delete set (requires auth)

## Health Check
- `GET /` - Health check endpoint

## Response Format
All successful responses follow this format:
```json
{
  "success": true,
  "data": { ... }
}
```

Error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Authentication
Most endpoints require authentication. Include session cookie in requests.

## Data Validation
- Request bodies are validated for required fields
- Numeric fields are validated for correct format
- String fields are automatically trimmed
- Comprehensive error messages provided