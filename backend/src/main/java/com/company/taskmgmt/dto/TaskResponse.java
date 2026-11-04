package com.company.taskmgmt.dto;

import com.company.taskmgmt.entity.Priority;
import com.company.taskmgmt.entity.Task;
import com.company.taskmgmt.entity.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(Long id, String title, String description, TaskStatus status, Priority priority,
                           LocalDate deadline, Long assignedToId, String assignedToName,
                           Long assignedById, String assignedByName,
                           LocalDateTime createdAt, LocalDateTime updatedAt) {

    public static TaskResponse from(Task t) {
        return new TaskResponse(t.getId(), t.getTitle(), t.getDescription(), t.getStatus(), t.getPriority(),
                t.getDeadline(),
                t.getAssignedTo().getId(), t.getAssignedTo().getFullName(),
                t.getAssignedBy().getId(), t.getAssignedBy().getFullName(),
                t.getCreatedAt(), t.getUpdatedAt());
    }
}
