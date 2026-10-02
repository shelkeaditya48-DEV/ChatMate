package com.chatmate.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "chats")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_message", nullable = false, columnDefinition = "TEXT")
    private String userMessage;

    @Column(name = "ai_response", nullable = false, columnDefinition = "TEXT")
    private String aiResponse;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "session_id")
    private Long sessionId;

    public Chat() {
    }

    public Chat(
            String userMessage,
            String aiResponse,
            Integer userId,
            Long sessionId
    ) {
        this.userMessage = userMessage;
        this.aiResponse = aiResponse;
        this.userId = userId;
        this.sessionId = sessionId;
    }

    public Integer getId() {
        return id;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public String getAiResponse() {
        return aiResponse;
    }

    public Integer getUserId() {
        return userId;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setUserMessage(String userMessage) {
        this.userMessage = userMessage;
    }

    public void setAiResponse(String aiResponse) {
        this.aiResponse = aiResponse;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }
}