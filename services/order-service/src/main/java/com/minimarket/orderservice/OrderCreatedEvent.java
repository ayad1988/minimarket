package com.minimarket.orderservice;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Event published on the order.created topic. Keep in sync with notification-service. */
public record OrderCreatedEvent(UUID orderId, String customerEmail, BigDecimal totalAmount, Instant createdAt) {
}
