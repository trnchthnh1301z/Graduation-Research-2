package com.thesis.projectmanagement.model;

import com.thesis.projectmanagement.constants.SprintStatus;
import com.thesis.projectmanagement.constants.WorkItemLocation;
import com.thesis.projectmanagement.constants.WorkItemStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

class SprintTest {
    private Sprint sprint;
    private Project project;
    private WorkItem workItem;

    @BeforeEach
    void setUp() {
        project = Project.builder()
                .id(1L)
                .title("Test Project")
                .build();

        sprint = Sprint.builder()
                .id(1L)
                .name("Sprint 1")
                .goal("Test Goal")
                .status(SprintStatus.NOT_STARTED)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusWeeks(2))
                .project(project)
                .workItems(new ArrayList<>())
                .build();

        workItem = WorkItem.builder()
                .id(1L)
                .title("Test Work Item")
                .status(WorkItemStatus.TODO)
                .location(WorkItemLocation.BACKLOG)
                .build();
    }

    @Test
    void testSprintBuilder() {
        assertNotNull(sprint);
        assertEquals(1L, sprint.getId());
        assertEquals("Sprint 1", sprint.getName());
        assertEquals("Test Goal", sprint.getGoal());
        assertEquals(SprintStatus.NOT_STARTED, sprint.getStatus());
        assertNotNull(sprint.getStartDate());
        assertNotNull(sprint.getEndDate());
        assertEquals(project, sprint.getProject());
        assertTrue(sprint.getWorkItems().isEmpty());
    }

    @Test
    void testStartSprint() {
        sprint.startSprint();
        assertEquals(SprintStatus.ACTIVE, sprint.getStatus());
    }

    @Test
    void testStartSprintWhenAlreadyStarted() {
        sprint.startSprint();
        assertThrows(IllegalStateException.class, () -> sprint.startSprint());
    }

    @Test
    void testCompleteSprint() {
        sprint.startSprint();
        sprint.completeSprint();
        assertEquals(SprintStatus.COMPLETED, sprint.getStatus());
    }

    @Test
    void testCompleteSprintWhenNotActive() {
        assertThrows(IllegalStateException.class, () -> sprint.completeSprint());
    }

    @Test
    void testCompleteSprintWithIncompleteItems() {
        sprint.startSprint();
        sprint.addWorkItem(workItem);
        
        sprint.completeSprint();
        
        assertEquals(SprintStatus.COMPLETED, sprint.getStatus());
        assertTrue(sprint.getWorkItems().isEmpty());
        assertNull(workItem.getSprint());
        assertEquals(WorkItemLocation.BACKLOG, workItem.getLocation());
    }

    @Test
    void testCompleteSprintWithTargetSprint() {
        Sprint targetSprint = Sprint.builder()
                .id(2L)
                .name("Sprint 2")
                .status(SprintStatus.NOT_STARTED)
                .project(project)
                .workItems(new ArrayList<>())
                .build();

        sprint.startSprint();
        sprint.addWorkItem(workItem);
        
        sprint.completeSprint(targetSprint);
        
        assertEquals(SprintStatus.COMPLETED, sprint.getStatus());
        assertTrue(sprint.getWorkItems().isEmpty());
        assertEquals(targetSprint, workItem.getSprint());
        assertEquals(WorkItemLocation.SPRINT, workItem.getLocation());
        assertTrue(targetSprint.getWorkItems().contains(workItem));
    }

    @Test
    void testCompleteSprintWithInvalidTargetSprint() {
        Project differentProject = Project.builder()
                .id(2L)
                .title("Different Project")
                .build();

        Sprint invalidTargetSprint = Sprint.builder()
                .id(2L)
                .name("Sprint 2")
                .status(SprintStatus.NOT_STARTED)
                .project(differentProject)
                .workItems(new ArrayList<>())
                .build();

        sprint.startSprint();
        assertThrows(IllegalArgumentException.class, () -> sprint.completeSprint(invalidTargetSprint));
    }

    @Test
    void testAddWorkItem() {
        sprint.addWorkItem(workItem);
        
        assertTrue(sprint.getWorkItems().contains(workItem));
        assertEquals(sprint, workItem.getSprint());
        assertEquals(WorkItemLocation.SPRINT, workItem.getLocation());
    }

    @Test
    void testAddWorkItemToCompletedSprint() {
        sprint.startSprint();
        sprint.completeSprint();
        
        assertThrows(IllegalStateException.class, () -> sprint.addWorkItem(workItem));
    }

    @Test
    void testRemoveWorkItem() {
        sprint.addWorkItem(workItem);
        sprint.removeWorkItem(workItem);
        
        assertFalse(sprint.getWorkItems().contains(workItem));
        assertNull(workItem.getSprint());
        assertEquals(WorkItemLocation.BACKLOG, workItem.getLocation());
    }
} 