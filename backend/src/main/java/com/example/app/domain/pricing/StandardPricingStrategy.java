package com.example.app.domain.pricing;

import com.example.app.domain.event.Event;
import java.math.BigDecimal;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Default strategy: returns the stored price unchanged.
 * Active whenever the {@code promo} profile is NOT enabled.
 */
@Component
@Profile("!promo")
public class StandardPricingStrategy implements PricingStrategy {

    @Override
    public BigDecimal displayPrice(Event event) {
        return event.getPrice();
    }
}
