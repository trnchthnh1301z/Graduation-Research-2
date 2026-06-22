package com.thesis.projectmanagement.model;

import com.thesis.projectmanagement.constants.SprintStatus;
import com.thesis.projectmanagement.constants.WorkItemLocation;
import com.thesis.projectmanagement.constants.WorkItemStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sprints")
public class Sprint {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String goal;
    
    @Enumerated(EnumType.STRING)
    private SprintStatus status;
    
    private LocalDate startDate;
    private LocalDate endDate;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @OneToMany(mappedBy = "sprint")
    private List<WorkItem> workItems = new ArrayList<>();

    // Start the sprint
    public void startSprint() {
        if (status != SprintStatus.NOT_STARTED) {
            throw new IllegalStateException("Can only start sprints that are in NOT_STARTED status");
        }
        this.status = SprintStatus.ACTIVE;
    }

    // Complete the sprint and move incomplete items to backlog
    public void completeSprint() {
        if (status != SprintStatus.ACTIVE) {
            throw new IllegalStateException("Can only complete sprints that are in ACTIVE status");
        }

        // Find incomplete work items (TODO or IN_PROGRESS)
        List<WorkItem> incompleteItems = workItems.stream()
                .filter(wi -> wi.getStatus() == WorkItemStatus.TODO || 
                            wi.getStatus() == WorkItemStatus.IN_PROGRESS)
                .toList();
        
        // Move all incomplete items to backlog
        incompleteItems.forEach(this::removeWorkItem);
        
        this.status = SprintStatus.COMPLETED;
    }

    // Complete the sprint and move incomplete items to specified sprint
    public void completeSprint(Sprint targetSprint) {
        if (status != SprintStatus.ACTIVE) {
            throw new IllegalStateException("Can only complete sprints that are in ACTIVE status");
        }
        
        if (targetSprint == null) {
            completeSprint();
            return;
        }

        // Validate target sprint
        if (!targetSprint.getProject().getId().equals(this.project.getId())) {
            throw new IllegalArgumentException("Target sprint must belong to the same project");
        }
        
        if (targetSprint.getStatus() == SprintStatus.COMPLETED) {
            throw new IllegalArgumentException("Cannot move items to a completed sprint");
        }

        // Find incomplete work items (TODO or IN_PROGRESS)
        List<WorkItem> incompleteItems = workItems.stream()
                .filter(wi -> wi.getStatus() == WorkItemStatus.TODO || 
                            wi.getStatus() == WorkItemStatus.IN_PROGRESS)
                .toList();
        
        // Move incomplete items to target sprint
        incompleteItems.forEach(item -> {
            removeWorkItem(item);
            targetSprint.addWorkItem(item);
        });
        
        this.status = SprintStatus.COMPLETED;
    }

    // Helper method to add work item to sprint
    public void addWorkItem(WorkItem workItem) {
        if (status == SprintStatus.COMPLETED) {
            throw new IllegalStateException("Cannot add work items to a completed sprint");
        }
        workItems.add(workItem);
        workItem.setSprint(this);
        workItem.setLocation(WorkItemLocation.SPRINT);
    }

    // Helper method to remove work item from sprint
    public void removeWorkItem(WorkItem workItem) {
        workItems.remove(workItem);
        workItem.setSprint(null);
        workItem.setLocation(WorkItemLocation.BACKLOG);
    }
} 