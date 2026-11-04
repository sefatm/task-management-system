package com.company.taskmgmt.service;

import com.company.taskmgmt.dto.LoginRequest;
import com.company.taskmgmt.dto.LoginResponse;
import com.company.taskmgmt.entity.User;
import com.company.taskmgmt.repository.UserRepository;
import com.company.taskmgmt.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest request) {
        // Throws BadCredentialsException (-> 401) when e-mail/password do not match the BCrypt hash.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = userRepository.findByEmail(request.email()).orElseThrow();
        return new LoginResponse(jwtUtil.generate(user.getEmail(), user.getRole().name()),
                user.getRole().name(), user.getFullName());
    }
}
