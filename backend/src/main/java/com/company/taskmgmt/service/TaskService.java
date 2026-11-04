package com.company.taskmgmt.service;

import com.company.taskmgmt.dto.TaskRequest;
import com.company.taskmgmt.dto.TaskResponse;
import com.company.taskmgmt.dto.UserResponse;
import com.company.taskmgmt.entity.*;
import com.company.taskmgmt.exception.BadRequestException;
import com.company.taskmgmt.exception.ResourceNotFoundException;
import com.company.taskmgmt.repository.TaskRepository;
import com.company.taskmgmt.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/** All task business rules + row-level security (who may see / change which task). */
@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUser;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository, CurrentUserService currentUser) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.currentUser = currentUser;
    }

    public TaskResponse create(TaskRequest r) {
        User me = currentUser.get();
        Task t = new Task();
        t.setAssignedBy(me);
        apply(t, r, me);
        return TaskResponse.from(taskRepository.save(t));
    }

    public TaskResponse update(Long id, TaskRequest r) {
        User me = currentUser.get();
        Task t = find(id);
        if (me.getRole() == Role.MANAGER && !t.getAssignedBy().getId().equals(me.getId())) {
            throw new AccessDeniedException("Not your task");
        }
        apply(t, r, me);
        return TaskResponse.from(t);
    }

    /** EMPLOYEE only, own task only, forward-only: PENDING -> IN_PROGRESS -> DONE. */
    public TaskResponse updateStatus(Long id, TaskStatus next) {
        User me = currentUser.get();
        Task t = find(id);
        if (!t.getAssignedTo().getId().equals(me.getId())) {
            throw new AccessDeniedException("Not your task");
        }
        if (next.ordinal() != t.getStatus().ordinal() + 1) {
            throw new BadRequestException("Status can only move PENDING -> IN_PROGRESS -> DONE");
        }
        t.setStatus(next);
        return TaskResponse.from(t);
    }

    public void delete(Long id) {
        taskRepository.delete(find(id));
    }

    @Transactional(readOnly = true)
    public TaskResponse get(Long id) {
        User me = currentUser.get();
        Task t = find(id);
        boolean allowed = switch (me.getRole()) {
            case ADMIN -> true;
            case MANAGER -> t.getAssignedBy().getId().equals(me.getId());
            case EMPLOYEE -> t.getAssignedTo().getId().equals(me.getId());
        };
        if (!allowed) throw new AccessDeniedException("Not your task");
        return TaskResponse.from(t);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> list(TaskStatus status, Priority priority, Long assigneeId) {
        return visibleTasks(status, priority, assigneeId).stream().map(TaskResponse::from).toList();
    }

    /** Role-filtered query used by the list, dashboard and PDF report. F-08 filters are optional. */
    @Transactional(readOnly = true)
    public List<Task> visibleTasks(TaskStatus status, Priority priority, Long assigneeId) {
        User me = currentUser.get();
        Specification<Task> spec = (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();
            if (status != null) p.add(cb.equal(root.get("status"), status));
            if (priority != null) p.add(cb.equal(root.get("priority"), priority));
            Long assignee = me.getRole() == Role.EMPLOYEE ? me.getId() : assigneeId;   // employee: only own tasks
            if (assignee != null) p.add(cb.equal(root.get("assignedTo").get("id"), assignee));
            if (me.getRole() == Role.MANAGER) p.add(cb.equal(root.get("assignedBy").get("id"), me.getId()));
            return cb.and(p.toArray(new Predicate[0]));
        };
        return taskRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "id"));
    }

    /** Employees the caller may assign work to: whole company for ADMIN, own team for MANAGER. */
    @Transactional(readOnly = true)
    public List<UserResponse> assignees() {
        User me = currentUser.get();
        List<User> list = me.getRole() == Role.ADMIN
                ? userRepository.findByRoleAndActiveTrueOrderByFullName(Role.EMPLOYEE)
                : userRepository.findByManagerIdAndActiveTrueOrderByFullName(me.getId());
        return list.stream().map(UserResponse::from).toList();
    }

    private void apply(Task t, TaskRequest r, User me) {
        User employee = userRepository.findById(r.assignedTo()).filter(User::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Employee " + r.assignedTo() + " not found"));
        if (employee.getRole() != Role.EMPLOYEE) {
            throw new BadRequestException("Tasks can only be assigned to employees");
        }
        if (me.getRole() == Role.MANAGER
                && (employee.getManager() == null || !employee.getManager().getId().equals(me.getId()))) {
            throw new AccessDeniedException("Employee is not in your team");
        }
        t.setTitle(r.title().trim());
        t.setDescription(r.description());
        t.setDeadline(r.deadline());
        t.setPriority(r.priority());
        t.setAssignedTo(employee);
    }

    private Task find(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task " + id + " not found"));
    }
}
