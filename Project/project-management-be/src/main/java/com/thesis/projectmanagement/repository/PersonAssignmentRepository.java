package com.thesis.projectmanagement.repository;

import com.thesis.projectmanagement.model.PersonAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonAssignmentRepository extends JpaRepository<PersonAssignment, Long> {
    List<PersonAssignment> findByPersonId(Long personId);
    List<PersonAssignment> findByEpicId(Long epicId);
    List<PersonAssignment> findByWorkItemId(Long workItemId);
} 