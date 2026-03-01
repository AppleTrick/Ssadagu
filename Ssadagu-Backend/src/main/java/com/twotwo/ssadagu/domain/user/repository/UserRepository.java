package com.twotwo.ssadagu.domain.user.repository;

import com.twotwo.ssadagu.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
