package com.chatmate.repository;

import com.chatmate.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatRepository
        extends JpaRepository<Chat, Integer> {

    List<Chat> findBySessionIdOrderByIdAsc(Long sessionId);
}