package com.chatmate.repository;

import com.chatmate.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatSessionRepository
        extends JpaRepository<ChatSession, Long> {

    List<ChatSession> findByUserIdOrderByPinnedDescUpdatedAtDesc(
            Integer userId
    );

    Optional<ChatSession> findByIdAndUserId(
            Long id,
            Integer userId
    );
}