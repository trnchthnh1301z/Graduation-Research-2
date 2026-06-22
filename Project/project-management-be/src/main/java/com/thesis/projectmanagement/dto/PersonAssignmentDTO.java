package com.thesis.projectmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonAssignmentDTO {
    private Long id;
    private Long personId;
    private Long epicId;
    private Long workItemId;
    private Double hours;
    private String description;
} 