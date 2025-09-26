# Digital Pavti Pustak - Spring Boot Backend

A secure Spring Boot backend with JWT authentication and role-based access control for the Digital Pavti Pustak project.

## Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin and User roles with different permissions
- **Password Encryption**: BCrypt password hashing
- **Database Integration**: H2 (development) and MySQL (production) support
- **CORS Configuration**: Ready for React Native frontend integration
- **RESTful APIs**: Clean REST endpoints for authentication and user management

## Technology Stack

- **Spring Boot 3.5.6**
- **Spring Security 6**
- **Spring Data JPA**
- **JWT (JSON Web Tokens)**
- **H2 Database** (development)
- **MySQL** (production)
- **Lombok**
- **Maven**

## Quick Start

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL (for production)

### Running the Application

1. **Clone and navigate to server directory**
   ```bash
   cd server
   ```

2. **Run with Maven**
   ```bash
   ./mvnw spring-boot:run
   ```

3. **Access the application**
   - API Base URL: `http://localhost:8080/api`
   - H2 Console: `http://localhost:8080/h2-console`

## Default Users

The application creates default users on startup:

| Username | Password | Role | Redirect To |
|----------|----------|------|-------------|
| admin | admin123 | ADMIN | HomePage |
| user | user123 | USER | DonationsPage |
| demo_admin | demo123 | ADMIN | HomePage |
| demo_user | demo123 | USER | DonationsPage |

## API Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "admin",
  "role": "ADMIN",
  "redirectTo": "HomePage",
  "message": "Login successful",
  "success": true
}
```

#### Validate Token
```http
POST /api/auth/validate
Authorization: Bearer <token>
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/auth/logout
```

### Health Check

#### Health Status
```http
GET /api/health
```

#### Application Info
```http
GET /api/info
```

### Admin Endpoints

#### Get All Users (Admin Only)
```http
GET /api/auth/users
Authorization: Bearer <admin-token>
```

## Role-Based Routing

The backend provides role-based routing information:

- **ADMIN users** → Redirected to `HomePage`
- **USER users** → Redirected to `DonationsPage`

## Database Configuration

### Development (H2)
```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.username=sa
spring.datasource.password=password
```

### Production (MySQL)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/digital_pavti_pustak
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## Security Configuration

- **JWT Secret**: Configurable via `app.jwt.secret`
- **Token Expiration**: 24 hours (configurable via `app.jwt.expiration`)
- **Password Encoding**: BCrypt with default strength
- **CORS**: Configured for React Native frontend

## Testing

Run tests with:
```bash
./mvnw test
```

## Integration with React Native

The backend is configured to work with React Native frontends:

1. **CORS enabled** for cross-origin requests
2. **JWT tokens** for stateless authentication
3. **Role-based responses** for navigation routing
4. **Standardized error responses**

### Example React Native Integration

```javascript
// Login function
const login = async (username, password) => {
  const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token
    await AsyncStorage.setItem('token', data.token);
    
    // Navigate based on role
    if (data.role === 'ADMIN') {
      navigation.navigate('HomePage');
    } else {
      navigation.navigate('DonationsPage');
    }
  }
};
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `app.jwt.secret` | JWT signing secret | mySecretKey |
| `app.jwt.expiration` | Token expiration (ms) | 86400000 |
| `server.port` | Server port | 8080 |

## Production Deployment

1. **Update database configuration** in `application.properties`
2. **Set secure JWT secret**
3. **Configure proper CORS origins**
4. **Enable HTTPS**
5. **Set up proper logging**

## Troubleshooting

### Common Issues

1. **Port already in use**: Change `server.port` in application.properties
2. **Database connection**: Verify database credentials and connectivity
3. **JWT errors**: Check token format and expiration
4. **CORS issues**: Verify frontend URL in CORS configuration

### Logs

Enable debug logging:
```properties
logging.level.com.app.server=DEBUG
logging.level.org.springframework.security=DEBUG
```

## Contributing

1. Follow Spring Boot best practices
2. Add tests for new features
3. Update documentation
4. Use proper error handling
