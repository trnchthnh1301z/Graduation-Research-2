package com.thesis.projectmanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "person_assignments")
public class PersonAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    @ManyToOne
    @JoinColumn(name = "epic_id")
    private Epic epic;

    @ManyToOne
    @JoinColumn(name = "work_item_id")
    private WorkItem workItem;
    
    // Allocated hours for this assignment
    private Double hours;

    private String description;
    
    // Ensure that either epic or workItem is assigned, but not both
    @PrePersist
    @PreUpdate
    private void validateAssignment() {
        if ((epic == null && workItem == null) || (epic != null && workItem != null)) {
            throw new IllegalStateException("A person must be assigned to either an epic or a work item, but not both");
        }
        if (hours != null && hours < 0) {
            throw new IllegalStateException("Hours cannot be negative");
        }
    }
}
