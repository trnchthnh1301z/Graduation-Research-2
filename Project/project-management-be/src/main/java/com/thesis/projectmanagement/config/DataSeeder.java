package com.thesis.projectmanagement.config;

import com.thesis.projectmanagement.constants.ProjectStatus;
import com.thesis.projectmanagement.constants.SprintStatus;
import com.thesis.projectmanagement.constants.WorkItemPriority;
import com.thesis.projectmanagement.constants.WorkItemStatus;
import com.thesis.projectmanagement.constants.WorkItemType;
import com.thesis.projectmanagement.constants.WorkItemLocation;
import com.thesis.projectmanagement.model.*;
import com.thesis.projectmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.time.LocalDate;
import java.util.*;

@Configuration
@RequiredArgsConstructor
@Profile("dev")
public class DataSeeder {
    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final EpicRepository epicRepository;
    private final WorkItemRepository workItemRepository;
    private final PersonRepository personRepository;
    private final CostRepository costRepository;
    private final PersonAssignmentRepository personAssignmentRepository;
    private final CostAssignmentRepository costAssignmentRepository;
    
    private final Random random = new Random();

    @Bean
    public CommandLineRunner seedData() {
        return args -> {
            // Clear existing data
            costAssignmentRepository.deleteAll();
            personAssignmentRepository.deleteAll();
            workItemRepository.deleteAll();
            sprintRepository.deleteAll();
            epicRepository.deleteAll();
            projectRepository.deleteAll();
            personRepository.deleteAll();
            costRepository.deleteAll();

            // 1. Create 5 people
            List<Person> persons = createPersons();
            
            // 2. Create 2 projects
            List<Project> projects = createProjects();
            
            // 3. Create 2 sprints for each project
            Map<Project, List<Sprint>> projectSprints = new HashMap<>();
            for (Project project : projects) {
                List<Sprint> sprints = createSprintsForProject(project);
                projectSprints.put(project, sprints);
            }
            
            // 4. Create initial work items (some in backlog, some in sprints)
            List<WorkItem> allWorkItems = new ArrayList<>();
            for (Project project : projects) {
                List<WorkItem> workItems = createInitialWorkItems(project, projectSprints.get(project));
                allWorkItems.addAll(workItems);
            }
            
            // 5. Create 2-3 epics
            List<Epic> epics = createEpics(projects);
            
            // 6. Assign some existing work items to epics
            assignWorkItemsToEpics(allWorkItems, epics);
            
            // 7. Create additional work items
            for (Project project : projects) {
                List<WorkItem> additionalWorkItems = createAdditionalWorkItems(project, projectSprints.get(project), epics);
                allWorkItems.addAll(additionalWorkItems);
            }
            
            // 8. Create costs and assignments
            createCostsAndAssignments(epics, allWorkItems);
            
            // 9. Create person assignments
            createPersonAssignments(persons, epics, allWorkItems);
        };
    }

    private List<Person> createPersons() {
        List<String> roles = Arrays.asList("Developer", "Designer", "Product Owner", "Scrum Master", "Tester", "DevOps Engineer", "Business Analyst", "Technical Lead", "UX Researcher", "QA Lead");
        
        List<Person> persons = Arrays.asList(
            Person.builder()
                .name("John Doe")
                .email("john.doe@example.com")
                .role("Developer")
                .build(),
            Person.builder()
                .name("Jane Smith")
                .email("jane.smith@example.com")
                .role("Designer")
                .build(),
            Person.builder()
                .name("Bob Johnson")
                .email("bob.johnson@example.com")
                .role("Product Owner")
                .build(),
            Person.builder()
                .name("Alice Brown")
                .email("alice.brown@example.com")
                .role("Scrum Master")
                .build(),
            Person.builder()
                .name("Charlie Wilson")
                .email("charlie.wilson@example.com")
                .role("Tester")
                .build(),
            Person.builder()
                .name("David Lee")
                .email("david.lee@example.com")
                .role("DevOps Engineer")
                .build(),
            Person.builder()
                .name("Emma Davis")
                .email("emma.davis@example.com")
                .role("Business Analyst")
                .build(),
            Person.builder()
                .name("Frank Miller")
                .email("frank.miller@example.com")
                .role("Technical Lead")
                .build(),
            Person.builder()
                .name("Grace Taylor")
                .email("grace.taylor@example.com")
                .role("UX Researcher")
                .build(),
            Person.builder()
                .name("Henry Wilson")
                .email("henry.wilson@example.com")
                .role("QA Lead")
                .build()
        );
        
        return personRepository.saveAll(persons);
    }

