package com.company.taskmgmt.repository;

import com.company.taskmgmt.entity.Role;
import com.company.taskmgmt.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByActiveTrue();

    long countByManagerIdAndActiveTrue(Long managerId);

    List<User> findByRoleAndActiveTrueOrderByFullName(Role role);

    List<User> findByManagerIdAndActiveTrueOrderByFullName(Long managerId);

    /** F-08: search active users by name or e-mail (empty string matches everyone). */
    @Query("""
           select u from User u
           where u.active = true
             and (lower(u.fullName) like lower(concat('%', :q, '%'))
               or lower(u.email)    like lower(concat('%', :q, '%')))
           """)
    Page<User> search(@Param("q") String q, Pageable pageable);
}
