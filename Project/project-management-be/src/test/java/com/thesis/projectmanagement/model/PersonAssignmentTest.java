package com.thesis.projectmanagement.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PersonAssignmentTest {
    private PersonAssignment personAssignment;
    private Person person;
    private Epic epic;
    private WorkItem workItem;

    @BeforeEach
    void setUp() {
        person = Person.builder()
                .id(1L)
                .name("John Doe")
                .email("john.doe@example.com")
                .build();

        epic = Epic.builder()
                .id(1L)
                .title("Test Epic")
                .build();

        workItem = WorkItem.builder()
                .id(1L)
                .title("Test Work Item")
                .build();

        personAssignment = PersonAssignment.builder()
                .id(1L)
                .person(person)
                .hours(8.0)
                .description("Test Assignment")
                .build();
    }

    @Test
    void testPersonAssignmentBuilder() {
        assertNotNull(personAssignment);
        assertEquals(1L, personAssignment.getId());
        assertEquals(person, personAssignment.getPerson());
        assertEquals(8.0, personAssignment.getHours());
        assertEquals("Test Assignment", personAssignment.getDescription());
        assertNull(personAssignment.getEpic());
        assertNull(personAssignment.getWorkItem());
    }

    @Test
    void testAssignToEpic() {
        personAssignment.setEpic(epic);
        
        assertEquals(epic, personAssignment.getEpic());
        assertNull(personAssignment.getWorkItem());
        
        // Test validation
        assertDoesNotThrow(() -> {
            try {
                personAssignment.getClass().getDeclaredMethod("validateAssignment").invoke(personAssignment);
            } catch (Exception e) {
                if (e.getCause() instanceof IllegalStateException) {
                    throw (IllegalStateException) e.getCause();
                }
                throw new RuntimeException(e);
            }
        });
    }

    @Test
    void testAssignToWorkItem() {
        personAssignment.setWorkItem(workItem);
        
        assertEquals(workItem, personAssignment.getWorkItem());
        assertNull(personAssignment.getEpic());
        
        // Test validation
        assertDoesNotThrow(() -> {
            try {
                personAssignment.getClass().getDeclaredMethod("validateAssignment").invoke(personAssignment);
            } catch (Exception e) {
                if (e.getCause() instanceof IllegalStateException) {
                    throw (IllegalStateException) e.getCause();
                }
                throw new RuntimeException(e);
            }
        });
    }

    @Test
    void testValidationWithNoAssignment() {
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            // Simulate JPA lifecycle event
            try {
                personAssignment.getClass().getDeclaredMethod("validateAssignment").invoke(personAssignment);
            } catch (Exception e) {
                if (e.getCause() instanceof IllegalStateException) {
                    throw (IllegalStateException) e.getCause();
                }
                throw new RuntimeException(e);
            }
        });
        assertEquals("A person must be assigned to either an epic or a work item, but not both", exception.getMessage());
    }

    @Test
    void testValidationWithBothAssignments() {
        personAssignment.setEpic(epic);
        personAssignment.setWorkItem(workItem);
        
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            // Simulate JPA lifecycle event
            try {
                personAssignment.getClass().getDeclaredMethod("validateAssignment").invoke(personAssignment);
            } catch (Exception e) {
                if (e.getCause() instanceof IllegalStateException) {
                    throw (IllegalStateException) e.getCause();
                }
                throw new RuntimeException(e);
            }
        });
        assertEquals("A person must be assigned to either an epic or a work item, but not both", exception.getMessage());
    }

    @Test
    void testValidationWithNegativeHours() {
        personAssignment.setWorkItem(workItem);
        personAssignment.setHours(-1.0);
        
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            // Simulate JPA lifecycle event
            try {
                personAssignment.getClass().getDeclaredMethod("validateAssignment").invoke(personAssignment);
            } catch (Exception e) {
                if (e.getCause() instanceof IllegalStateException) {
                    throw (IllegalStateException) e.getCause();
                }
                throw new RuntimeException(e);
            }
        });
        assertEquals("Hours cannot be negative", exception.getMessage());
    }

    @Test
    void testValidationWithNullHours() {
        personAssignment.setWorkItem(workItem);
        personAssignment.setHours(null);
        
        // Test validation
        assertDoesNotThrow(() -> {
            try {
                personAssignment.getClass().getDeclaredMethod("validateAssignment").invoke(personAssignment);
            } catch (Exception e) {
                if (e.getCause() instanceof IllegalStateException) {
                    throw (IllegalStateException) e.getCause();
                }
                throw new RuntimeException(e);
            }
        });
    }

    @Test
    void testEqualsAndHashCode() {
        PersonAssignment personAssignment2 = PersonAssignment.builder()
                .id(1L)
                .person(person)
                .hours(8.0)
                .description("Test Assignment")
                .build();

        assertEquals(personAssignment, personAssignment2);
        assertEquals(personAssignment.hashCode(), personAssignment2.hashCode());

        PersonAssignment differentPersonAssignment = PersonAssignment.builder()
                .id(2L)
                .person(person)
                .hours(4.0)
                .description("Different Assignment")
                .build();

        assertNotEquals(personAssignment, differentPersonAssignment);
        assertNotEquals(personAssignment.hashCode(), differentPersonAssignment.hashCode());
    }
} 