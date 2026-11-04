package com.company.taskmgmt.dto;

import com.company.taskmgmt.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record TaskRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 5000) String description,
        LocalDate deadline,
        @NotNull Priority priority,
        @NotNull Long assignedTo) {}
