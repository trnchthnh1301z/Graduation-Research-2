package com.thesis.projectmanagement.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CostAssignmentTest {
    private CostAssignment costAssignment;
    private Cost cost;
    private Epic epic;
    private WorkItem workItem;

    @BeforeEach
    void setUp() {
        cost = Cost.builder()
                .id(1L)
                .name("Test Cost")
                .amount(100.0)
                .build();

        epic = Epic.builder()
                .id(1L)
                .title("Test Epic")
                .build();

        workItem = WorkItem.builder()
                .id(1L)
                .title("Test Work Item")
                .build();

        costAssignment = CostAssignment.builder()
                .id(1L)
                .cost(cost)
                .build();
    }

    @Test
    void testCostAssignmentBuilder() {
        assertNotNull(costAssignment);
        assertEquals(1L, costAssignment.getId());
        assertEquals(cost, costAssignment.getCost());
        assertNull(costAssignment.getEpic());
        assertNull(costAssignment.getWorkItem());
    }

    @Test
    void testAssignToEpic() {
        costAssignment.setEpic(epic);
        
        assertEquals(epic, costAssignment.getEpic());
        assertNull(costAssignment.getWorkItem());
        
        // Test validation
        assertDoesNotThrow(() -> {
            try {
                costAssignment.getClass().getDeclaredMethod("validateAssignment").invoke(costAssignment);
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
        costAssignment.setWorkItem(workItem);
        
        assertEquals(workItem, costAssignment.getWorkItem());
        assertNull(costAssignment.getEpic());
        
        // Test validation
        assertDoesNotThrow(() -> {
            try {
                costAssignment.getClass().getDeclaredMethod("validateAssignment").invoke(costAssignment);
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
                costAssignment.getClass().getDeclaredMethod("validateAssignment").invoke(costAssignment);
            } catch (Exception e) {
                if (e.getCause() instanceof IllegalStateException) {
                    throw (IllegalStateException) e.getCause();
                }
                throw new RuntimeException(e);
            }
        });
        assertEquals("A cost must be assigned to either an epic or a work item, but not both", exception.getMessage());
    }

    @Test
    void testValidationWithBothAssignments() {
        costAssignment.setEpic(epic);
        costAssignment.setWorkItem(workItem);
        
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            // Simulate JPA lifecycle event
            try {
                costAssignment.getClass().getDeclaredMethod("validateAssignment").invoke(costAssignment);
            } catch (Exception e) {
                if (e.getCause() instanceof IllegalStateException) {
                    throw (IllegalStateException) e.getCause();
                }
                throw new RuntimeException(e);
            }
        });
        assertEquals("A cost must be assigned to either an epic or a work item, but not both", exception.getMessage());
    }

    @Test
    void testEqualsAndHashCode() {
        CostAssignment costAssignment2 = CostAssignment.builder()
                .id(1L)
                .cost(cost)
                .build();

        assertEquals(costAssignment, costAssignment2);
        assertEquals(costAssignment.hashCode(), costAssignment2.hashCode());

        CostAssignment differentCostAssignment = CostAssignment.builder()
                .id(2L)
                .cost(cost)
                .build();

        assertNotEquals(costAssignment, differentCostAssignment);
        assertNotEquals(costAssignment.hashCode(), differentCostAssignment.hashCode());
    }
} 