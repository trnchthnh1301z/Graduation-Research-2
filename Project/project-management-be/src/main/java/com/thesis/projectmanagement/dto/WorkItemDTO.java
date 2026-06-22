package com.thesis.projectmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkItemDTO {
    private Long id;
    private String title;
    private String description;
    private String status;          // Instead of WorkItemStatus enum
    private String priority;        // Instead of WorkItemPriority enum
    private String type;           // Instead of WorkItemType enum
    private String location;       // Instead of WorkItemLocation enum
    private Integer storyPoints;
    private Long sprintId;
    private Long projectId;
    private Long epicId;
} 