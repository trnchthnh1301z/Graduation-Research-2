package com.thesis.projectmanagement.model;

import com.thesis.projectmanagement.constants.ProjectStatus;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

class ProjectTest {

    @Test
    void testProjectBuilder() {
        Project project = Project.builder()
                .id(1L)
                .title("Test Project")
                .description("Test Description")
                .status(ProjectStatus.ACTIVE)
                .sprints(new ArrayList<>())
                .epics(new ArrayList<>())
                .workItems(new ArrayList<>())
                .build();

        assertEquals(1L, project.getId());
        assertEquals("Test Project", project.getTitle());
        assertEquals("Test Description", project.getDescription());
        assertEquals(ProjectStatus.ACTIVE, project.getStatus());
        assertNotNull(project.getSprints());
        assertNotNull(project.getEpics());
        assertNotNull(project.getWorkItems());
        assertTrue(project.getSprints().isEmpty());
        assertTrue(project.getEpics().isEmpty());
        assertTrue(project.getWorkItems().isEmpty());
    }

    @Test
    void testProjectNoArgsConstructor() {
        Project project = new Project();
        assertNull(project.getId());
        assertNull(project.getTitle());
        assertNull(project.getDescription());
        assertNull(project.getStatus());
        assertNotNull(project.getSprints());
        assertNotNull(project.getEpics());
        assertNotNull(project.getWorkItems());
    }

    @Test
    void testProjectSettersAndGetters() {
        Project project = new Project();
        
        project.setId(1L);
        project.setTitle("Updated Project");
        project.setDescription("Updated Description");
        project.setStatus(ProjectStatus.ARCHIVED);
        
        assertEquals(1L, project.getId());
        assertEquals("Updated Project", project.getTitle());
        assertEquals("Updated Description", project.getDescription());
        assertEquals(ProjectStatus.ARCHIVED, project.getStatus());
    }

    @Test
    void testProjectEqualsAndHashCode() {
        Project project1 = Project.builder()
                .id(1L)
                .title("Test Project")
                .description("Test Description")
                .status(ProjectStatus.ACTIVE)
                .build();

        Project project2 = Project.builder()
                .id(1L)
                .title("Test Project")
                .description("Test Description")
                .status(ProjectStatus.ACTIVE)
                .build();

        Project project3 = Project.builder()
                .id(2L)
                .title("Different Project")
                .description("Different Description")
                .status(ProjectStatus.PLANNING)
                .build();

        assertEquals(project1, project2);
        assertEquals(project1.hashCode(), project2.hashCode());
        assertNotEquals(project1, project3);
        assertNotEquals(project1.hashCode(), project3.hashCode());
    }
} 