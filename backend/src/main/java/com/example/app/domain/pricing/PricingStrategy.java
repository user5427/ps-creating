package com.example.app.domain.pricing;

import com.example.app.domain.event.Event;
import java.math.BigDecimal;

/**
 * Quality requirement #8 — Strategy pattern.
 * Implementations are swapped via Spring profile (see {@link StandardPricingStrategy}
 * and {@link DiscountedPricingStrategy}). No recompilation required; activate a
 * different implementation by setting {@code SPRING_PROFILES_ACTIVE=dev,promo}.
 */
public interface PricingStrategy {

    BigDecimal displayPrice(Event event);
}
