package com.example.app.domain.pricing;

import com.example.app.domain.event.Event;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Promotional strategy: applies a flat discount to every event.
 * Active whenever the {@code promo} profile is enabled
 * (for example, {@code SPRING_PROFILES_ACTIVE=dev,promo}).
 */
@Component
@Profile("promo")
public class DiscountedPricingStrategy implements PricingStrategy {

    private static final BigDecimal DISCOUNT_FACTOR = new BigDecimal("0.80");

    @Override
    public BigDecimal displayPrice(Event event) {
        return event.getPrice()
                .multiply(DISCOUNT_FACTOR)
                .setScale(2, RoundingMode.HALF_UP);
    }
}