    private List<Project> createProjects() {
        List<Project> projects = Arrays.asList(
            Project.builder()
                .title("E-Commerce Platform")
                .description("Online shopping platform with modern UI and advanced features")
                .status(ProjectStatus.ACTIVE)
                .build(),
            Project.builder()
                .title("Mobile Banking App")
                .description("Secure mobile banking application with biometric authentication")
                .status(ProjectStatus.PLANNING)
                .build(),
            Project.builder()
                .title("Healthcare Management System")
                .description("Integrated healthcare management solution for hospitals")
                .status(ProjectStatus.ACTIVE)
                .build(),
            Project.builder()
                .title("Smart Home IoT Platform")
                .description("IoT platform for smart home device management")
                .status(ProjectStatus.PLANNING)
                .build()
        );
        
        return projectRepository.saveAll(projects);
    }

    private List<Sprint> createSprintsForProject(Project project) {
        LocalDate now = LocalDate.now();
        
        List<Sprint> sprints = Arrays.asList(
            Sprint.builder()
                .name("Sprint 1")
                .goal("Project setup and infrastructure")
                .status(SprintStatus.ACTIVE)
                .startDate(now.minusWeeks(4))
                .endDate(now.minusWeeks(2))
                .project(project)
                .build(),
            Sprint.builder()
                .name("Sprint 2")
                .goal("Core features implementation")
                .status(SprintStatus.ACTIVE)
                .startDate(now)
                .endDate(now.plusWeeks(2))
                .project(project)
                .build(),
            Sprint.builder()
                .name("Sprint 3")
                .goal("Advanced features and integrations")
                .status(SprintStatus.NOT_STARTED)
                .startDate(now.plusWeeks(2))
                .endDate(now.plusWeeks(4))
                .project(project)
                .build(),
            Sprint.builder()
                .name("Sprint 4")
                .goal("Performance optimization and security")
                .status(SprintStatus.NOT_STARTED)
                .startDate(now.plusWeeks(4))
                .endDate(now.plusWeeks(6))
                .project(project)
                .build()
        );
        
        return sprintRepository.saveAll(sprints);
    }

    private List<WorkItem> createInitialWorkItems(Project project, List<Sprint> sprints) {
        List<WorkItem> workItems = new ArrayList<>();
        
        // Create backlog items
        workItems.addAll(Arrays.asList(
            WorkItem.builder()
                .title("Setup Development Environment")
                .description("Configure development tools and environments")
                .status(WorkItemStatus.DONE)
                .priority(WorkItemPriority.HIGH)
                .type(WorkItemType.TASK)
                .storyPoints(3)
                .location(WorkItemLocation.BACKLOG)
                .project(project)
                .build(),
            WorkItem.builder()
                .title("Design Database Schema")
                .description("Create initial database design")
                .status(WorkItemStatus.IN_PROGRESS)
                .priority(WorkItemPriority.HIGH)
                .type(WorkItemType.TASK)
                .storyPoints(5)
                .location(WorkItemLocation.BACKLOG)
                .project(project)
                .build(),
            WorkItem.builder()
                .title("API Documentation")
                .description("Create API documentation using Swagger")
                .status(WorkItemStatus.TODO)
                .priority(WorkItemPriority.MEDIUM)
                .type(WorkItemType.TASK)
                .storyPoints(3)
                .location(WorkItemLocation.BACKLOG)
                .project(project)
                .build(),
            WorkItem.builder()
                .title("User Authentication Flow")
                .description("Implement secure user authentication")
                .status(WorkItemStatus.IN_PROGRESS)
                .priority(WorkItemPriority.HIGH)
                .type(WorkItemType.STORY)
                .storyPoints(8)
                .location(WorkItemLocation.SPRINT)
                .project(project)
                .sprint(sprints.get(0))
                .build(),
            WorkItem.builder()
                .title("Performance Monitoring Setup")
                .description("Set up application performance monitoring")
                .status(WorkItemStatus.TODO)
                .priority(WorkItemPriority.MEDIUM)
                .type(WorkItemType.TASK)
                .storyPoints(5)
                .location(WorkItemLocation.SPRINT)
                .project(project)
                .sprint(sprints.get(0))
                .build(),
            WorkItem.builder()
                .title("Security Vulnerability Scan")
                .description("Perform security assessment")
                .status(WorkItemStatus.TODO)
                .priority(WorkItemPriority.HIGH)
                .type(WorkItemType.BUG)
                .storyPoints(3)
                .location(WorkItemLocation.SPRINT)
                .project(project)
                .sprint(sprints.get(1))
                .build()
        ));
        
        return workItemRepository.saveAll(workItems);
    }

