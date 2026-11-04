package com.company.taskmgmt.dto;

import com.company.taskmgmt.entity.Role;
import com.company.taskmgmt.entity.User;

import java.time.LocalDateTime;

public record UserResponse(Long id, String fullName, String email, Role role,
                           Long managerId, String managerName, boolean active, LocalDateTime createdAt) {

    public static UserResponse from(User u) {
        User m = u.getManager();
        return new UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getRole(),
                m == null ? null : m.getId(), m == null ? null : m.getFullName(),
                u.isActive(), u.getCreatedAt());
    }
}
