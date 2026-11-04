package com.company.taskmgmt.dto;

import com.company.taskmgmt.entity.Role;
import jakarta.validation.constraints.*;

/** Password is optional on update (blank = keep current), required on create (checked in service). */
public record UserRequest(
        @NotBlank @Size(max = 100) String fullName,
        @NotBlank @Email @Size(max = 150) String email,
        @Size(min = 6, max = 100) String password,
        @NotNull Role role,
        Long managerId) {}
