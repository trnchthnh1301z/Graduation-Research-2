package com.thesis.projectmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CostAssignmentDTO {
    private Long id;
    private Long costId;
    private Long epicId;
    private Long workItemId;
} 