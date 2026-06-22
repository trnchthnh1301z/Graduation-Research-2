package com.thesis.projectmanagement.model;

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
@Table(name = "epics")
public class Epic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @OneToMany(mappedBy = "epic")
    private List<WorkItem> workItems = new ArrayList<>();

    @OneToMany(mappedBy = "epic")
    private Set<CostAssignment> costAssignments = new HashSet<>();

    @OneToMany(mappedBy = "epic")
    private List<PersonAssignment> personAssignments = new ArrayList<>();
}