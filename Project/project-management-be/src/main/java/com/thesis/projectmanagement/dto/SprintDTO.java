package com.thesis.projectmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SprintDTO {
    private Long id;
    private String name;
    private String goal;
    private String status;  // Instead of SprintStatus enum
    private LocalDate startDate;
    private LocalDate endDate;
    private Long projectId;
} 