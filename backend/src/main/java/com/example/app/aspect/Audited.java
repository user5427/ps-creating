package com.example.app.aspect;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a method whose invocation should be recorded by {@link AuditAspect}.
 * Placed on service-layer methods that represent business-meaningful actions
 * (create event, update event, etc.).
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Audited {

    String value() default "";
}
