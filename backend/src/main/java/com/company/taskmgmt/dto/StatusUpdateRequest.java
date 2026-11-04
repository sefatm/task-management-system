package com.company.taskmgmt.dto;

import com.company.taskmgmt.entity.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(@NotNull TaskStatus status) {}
