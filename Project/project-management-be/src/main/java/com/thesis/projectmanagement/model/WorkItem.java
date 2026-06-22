package com.thesis.projectmanagement.model;

import com.thesis.projectmanagement.constants.WorkItemPriority;
import com.thesis.projectmanagement.constants.WorkItemStatus;
import com.thesis.projectmanagement.constants.WorkItemType;
import com.thesis.projectmanagement.constants.WorkItemLocation;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "work_items")
public class WorkItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    @Enumerated(EnumType.STRING)
    private WorkItemStatus status;

    @Enumerated(EnumType.STRING)
    private WorkItemPriority priority;

    @Enumerated(EnumType.STRING)
    private WorkItemType type;
    
    private Integer storyPoints;

    @Enumerated(EnumType.STRING)
    private WorkItemLocation location = WorkItemLocation.BACKLOG; // Default to backlog

    @ManyToOne
    @JoinColumn(name = "sprint_id")
    private Sprint sprint;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "epic_id")
    private Epic epic;

    @OneToMany(mappedBy = "workItem")
    private Set<CostAssignment> costAssignments = new HashSet<>();

    @OneToMany(mappedBy = "workItem")
    private List<PersonAssignment> personAssignments = new ArrayList<>();

    // Validation to ensure proper location state
    @PrePersist
    @PreUpdate
    private void validateLocation() {
        if (location == WorkItemLocation.SPRINT && sprint == null) {
            throw new IllegalStateException("Work item in SPRINT location must have a sprint assigned");
        }
        if ((location == WorkItemLocation.BACKLOG) && sprint != null) {
            throw new IllegalStateException("Work item with sprint must have SPRINT or COMPLETED location");
        }
        if (location == WorkItemLocation.COMPLETED && status != WorkItemStatus.DONE) {
            throw new IllegalStateException("Completed work items must have DONE status");
        }
    }
} 