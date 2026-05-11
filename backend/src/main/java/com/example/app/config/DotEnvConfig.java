package com.example.app.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

/**
 * Loads environment variables from .env file on application startup.
 * This enables local development with environment-specific configuration.
 */
@Configuration
public class DotEnvConfig {

    static {
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();
        
        dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), entry.getValue())
        );
    }
}
