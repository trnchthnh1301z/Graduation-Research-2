package com.thesis.projectmanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cost_assignments")
public class CostAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "cost_id", nullable = false)
    private Cost cost;

    @ManyToOne
    @JoinColumn(name = "epic_id")
    private Epic epic;

    @ManyToOne
    @JoinColumn(name = "work_item_id")
    private WorkItem workItem;

    // Ensure that either epic or workItem is assigned, but not both
    @PrePersist
    @PreUpdate
    private void validateAssignment() {
        if ((epic == null && workItem == null) || (epic != null && workItem != null)) {
            throw new IllegalStateException("A cost must be assigned to either an epic or a work item, but not both");
        }
    }
}
