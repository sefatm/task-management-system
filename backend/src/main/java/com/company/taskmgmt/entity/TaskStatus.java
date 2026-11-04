package com.company.taskmgmt.entity;

/** Order matters: status may only move forward PENDING -> IN_PROGRESS -> DONE. */
public enum TaskStatus { PENDING, IN_PROGRESS, DONE }
