package com.chatmate.controller;

import com.chatmate.entity.User;
import com.chatmate.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ================================
    // REGISTER
    // ================================

    @PostMapping("/register")
    public String register(@RequestBody User user) {

        try {

            if (userRepository
                    .findByEmail(user.getEmail())
                    .isPresent()) {

                return "Email already registered!";
            }

            user.setPassword(
                    passwordEncoder.encode(
                            user.getPassword()
                    )
            );

            userRepository.save(user);

            return "Registration successful!";

        } catch (Exception e) {

            e.printStackTrace();

            return "Registration failed!";
        }
    }


    // ================================
    // LOGIN
    // ================================

    @PostMapping("/login")
    public User login(@RequestBody User user) {

        try {

            var existingUser =
                    userRepository.findByEmail(
                            user.getEmail()
                    );

            if (existingUser.isEmpty()) {
                return null;
            }

            User dbUser = existingUser.get();

            if (!passwordEncoder.matches(
                    user.getPassword(),
                    dbUser.getPassword()
            )) {

                return null;
            }

            // IMPORTANT:
            // Never send password/hash to frontend
            dbUser.setPassword(null);

            return dbUser;

        } catch (Exception e) {

            e.printStackTrace();

            return null;
        }
    }
}