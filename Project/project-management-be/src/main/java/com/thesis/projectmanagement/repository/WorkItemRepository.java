package com.thesis.projectmanagement.repository;

import com.thesis.projectmanagement.constants.WorkItemLocation;
import com.thesis.projectmanagement.constants.WorkItemStatus;
import com.thesis.projectmanagement.model.WorkItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkItemRepository extends JpaRepository<WorkItem, Long> {
    List<WorkItem> findByProjectId(Long projectId);
    List<WorkItem> findBySprintId(Long sprintId);
    List<WorkItem> findByEpicId(Long epicId);
    List<WorkItem> findByProjectIdAndLocation(Long projectId, WorkItemLocation location);
    List<WorkItem> findByProjectIdAndStatus(Long projectId, WorkItemStatus status);
} 