package auth_service.controller;

import auth_service.dto.LoginRequest;
import auth_service.dto.RegisterRequest;
import auth_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import auth_service.entity.User; 
import auth_service.repository.UserRepository;
import auth_service.security.JwtUtils;
//import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/auth") // This sets the base URL
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    // This creates a "POST" endpoint at /api/auth/register
    @PostMapping("/register")
public String register(@RequestBody RegisterRequest registerRequest) {
    return authService.registerUser(registerRequest);
}

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest loginRequest) {
        return authService.loginUser(loginRequest);
    }

    @GetMapping("/user/{id}")
public ResponseEntity<?> getUserById(@PathVariable Long id) {
    // This calls a method in your AuthService to find the user in the DB
    return ResponseEntity.ok(authService.getUserById(id));
}
@Autowired
private UserRepository userRepository; // Now you can use findByUsername!

@GetMapping("/user/name/{username}")
public ResponseEntity<User> getUserByName(@PathVariable String username) {
    return userRepository.findByUsername(username)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

@Autowired
private JwtUtils jwtUtil; // Make sure you have your JwtUtil class

@GetMapping("/validate")
public String getSubjectFromToken(@RequestParam("token") String token) {
    // This uses your existing JwtUtil to extract the username from the string
    return jwtUtil.getUsernameFromToken(token); 
}
}