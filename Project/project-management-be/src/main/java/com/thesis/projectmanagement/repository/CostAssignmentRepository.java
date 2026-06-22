package com.thesis.projectmanagement.repository;

import com.thesis.projectmanagement.model.CostAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CostAssignmentRepository extends JpaRepository<CostAssignment, Long> {
    List<CostAssignment> findByCostId(Long costId);
    List<CostAssignment> findByEpicId(Long epicId);
    List<CostAssignment> findByWorkItemId(Long workItemId);
} 