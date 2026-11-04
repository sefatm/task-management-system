package com.company.taskmgmt.service;

import com.company.taskmgmt.dto.DashboardStats;
import com.company.taskmgmt.entity.Role;
import com.company.taskmgmt.entity.Task;
import com.company.taskmgmt.entity.TaskStatus;
import com.company.taskmgmt.entity.User;
import com.company.taskmgmt.repository.TaskRepository;
import com.company.taskmgmt.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final TaskService taskService;
    private final CurrentUserService currentUser;

    public DashboardService(UserRepository userRepository, TaskRepository taskRepository, TaskService taskService, CurrentUserService currentUser) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.taskService = taskService;
        this.currentUser = currentUser;
    }

    public DashboardStats stats() {
        User me = currentUser.get();
        Map<String, Long> statusCounts = byStatus(me);
        long totalVisible = statusCounts.values().stream().mapToLong(Long::longValue).sum();
        long doneVisible = statusCounts.getOrDefault(TaskStatus.DONE.name(), 0L);

        return switch (me.getRole()) {
            case ADMIN -> new DashboardStats(
                    userRepository.countByActiveTrue(),
                    taskRepository.count(),
                    taskRepository.countByStatus(TaskStatus.DONE),
                    null,
                    statusCounts);
            case MANAGER -> new DashboardStats(
                    null,
                    totalVisible,
                    doneVisible,
                    userRepository.countByManagerIdAndActiveTrue(me.getId()),
                    statusCounts);
            case EMPLOYEE -> new DashboardStats(
                    null,
                    totalVisible,
                    doneVisible,
                    null,
                    statusCounts);
        };
    }

    /** Counts of the caller's visible tasks, always returning all three statuses (0 when empty). */
    private Map<String, Long> byStatus(User me) {
        Map<String, Long> result = new LinkedHashMap<>();
        if (me.getRole() == Role.ADMIN) {
            for (TaskStatus s : TaskStatus.values()) {
                result.put(s.name(), taskRepository.countByStatus(s));
            }
            return result;
        }
        for (TaskStatus s : TaskStatus.values()) result.put(s.name(), 0L);
        for (Task t : taskService.visibleTasks(null, null, null)) {
            result.merge(t.getStatus().name(), 1L, Long::sum);
        }
        return result;
    }
}
