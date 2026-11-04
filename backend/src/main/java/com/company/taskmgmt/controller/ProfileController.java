package com.company.taskmgmt.controller;

import com.company.taskmgmt.dto.ChangePasswordRequest;
import com.company.taskmgmt.dto.ProfileUpdateRequest;
import com.company.taskmgmt.dto.UserResponse;
import com.company.taskmgmt.entity.User;
import com.company.taskmgmt.exception.BadRequestException;
import com.company.taskmgmt.repository.UserRepository;
import com.company.taskmgmt.service.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@PreAuthorize("isAuthenticated()")
public class ProfileController {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileController(CurrentUserService currentUserService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public UserResponse getProfile() {
        return UserResponse.from(currentUserService.get());
    }

    @PutMapping
    public UserResponse updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        User user = currentUserService.get();
        user.setFullName(request.fullName().trim());
        return UserResponse.from(userRepository.save(user));
    }

    @PutMapping("/password")
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User user = currentUserService.get();
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }
}
