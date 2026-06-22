package com.thesis.projectmanagement.model;

import com.thesis.projectmanagement.constants.WorkItemLocation;
import com.thesis.projectmanagement.constants.WorkItemPriority;
import com.thesis.projectmanagement.constants.WorkItemStatus;
import com.thesis.projectmanagement.constants.WorkItemType;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.HashSet;

import static org.junit.jupiter.api.Assertions.*;

class WorkItemTest {
    private WorkItem workItem;
    private Project project;
    private Sprint sprint;
    private Epic epic;

    @BeforeEach
    void setUp() {
        project = Project.builder()
                .id(1L)
                .title("Test Project")
                .build();

        sprint = Sprint.builder()
                .id(1L)
                .name("Test Sprint")
                .project(project)
                .build();

        epic = Epic.builder()
                .id(1L)
                .title("Test Epic")
                .project(project)
                .build();

        workItem = WorkItem.builder()
                .id(1L)
                .title("Test Work Item")
                .description("Test Description")
                .status(WorkItemStatus.TODO)
                .priority(WorkItemPriority.MEDIUM)
                .type(WorkItemType.TASK)
                .storyPoints(3)
                .location(WorkItemLocation.BACKLOG)
                .project(project)
                .costAssignments(new HashSet<>())
                .personAssignments(new ArrayList<>())
                .build();
    }

    @Test
    void testWorkItemBuilder() {
        assertNotNull(workItem);
        assertEquals(1L, workItem.getId());
        assertEquals("Test Work Item", workItem.getTitle());
        assertEquals("Test Description", workItem.getDescription());
        assertEquals(WorkItemStatus.TODO, workItem.getStatus());
        assertEquals(WorkItemPriority.MEDIUM, workItem.getPriority());
        assertEquals(WorkItemType.TASK, workItem.getType());
        assertEquals(3, workItem.getStoryPoints());
        assertEquals(WorkItemLocation.BACKLOG, workItem.getLocation());
        assertEquals(project, workItem.getProject());
        assertNull(workItem.getSprint());
        assertNull(workItem.getEpic());
        assertTrue(workItem.getCostAssignments().isEmpty());
        assertTrue(workItem.getPersonAssignments().isEmpty());
    }

    @Test
    void testLocationValidationWithSprintLocation() {
        workItem.setLocation(WorkItemLocation.SPRINT);
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            // Simulate JPA lifecycle event
            try {
                workItem.getClass().getDeclaredMethod("validateLocation").invoke(workItem);
            } catch (Exception e) {
                if (e.getCause() instanceof IllegalStateException) {
                    throw (IllegalStateException) e.getCause();
                }
                throw new RuntimeException(e);
            }
        });
        assertEquals("Work item in SPRINT location must have a sprint assigned", exception.getMessage());
    }

    @Test
    void testLocationValidationWithBacklogAndSprint() {
        workItem.setSprint(sprint);
        workItem.setLocation(WorkItemLocation.BACKLOG);
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            // Simulate JPA lifecycle event
            try {
                workItem.getClass().getDeclaredMethod("validateLocation").invoke(workItem);
            } catch (Exception e) {
                if (e.getCause() instanceof IllegalStateException) {
                    throw (IllegalStateException) e.getCause();
                }
                throw new RuntimeException(e);
            }
        });
        assertEquals("Work item with sprint must have SPRINT or COMPLETED location", exception.getMessage());
    }

    @Test
    void testLocationValidationWithCompletedNotDone() {
        workItem.setLocation(WorkItemLocation.COMPLETED);
        workItem.setStatus(WorkItemStatus.IN_PROGRESS);
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            // Simulate JPA lifecycle event
            try {
                workItem.getClass().getDeclaredMethod("validateLocation").invoke(workItem);
            } catch (Exception e) {
                if (e.getCause() instanceof IllegalStateException) {
                    throw (IllegalStateException) e.getCause();
                }
                throw new RuntimeException(e);
            }
        });
        assertEquals("Completed work items must have DONE status", exception.getMessage());
    }

    @Test
    void testSetEpic() {
        workItem.setEpic(epic);
        assertEquals(epic, workItem.getEpic());
    }

    @Test
    void testAddCostAssignment() {
        CostAssignment costAssignment = CostAssignment.builder()
                .id(1L)
                .workItem(workItem)
                .build();
        
        workItem.getCostAssignments().add(costAssignment);
        assertEquals(1, workItem.getCostAssignments().size());
        assertTrue(workItem.getCostAssignments().contains(costAssignment));
    }

    @Test
    void testAddPersonAssignment() {
        PersonAssignment personAssignment = PersonAssignment.builder()
                .id(1L)
                .workItem(workItem)
                .build();
        
        workItem.getPersonAssignments().add(personAssignment);
        assertEquals(1, workItem.getPersonAssignments().size());
        assertTrue(workItem.getPersonAssignments().contains(personAssignment));
    }

    @Test
    void testEqualsAndHashCode() {
        WorkItem workItem2 = WorkItem.builder()
                .id(1L)
                .title("Test Work Item")
                .description("Test Description")
                .status(WorkItemStatus.TODO)
                .priority(WorkItemPriority.MEDIUM)
                .type(WorkItemType.TASK)
                .storyPoints(3)
                .location(WorkItemLocation.BACKLOG)
                .project(project)
                .build();

        assertEquals(workItem, workItem2);
        assertEquals(workItem.hashCode(), workItem2.hashCode());

        WorkItem differentWorkItem = WorkItem.builder()
                .id(2L)
                .title("Different Work Item")
                .build();

        assertNotEquals(workItem, differentWorkItem);
        assertNotEquals(workItem.hashCode(), differentWorkItem.hashCode());
    }
} 