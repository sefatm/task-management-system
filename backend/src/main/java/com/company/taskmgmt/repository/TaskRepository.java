package com.company.taskmgmt.repository;

import com.company.taskmgmt.entity.Task;
import com.company.taskmgmt.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {
    long countByStatus(TaskStatus status);
}
