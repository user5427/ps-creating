package com.example.app.config;

import com.example.app.web.ActorInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final ActorInterceptor actorInterceptor;

    public WebConfig(ActorInterceptor actorInterceptor) {
        this.actorInterceptor = actorInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(actorInterceptor).addPathPatterns("/api/**");
    }
}
