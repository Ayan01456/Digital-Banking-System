# banking-ui

React frontend for the VaultX banking microservices.

## Setup

```bash
cd banking-ui
npm install
npm start
```

App runs on http://localhost:3000

## Services it connects to

| Service        | Port |
|----------------|------|
| auth-service   | 8080 |
| account-service| 8081 |

## Pages

| Route        | Description                        |
|--------------|------------------------------------|
| /login       | Login with username + password     |
| /register    | Register new user account          |
| /dashboard   | Protected — requires JWT token     |

## Notes

- JWT token is stored in localStorage after login
- ProtectedRoute blocks /dashboard if no token is present
- account-service UI will be added to Dashboard.jsx in the next phase
