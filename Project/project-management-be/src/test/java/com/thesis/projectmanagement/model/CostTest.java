package com.thesis.projectmanagement.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CostTest {
    private Cost cost;
    private CostAssignment costAssignment;

    @BeforeEach
    void setUp() {
        cost = Cost.builder()
                .id(1L)
                .name("Test Cost")
                .description("Test Description")
                .amount(100.0)
                .category("Test Category")
                .build();

        costAssignment = CostAssignment.builder()
                .id(1L)
                .cost(cost)
                .build();
    }

    @Test
    void testCostBuilder() {
        assertNotNull(cost);
        assertEquals(1L, cost.getId());
        assertEquals("Test Cost", cost.getName());
        assertEquals("Test Description", cost.getDescription());
        assertEquals(100.0, cost.getAmount());
        assertEquals("Test Category", cost.getCategory());
        assertNull(cost.getAssignment());
    }

    @Test
    void testSetAssignment() {
        cost.setAssignment(costAssignment);
        assertEquals(costAssignment, cost.getAssignment());
    }

    @Test
    void testAmountValidation() {
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            cost.setAmount(-100.0);
            // Simulate JPA lifecycle event
            try {
                cost.getClass().getDeclaredMethod("validateAmount").invoke(cost);
            } catch (Exception e) {
                if (e.getCause() instanceof IllegalStateException) {
                    throw (IllegalStateException) e.getCause();
                }
                throw new RuntimeException(e);
            }
        });
        assertEquals("Amount cannot be negative", exception.getMessage());
    }

    @Test
    void testAmountValidationWithNull() {
        cost.setAmount(null);
        // Should not throw exception when amount is null
        assertDoesNotThrow(() -> {
            try {
                cost.getClass().getDeclaredMethod("validateAmount").invoke(cost);
            } catch (Exception e) {
                if (e.getCause() instanceof IllegalStateException) {
                    throw (IllegalStateException) e.getCause();
                }
                throw new RuntimeException(e);
            }
        });
    }

    @Test
    void testAmountValidationWithZero() {
        cost.setAmount(0.0);
        // Should not throw exception when amount is zero
        assertDoesNotThrow(() -> {
            try {
                cost.getClass().getDeclaredMethod("validateAmount").invoke(cost);
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
        Cost cost2 = Cost.builder()
                .id(1L)
                .name("Test Cost")
                .description("Test Description")
                .amount(100.0)
                .category("Test Category")
                .build();

        assertEquals(cost, cost2);
        assertEquals(cost.hashCode(), cost2.hashCode());

        Cost differentCost = Cost.builder()
                .id(2L)
                .name("Different Cost")
                .amount(200.0)
                .build();

        assertNotEquals(cost, differentCost);
        assertNotEquals(cost.hashCode(), differentCost.hashCode());
    }
} 