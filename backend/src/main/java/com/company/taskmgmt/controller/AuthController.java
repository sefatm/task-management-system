package com.company.taskmgmt.controller;

import com.company.taskmgmt.dto.LoginRequest;
import com.company.taskmgmt.dto.LoginResponse;
import com.company.taskmgmt.dto.UserRequest;
import com.company.taskmgmt.dto.UserResponse;
import com.company.taskmgmt.service.AuthService;
import com.company.taskmgmt.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody UserRequest request) {
        return userService.create(request);
    }
}
