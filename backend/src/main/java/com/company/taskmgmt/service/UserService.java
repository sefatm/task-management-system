package com.company.taskmgmt.service;

import com.company.taskmgmt.dto.UserRequest;
import com.company.taskmgmt.dto.UserResponse;
import com.company.taskmgmt.entity.Role;
import com.company.taskmgmt.entity.User;
import com.company.taskmgmt.exception.BadRequestException;
import com.company.taskmgmt.exception.ConflictException;
import com.company.taskmgmt.exception.ResourceNotFoundException;
import com.company.taskmgmt.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUserService currentUser;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, CurrentUserService currentUser) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.currentUser = currentUser;
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> list(String query, Pageable pageable) {
        return userRepository.search(query == null ? "" : query.trim(), pageable).map(UserResponse::from);
    }

    @Transactional(readOnly = true)
    public UserResponse get(Long id) {
        return UserResponse.from(find(id));
    }

    public UserResponse create(UserRequest r) {
        if (r.password() == null || r.password().isBlank()) {
            throw new BadRequestException("Password is required when creating a user");
        }
        if (userRepository.existsByEmail(r.email())) {
            throw new ConflictException("A user with this email already exists");
        }
        User u = new User();
        apply(u, r);
        u.setPassword(passwordEncoder.encode(r.password()));     // never store plain text
        return UserResponse.from(userRepository.save(u));
    }

    public UserResponse update(Long id, UserRequest r) {
        User u = find(id);
        if (!u.getEmail().equalsIgnoreCase(r.email()) && userRepository.existsByEmail(r.email())) {
            throw new ConflictException("A user with this email already exists");
        }
        apply(u, r);
        if (r.password() != null && !r.password().isBlank()) {
            u.setPassword(passwordEncoder.encode(r.password()));
        }
        return UserResponse.from(u);                              // managed entity -> flushed on commit
    }

    /** Soft delete: keeps task history intact (FK safe) while blocking login. */
    public void delete(Long id) {
        if (id.equals(currentUser.get().getId())) {
            throw new BadRequestException("You cannot delete your own account");
        }
        find(id).setActive(false);
    }

    private void apply(User u, UserRequest r) {
        u.setFullName(r.fullName().trim());
        u.setEmail(r.email().trim().toLowerCase());
        u.setRole(r.role());
        if (r.role() == Role.EMPLOYEE && r.managerId() != null) {
            User manager = find(r.managerId());
            if (manager.getRole() != Role.MANAGER) {
                throw new BadRequestException("managerId must refer to a user with the MANAGER role");
            }
            u.setManager(manager);
        } else {
            u.setManager(null);
        }
    }

    private User find(Long id) {
        return userRepository.findById(id).filter(User::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("User " + id + " not found"));
    }
}
