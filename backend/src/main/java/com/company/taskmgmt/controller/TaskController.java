package com.company.taskmgmt.controller;

import com.company.taskmgmt.dto.StatusUpdateRequest;
import com.company.taskmgmt.dto.TaskRequest;
import com.company.taskmgmt.dto.TaskResponse;
import com.company.taskmgmt.dto.UserResponse;
import com.company.taskmgmt.entity.Priority;
import com.company.taskmgmt.entity.TaskStatus;
import com.company.taskmgmt.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse create(@Valid @RequestBody TaskRequest request) {
        return taskService.create(request);
    }

    /** Role-filtered: ADMIN = all, MANAGER = assigned by me, EMPLOYEE = assigned to me. */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<TaskResponse> list(@RequestParam(name = "status", required = false) TaskStatus status,
                                   @RequestParam(name = "priority", required = false) Priority priority,
                                   @RequestParam(name = "assigneeId", required = false) Long assigneeId) {
        return taskService.list(status, priority, assigneeId);
    }

    @GetMapping("/assignees")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public List<UserResponse> assignees() {
        return taskService.assignees();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public TaskResponse get(@PathVariable("id") Long id) {
        return taskService.get(id);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public TaskResponse updateStatus(@PathVariable("id") Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return taskService.updateStatus(id, request.status());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public TaskResponse update(@PathVariable("id") Long id, @Valid @RequestBody TaskRequest request) {
        return taskService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") Long id) {
        taskService.delete(id);
    }
}
