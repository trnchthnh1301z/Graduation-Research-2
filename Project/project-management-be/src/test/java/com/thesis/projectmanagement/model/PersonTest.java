package com.thesis.projectmanagement.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

class PersonTest {
    private Person person;
    private PersonAssignment personAssignment;

    @BeforeEach
    void setUp() {
        person = Person.builder()
                .id(1L)
                .name("John Doe")
                .email("john.doe@example.com")
                .role("Developer")
                .assignments(new ArrayList<>())
                .build();

        personAssignment = PersonAssignment.builder()
                .id(1L)
                .person(person)
                .build();
    }

    @Test
    void testPersonBuilder() {
        assertNotNull(person);
        assertEquals(1L, person.getId());
        assertEquals("John Doe", person.getName());
        assertEquals("john.doe@example.com", person.getEmail());
        assertEquals("Developer", person.getRole());
        assertTrue(person.getAssignments().isEmpty());
    }

    @Test
    void testAddAssignment() {
        person.getAssignments().add(personAssignment);
        
        assertEquals(1, person.getAssignments().size());
        assertTrue(person.getAssignments().contains(personAssignment));
        assertEquals(person, personAssignment.getPerson());
    }

    @Test
    void testRemoveAssignment() {
        person.getAssignments().add(personAssignment);
        person.getAssignments().remove(personAssignment);
        
        assertTrue(person.getAssignments().isEmpty());
    }

    @Test
    void testUpdatePersonDetails() {
        person.setName("Jane Doe");
        person.setEmail("jane.doe@example.com");
        person.setRole("Senior Developer");
        
        assertEquals("Jane Doe", person.getName());
        assertEquals("jane.doe@example.com", person.getEmail());
        assertEquals("Senior Developer", person.getRole());
    }

    @Test
    void testEqualsAndHashCode() {
        Person person2 = Person.builder()
                .id(1L)
                .name("John Doe")
                .email("john.doe@example.com")
                .role("Developer")
                .assignments(new ArrayList<>())
                .build();

        assertEquals(person, person2);
        assertEquals(person.hashCode(), person2.hashCode());

        Person differentPerson = Person.builder()
                .id(2L)
                .name("Different Person")
                .email("different@example.com")
                .role("Manager")
                .build();

        assertNotEquals(person, differentPerson);
        assertNotEquals(person.hashCode(), differentPerson.hashCode());
    }
} 