package com.thesis.projectmanagement.repository;

import com.thesis.projectmanagement.constants.SprintStatus;
import com.thesis.projectmanagement.model.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {
    List<Sprint> findByProjectId(Long projectId);
    List<Sprint> findByProjectIdAndStatus(Long projectId, SprintStatus status);
} 