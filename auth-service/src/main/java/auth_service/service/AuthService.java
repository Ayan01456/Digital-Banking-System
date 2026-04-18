package auth_service.service;

import auth_service.dto.LoginRequest;
import auth_service.dto.RegisterRequest;
import auth_service.entity.User;
import auth_service.entity.Role;
import auth_service.repository.UserRepository;
import auth_service.security.JwtUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder; // Inject the scrambler

    @Autowired
    private JwtUtils jwtUtils;

    public User getUserById(Long id) {
        // This looks into your User table.
        // If the ID doesn't exist, it throws an error.
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public String registerUser(RegisterRequest request) {
        // 1. Validation logic using the DTO
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return "Error: Username is already taken!";
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return "Error: Email is already in use!";
        }

        // 2. Map DTO to Entity (The Security Guard Step)
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setRole(Role.valueOf(request.getRole()));
        // Hash the password from the request
        String hashedPwd = passwordEncoder.encode(request.getPassword());
        user.setPassword(hashedPwd);

        // Set defaults (Hackers can't override these now!)
        user.setBalance(1000.0);
        // user.setRole(Role.USER); // Uncomment if you have the Role enum ready

        userRepository.save(user);
        return "User registered successfully!";
    }

    public String loginUser(LoginRequest loginRequest) {
        // 1. Find the user by username
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());

        // 2. Check if user exists AND password matches
        if (userOpt.isPresent() && passwordEncoder.matches(loginRequest.getPassword(), userOpt.get().getPassword())) {

            // Success: Issue the "Digital Passport"
            return jwtUtils.generateToken(userOpt.get().getUsername());

        }

        // 3. Security best practice: Generic error message
        return "Error: Invalid Username or Password";
    }
}