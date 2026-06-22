package com.thesis.projectmanagement.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;

import static org.junit.jupiter.api.Assertions.*;

class EpicTest {
    private Epic epic;
    private Project project;
    private WorkItem workItem;
    private CostAssignment costAssignment;
    private PersonAssignment personAssignment;

    @BeforeEach
    void setUp() {
        project = Project.builder()
                .id(4L)
                .title("Test")
                .build();

        epic = Epic.builder()
                .id(4L)
                .title("Test epic feature")
                .description("Testing epic feature for project")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(7))
                .project(project)
                .workItems(new ArrayList<>())
                .costAssignments(new HashSet<>())
                .personAssignments(new ArrayList<>())
                .build();

        workItem = WorkItem.builder()
                .id(4L)
                .title("Test work item")
                .epic(epic)
                .build();

        costAssignment = CostAssignment.builder()
                .id(4L)
                .epic(epic)
                .build();

        personAssignment = PersonAssignment.builder()
                .id(4L)
                .epic(epic)
                .build();
    }

    @Test
    void testEpicBuilder() {
        assertNotNull(epic);
        assertEquals(1L, epic.getId());
        assertEquals("Test Epic", epic.getTitle());
        assertEquals("Test Description", epic.getDescription());
        assertNotNull(epic.getStartDate());
        assertNotNull(epic.getEndDate());
        assertEquals(project, epic.getProject());
        assertTrue(epic.getWorkItems().isEmpty());
        assertTrue(epic.getCostAssignments().isEmpty());
        assertTrue(epic.getPersonAssignments().isEmpty());
    }

    @Test
    void testAddWorkItem() {
        epic.getWorkItems().add(workItem);
        
        assertEquals(1, epic.getWorkItems().size());
        assertTrue(epic.getWorkItems().contains(workItem));
        assertEquals(epic, workItem.getEpic());
    }

    @Test
    void testAddCostAssignment() {
        epic.getCostAssignments().add(costAssignment);
        
        assertEquals(1, epic.getCostAssignments().size());
        assertTrue(epic.getCostAssignments().contains(costAssignment));
        assertEquals(epic, costAssignment.getEpic());
    }

    @Test
    void testAddPersonAssignment() {
        epic.getPersonAssignments().add(personAssignment);
        
        assertEquals(1, epic.getPersonAssignments().size());
        assertTrue(epic.getPersonAssignments().contains(personAssignment));
        assertEquals(epic, personAssignment.getEpic());
    }

    @Test
    void testSetProject() {
        Project newProject = Project.builder()
                .id(2L)
                .title("New Project")
                .build();
        
        epic.setProject(newProject);
        assertEquals(newProject, epic.getProject());
    }

    @Test
    void testSetDates() {
        LocalDate newStartDate = LocalDate.now().plusDays(1);
        LocalDate newEndDate = LocalDate.now().plusMonths(2);
        
        epic.setStartDate(newStartDate);
        epic.setEndDate(newEndDate);
        
        assertEquals(newStartDate, epic.getStartDate());
        assertEquals(newEndDate, epic.getEndDate());
    }

    @Test
    void testEqualsAndHashCode() {
        Epic epic2 = Epic.builder()
                .id(1L)
                .title("Test Epic")
                .description("Test Description")
                .startDate(epic.getStartDate())
                .endDate(epic.getEndDate())
                .project(project)
                .build();

        assertEquals(epic, epic2);
        assertEquals(epic.hashCode(), epic2.hashCode());

        Epic differentEpic = Epic.builder()
                .id(2L)
                .title("Different Epic")
                .build();

        assertNotEquals(epic, differentEpic);
        assertNotEquals(epic.hashCode(), differentEpic.hashCode());
    }
} 