    private List<Epic> createEpics(List<Project> projects) {
        List<Epic> epics = new ArrayList<>();
        
        // E-Commerce Platform Epics
        Project ecommerce = projects.get(0);
        epics.addAll(Arrays.asList(
            Epic.builder()
                .title("User Management")
                .description("User authentication, authorization, and profile management")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(2))
                .project(ecommerce)
                .build(),
            Epic.builder()
                .title("Product Catalog")
                .description("Product management, categories, and search functionality")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(3))
                .project(ecommerce)
                .build(),
            Epic.builder()
                .title("Shopping Cart & Checkout")
                .description("Shopping cart management and secure checkout process")
                .startDate(LocalDate.now().plusMonths(1))
                .endDate(LocalDate.now().plusMonths(4))
                .project(ecommerce)
                .build()
        ));
        
        // Mobile Banking App Epics
        Project banking = projects.get(1);
        epics.addAll(Arrays.asList(
            Epic.builder()
                .title("Security Infrastructure")
                .description("Secure authentication and encryption implementation")
                .startDate(LocalDate.now().plusWeeks(2))
                .endDate(LocalDate.now().plusMonths(3))
                .project(banking)
                .build(),
            Epic.builder()
                .title("Account Management")
                .description("Account viewing, transactions, and transfers")
                .startDate(LocalDate.now().plusMonths(1))
                .endDate(LocalDate.now().plusMonths(4))
                .project(banking)
                .build()
        ));
        
        // Healthcare System Epics
        Project healthcare = projects.get(2);
        epics.addAll(Arrays.asList(
            Epic.builder()
                .title("Patient Records")
                .description("Electronic health records management")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(3))
                .project(healthcare)
                .build(),
            Epic.builder()
                .title("Appointment Scheduling")
                .description("Appointment booking and management system")
                .startDate(LocalDate.now().plusMonths(1))
                .endDate(LocalDate.now().plusMonths(4))
                .project(healthcare)
                .build()
        ));
        
        return epicRepository.saveAll(epics);
    }

    private void assignWorkItemsToEpics(List<WorkItem> workItems, List<Epic> epics) {
        // Randomly assign some existing work items to epics
        for (WorkItem workItem : workItems) {
            if (random.nextBoolean()) {
                Epic randomEpic = epics.get(random.nextInt(epics.size()));
                if (workItem.getProject().getId().equals(randomEpic.getProject().getId())) {
                    workItem.setEpic(randomEpic);
                    workItemRepository.save(workItem);
                }
            }
        }
    }

    private List<WorkItem> createAdditionalWorkItems(Project project, List<Sprint> sprints, List<Epic> epics) {
        List<WorkItem> additionalWorkItems = new ArrayList<>();
        
        // Add more varied work items
        additionalWorkItems.addAll(Arrays.asList(
            WorkItem.builder()
                .title("Implement Caching Layer")
                .description("Add Redis caching for improved performance")
                .status(WorkItemStatus.TODO)
                .priority(WorkItemPriority.HIGH)
                .type(WorkItemType.TASK)
                .storyPoints(5)
                .location(WorkItemLocation.BACKLOG)
                .project(project)
                .build(),
            WorkItem.builder()
                .title("Mobile Responsive Design")
                .description("Ensure UI works well on mobile devices")
                .status(WorkItemStatus.TODO)
                .priority(WorkItemPriority.MEDIUM)
                .type(WorkItemType.STORY)
                .storyPoints(8)
                .location(WorkItemLocation.BACKLOG)
                .project(project)
                .build(),
            WorkItem.builder()
                .title("Payment Integration")
                .description("Integrate with payment gateway")
                .status(WorkItemStatus.TODO)
                .priority(WorkItemPriority.HIGH)
                .type(WorkItemType.STORY)
                .storyPoints(13)
                .location(WorkItemLocation.SPRINT)
                .project(project)
                .sprint(sprints.get(1))
                .build(),
            WorkItem.builder()
                .title("Search Optimization")
                .description("Improve search performance and accuracy")
                .status(WorkItemStatus.TODO)
                .priority(WorkItemPriority.MEDIUM)
                .type(WorkItemType.TASK)
                .storyPoints(5)
                .location(WorkItemLocation.SPRINT)
                .project(project)
                .sprint(sprints.get(2))
                .build(),
            WorkItem.builder()
                .title("Analytics Dashboard")
                .description("Create analytics dashboard for admins")
                .status(WorkItemStatus.TODO)
                .priority(WorkItemPriority.LOW)
                .type(WorkItemType.STORY)
                .storyPoints(8)
                .location(WorkItemLocation.BACKLOG)
                .project(project)
                .build()
        ));
        
        // Randomly assign some work items to epics
        List<Epic> projectEpics = epics.stream()
                .filter(epic -> epic.getProject().equals(project))
                .toList();
                
        if (!projectEpics.isEmpty()) {
            for (WorkItem workItem : additionalWorkItems) {
                if (random.nextBoolean()) {
                    Epic randomEpic = projectEpics.get(random.nextInt(projectEpics.size()));
                    workItem.setEpic(randomEpic);
                }
            }
        }
        
        return workItemRepository.saveAll(additionalWorkItems);
    }

    private void createCostsAndAssignments(List<Epic> epics, List<WorkItem> workItems) {
        // Create various types of costs
        List<Cost> costs = Arrays.asList(
            Cost.builder()
                .name("Development Tools")
                .description("Software licenses and development tools")
                .amount(5000.0)
                .category("Software")
                .build(),
            Cost.builder()
                .name("Cloud Infrastructure")
                .description("AWS cloud services")
                .amount(2000.0)
                .category("Infrastructure")
                .build(),
            Cost.builder()
                .name("UI/UX Design Tools")
                .description("Design software licenses")
                .amount(1000.0)
                .category("Software")
                .build(),
            Cost.builder()
                .name("Security Audit")
                .description("Third-party security assessment")
                .amount(8000.0)
                .category("Services")
                .build(),
            Cost.builder()
                .name("Training")
                .description("Team training and workshops")
                .amount(3000.0)
                .category("Training")
                .build(),
            Cost.builder()
                .name("Testing Tools")
                .description("QA and testing tools")
                .amount(1500.0)
                .category("Software")
                .build(),
            Cost.builder()
                .name("Database Licenses")
                .description("Database management system licenses")
                .amount(4000.0)
                .category("Software")
                .build(),
            Cost.builder()
                .name("Monitoring Tools")
                .description("Application monitoring and logging")
                .amount(2500.0)
                .category("Infrastructure")
                .build()
        );
        
        costs = costRepository.saveAll(costs);
        
        // Assign costs to epics and work items
        for (Cost cost : costs) {
            if (random.nextBoolean() && !epics.isEmpty()) {
                // Assign to random epic
                Epic epic = epics.get(random.nextInt(epics.size()));
                CostAssignment epicAssignment = CostAssignment.builder()
                    .cost(cost)
                    .epic(epic)
                    .build();
                costAssignmentRepository.save(epicAssignment);
            } else if (!workItems.isEmpty()) {
                // Assign to random work item
                WorkItem workItem = workItems.get(random.nextInt(workItems.size()));
                CostAssignment workItemAssignment = CostAssignment.builder()
                    .cost(cost)
                    .workItem(workItem)
                    .build();
                costAssignmentRepository.save(workItemAssignment);
            }
        }
    }

    private void createPersonAssignments(List<Person> persons, List<Epic> epics, List<WorkItem> workItems) {
        // Create assignments ensuring good distribution
        for (Person person : persons) {
            // Assign to 1-2 epics
            int epicAssignments = random.nextInt(2) + 1;
            for (int i = 0; i < epicAssignments && !epics.isEmpty(); i++) {
                Epic epic = epics.get(random.nextInt(epics.size()));
                PersonAssignment epicAssignment = PersonAssignment.builder()
                    .person(person)
                    .epic(epic)
                    .hours(random.nextDouble() * 40 + 20) // 20-60 hours
                    .description("Working on " + epic.getTitle())
                    .build();
                personAssignmentRepository.save(epicAssignment);
            }
            
            // Assign to 2-4 work items
            int workItemAssignments = random.nextInt(3) + 2;
            for (int i = 0; i < workItemAssignments && !workItems.isEmpty(); i++) {
                WorkItem workItem = workItems.get(random.nextInt(workItems.size()));
                PersonAssignment workItemAssignment = PersonAssignment.builder()
                    .person(person)
                    .workItem(workItem)
                    .hours(random.nextDouble() * 20 + 10) // 10-30 hours
                    .description("Assigned to " + workItem.getTitle())
                    .build();
                personAssignmentRepository.save(workItemAssignment);
            }
        }
    }
} 