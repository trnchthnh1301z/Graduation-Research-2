package com.thesis.projectmanagement.service;

import com.thesis.projectmanagement.constants.ProjectStatus;
import com.thesis.projectmanagement.dto.ProjectDTO;
import com.thesis.projectmanagement.mapper.ProjectMapper;
import com.thesis.projectmanagement.model.Project;
import com.thesis.projectmanagement.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;

    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(projectMapper::toDTO)
                .collect(Collectors.toList());
    }

    public ProjectDTO getProjectById(Long id) {
        return projectRepository.findById(id)
                .map(projectMapper::toDTO)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + id));
    }

    public List<ProjectDTO> getProjectsByStatus(ProjectStatus status) {
        return projectRepository.findByStatus(status).stream()
                .map(projectMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectDTO createProject(ProjectDTO projectDTO) {
        validateProjectTitle(projectDTO.getTitle());
        Project project = projectMapper.toEntity(projectDTO);
        project = projectRepository.save(project);
        return projectMapper.toDTO(project);
    }

    @Transactional
    public ProjectDTO updateProject(Long id, ProjectDTO projectDTO) {
        Project existingProject = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + id));
        
        if (projectDTO.getTitle() != null && !projectDTO.getTitle().equals(existingProject.getTitle())) {
            validateProjectTitle(projectDTO.getTitle());
        }
        
        projectMapper.updateEntityFromDTO(projectDTO, existingProject);
        existingProject = projectRepository.save(existingProject);
        return projectMapper.toDTO(existingProject);
    }

    @Transactional
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new IllegalArgumentException("Project not found with id: " + id);
        }
        projectRepository.deleteById(id);
    }

    private void validateProjectTitle(String title) {
        if (projectRepository.existsByTitle(title)) {
            throw new IllegalArgumentException("Project with title '" + title + "' already exists");
        }
    }
} 