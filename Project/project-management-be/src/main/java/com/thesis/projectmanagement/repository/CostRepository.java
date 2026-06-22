package com.thesis.projectmanagement.repository;

import com.thesis.projectmanagement.model.Cost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CostRepository extends JpaRepository<Cost, Long> {
    List<Cost> findByCategory(String category);
} 