package com.company.taskmgmt.dto;

import java.util.Map;

/** Fields that do not apply to the caller's role are null. */
public record DashboardStats(Long totalUsers, Long totalTasks, Long completedTasks,
                             Long teamSize, Map<String, Long> tasksByStatus) {}
