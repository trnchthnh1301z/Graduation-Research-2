package com.thesis.projectmanagement.repository;

import com.thesis.projectmanagement.model.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {
    List<Person> findByRole(String role);
    Optional<Person> findByEmail(String email);
} 