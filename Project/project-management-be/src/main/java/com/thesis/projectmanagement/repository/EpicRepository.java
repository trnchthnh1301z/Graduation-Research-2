package com.thesis.projectmanagement.repository;

import com.thesis.projectmanagement.model.Epic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EpicRepository extends JpaRepository<Epic, Long> {
    List<Epic> findByProjectId(Long projectId);
} 