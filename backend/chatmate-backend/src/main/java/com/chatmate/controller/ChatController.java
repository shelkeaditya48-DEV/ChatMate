package com.chatmate.controller;

import com.chatmate.entity.Chat;
import com.chatmate.entity.ChatSession;
import com.chatmate.repository.ChatRepository;
import com.chatmate.repository.ChatSessionRepository;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;

import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class ChatController {

    private final Client client;
    private final ChatRepository chatRepository;
    private final ChatSessionRepository sessionRepository;

    public ChatController(
            ChatRepository chatRepository,
            ChatSessionRepository sessionRepository
    ) {

        this.chatRepository = chatRepository;
        this.sessionRepository = sessionRepository;

        client = Client.builder()
                .apiKey(System.getenv("GEMINI_API_KEY"))
                .build();
    }


    // =========================================
    // TEST
    // =========================================

    @GetMapping("/api/chat/test")
    public String test() {
        return "ChatMate Backend is connected successfully!";
    }


    // =========================================
    // CREATE NEW SESSION
    // =========================================

    @PostMapping("/api/chat/session")
    public ChatSession createSession(
            @RequestHeader("X-User-Id") Integer userId
    ) {

        ChatSession session =
                new ChatSession(
                        userId,
                        "New Conversation"
                );

        return sessionRepository.save(session);
    }


    // =========================================
    // GET USER SESSIONS
    // =========================================

    @GetMapping("/api/chat/sessions")
    public List<ChatSession> getSessions(
            @RequestParam Integer userId
    ) {

        return sessionRepository
                .findByUserIdOrderByPinnedDescUpdatedAtDesc(userId);
    }


    // =========================================
    // GET SESSION MESSAGES
    // =========================================

    @GetMapping("/api/chat/session/{sessionId}")
    public List<Chat> getSessionMessages(
            @PathVariable Long sessionId,
            @RequestParam Integer userId
    ) {

        var session =
                sessionRepository.findByIdAndUserId(
                        sessionId,
                        userId
                );

        if (session.isEmpty()) {
            return List.of();
        }

        return chatRepository
                .findBySessionIdOrderByIdAsc(sessionId);
    }


    // =========================================
    // SEND MESSAGE
    // =========================================

    @PostMapping("/api/chat")
    public String chat(
            @RequestBody String message,
            @RequestHeader("X-User-Id") Integer userId,
            @RequestHeader("X-Session-Id") Long sessionId
    ) {

        try {

            var sessionOptional =
                    sessionRepository.findByIdAndUserId(
                            sessionId,
                            userId
                    );

            if (sessionOptional.isEmpty()) {
                return "⚠️ Chat session not found.";
            }

            ChatSession session =
                    sessionOptional.get();


            // =====================================
            // GET PREVIOUS MESSAGES
            // =====================================

            List<Chat> previousMessages =
                    chatRepository
                            .findBySessionIdOrderByIdAsc(sessionId);


            StringBuilder prompt =
                    new StringBuilder();


            prompt.append(
                    "You are ChatMate, an AI learning and coding assistant.\n\n"
                    + "LANGUAGE RULE:\n"
                    + "Always answer in the same language and style used by the user.\n"
                    + "If Marathi, reply in Marathi.\n"
                    + "If Hindi, reply in Hindi.\n"
                    + "If English, reply in English.\n"
                    + "If mixed language, reply in the same mixed style.\n\n"
                    + "FORMATTING RULE:\n"
                    + "Use clear headings when useful.\n"
                    + "Use numbered lists for multiple points.\n"
                    + "Use bullet points where appropriate.\n"
                    + "For programming code, use code blocks.\n"
                    + "Keep answers beginner-friendly.\n\n"
            );


            prompt.append("Previous Conversation:\n");


            for (Chat chat : previousMessages) {

                prompt.append(
                        "User: "
                                + chat.getUserMessage()
                                + "\n"
                );

                prompt.append(
                        "ChatMate: "
                                + chat.getAiResponse()
                                + "\n"
                );
            }


            prompt.append(
                    "\nUser: "
                            + message
                            + "\n\nChatMate:"
            );


            // =====================================
            // GEMINI
            // =====================================

            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-3.5-flash-lite",
                            prompt.toString(),
                            null
                    );


            String reply =
                    response.text();


            // =====================================
            // SAVE MESSAGE
            // =====================================

            Chat chat =
                    new Chat(
                            message,
                            reply,
                            userId,
                            sessionId
                    );

            chatRepository.save(chat);


            // =====================================
            // FIRST MESSAGE = SESSION TITLE
            // =====================================

            if (
                    session.getTitle()
                            .equals("New Conversation")
            ) {

                String title =
                        message.trim();

                if (title.length() > 45) {

                    title =
                            title.substring(0, 45)
                                    .trim()
                                    + "...";
                }

                session.setTitle(title);
            }


            sessionRepository.save(session);


            return reply;


        } catch (Exception e) {

            e.printStackTrace();

            return "⚠️ AI is temporarily unavailable. Please try again later.";
        }
    }


    // =========================================
    // RENAME SESSION
    // =========================================

    @PutMapping("/api/chat/session/{sessionId}/rename")
    public String renameSession(
            @PathVariable Long sessionId,
            @RequestParam Integer userId,
            @RequestBody String newTitle
    ) {

        var sessionOptional =
                sessionRepository.findByIdAndUserId(
                        sessionId,
                        userId
                );

        if (sessionOptional.isEmpty()) {
            return "Session not found";
        }

        ChatSession session =
                sessionOptional.get();

        String title =
                newTitle.trim();

        if (title.length() > 60) {
            title = title.substring(0, 60);
        }

        session.setTitle(title);

        sessionRepository.save(session);

        return "Renamed successfully";
    }


    // =========================================
    // PIN / UNPIN
    // =========================================

    @PutMapping("/api/chat/session/{sessionId}/pin")
    public String togglePin(
            @PathVariable Long sessionId,
            @RequestParam Integer userId
    ) {

        var sessionOptional =
                sessionRepository.findByIdAndUserId(
                        sessionId,
                        userId
                );

        if (sessionOptional.isEmpty()) {
            return "Session not found";
        }

        ChatSession session =
                sessionOptional.get();

        session.setPinned(
                !session.isPinned()
        );

        sessionRepository.save(session);

        return session.isPinned()
                ? "Pinned"
                : "Unpinned";
    }


    // =========================================
    // DELETE SESSION
    // =========================================

    @DeleteMapping("/api/chat/session/{sessionId}")
    public String deleteSession(
            @PathVariable Long sessionId,
            @RequestParam Integer userId
    ) {

        var sessionOptional =
                sessionRepository.findByIdAndUserId(
                        sessionId,
                        userId
                );

        if (sessionOptional.isEmpty()) {
            return "Session not found";
        }


        List<Chat> messages =
                chatRepository
                        .findBySessionIdOrderByIdAsc(sessionId);


        chatRepository.deleteAll(messages);

        sessionRepository.delete(
                sessionOptional.get()
        );


        return "Deleted successfully";
    }

}