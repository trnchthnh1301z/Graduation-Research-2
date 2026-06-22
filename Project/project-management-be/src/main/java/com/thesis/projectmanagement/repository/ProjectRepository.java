package com.thesis.projectmanagement.repository;

import com.thesis.projectmanagement.constants.ProjectStatus;
import com.thesis.projectmanagement.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByStatus(ProjectStatus status);
    boolean existsByTitle(String title);
} 