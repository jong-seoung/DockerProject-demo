package com.jong.spring_registry_demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HelloController {

    @GetMapping("/")
    public Map<String, Object> hello() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "🐳 Docker Registry 실습용 Spring Boot API");
        response.put("version", "1.0.0");
        response.put("timestamp", LocalDateTime.now());
        response.put("status", "running");
        return response;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "spring-registry-demo");
        health.put("uptime", "running");
        return health;
    }

    @GetMapping("/info")
    public Map<String, Object> info() {
        Map<String, Object> info = new HashMap<>();
        info.put("app", "Spring Boot Registry Demo");
        info.put("description", "Docker Hub에 배포된 Spring Boot 애플리케이션");
        info.put("java_version", System.getProperty("java.version"));
        info.put("os", System.getProperty("os.name"));
        info.put("architecture", System.getProperty("os.arch"));
        return info;
    }
}