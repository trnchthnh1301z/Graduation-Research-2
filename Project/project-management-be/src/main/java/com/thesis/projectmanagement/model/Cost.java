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
@Table(name = "costs")
public class Cost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private Double amount;
    private String category;

    @OneToOne(mappedBy = "cost")
    private CostAssignment assignment;

    // Validate amount is not negative
    @PrePersist
    @PreUpdate
    private void validateAmount() {
        if (amount != null && amount < 0) {
            throw new IllegalStateException("Amount cannot be negative");
        }
    }
} 