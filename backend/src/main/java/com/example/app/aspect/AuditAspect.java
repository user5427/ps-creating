package com.example.app.aspect;

import com.example.app.web.ActorContext;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Quality requirement #7 (AOP / cross-cutting logging):
 * Wraps every method annotated {@link Audited} and emits a structured log
 * line with actor id + role, class + method, duration, and outcome.
 * Toggled via {@code app.audit.enabled} in {@code application.yml} — no
 * recompilation required, which is the course requirement.
 */
@Aspect
@Component
@ConditionalOnProperty(name = "app.audit.enabled", havingValue = "true", matchIfMissing = true)
public class AuditAspect {

    private static final Logger log = LoggerFactory.getLogger(AuditAspect.class);

    private final ObjectProvider<ActorContext> actorContextProvider;

    public AuditAspect(ObjectProvider<ActorContext> actorContextProvider) {
        this.actorContextProvider = actorContextProvider;
    }

    @Around("@annotation(com.example.app.aspect.Audited)")
    public Object audit(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        MethodSignature signature = (MethodSignature) pjp.getSignature();
        String target = signature.getDeclaringType().getSimpleName() + "." + signature.getName();

        String actor = describeActor();
        try {
            Object result = pjp.proceed();
            log.info("AUDIT target={} actor={} duration={}ms outcome=SUCCESS",
                    target, actor, System.currentTimeMillis() - start);
            return result;
        } catch (Throwable t) {
            log.warn("AUDIT target={} actor={} duration={}ms outcome=FAILURE cause={}",
                    target, actor, System.currentTimeMillis() - start, t.getClass().getSimpleName());
            throw t;
        }
    }

    private String describeActor() {
        try {
            ActorContext ctx = actorContextProvider.getIfAvailable();
            if (ctx == null || ctx.getActorId() == null) {
                return "anonymous";
            }
            return ctx.getActorId() + "/" + ctx.getRole();
        } catch (Exception e) {
            // ActorContext is request-scoped — outside a request, just note that.
            return "system";
        }
    }
}
